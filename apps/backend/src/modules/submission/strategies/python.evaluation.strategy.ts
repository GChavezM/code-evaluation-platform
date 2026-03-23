import Docker from 'dockerode';
import { ProgramingLanguage } from '../../../generated/prisma/enums.js';
import type {
  IEvaluationStrategy,
  SubmissionExcecutionContext,
  TestCaseInput,
  TestCaseResult,
} from './evaluation.strategy.js';
import type { IEvaluationQueue } from '../../../queues/evaluation.queue.js';
import { SubmissionStatus, type Submission } from '../../../generated/prisma/client.js';
import { chmod, mkdtemp, rm, writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const PYTHON_IMAGE = 'python:3.12-slim';

function hasStatusCode(value: unknown): value is { StatusCode: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'StatusCode' in value &&
    typeof value.StatusCode === 'number'
  );
}

function parseDockerLog(buffer: Buffer): { stdout: string; stderr: string } {
  const stdoutParts: Buffer[] = [];
  const stderrParts: Buffer[] = [];
  let offset = 0;
  while (offset + 8 <= buffer.length) {
    const streamType = buffer[offset];
    const payloadSize = buffer.readUInt32BE(offset + 4);
    offset += 8;

    if (offset + payloadSize > buffer.length) {
      break;
    }

    const payload = buffer.subarray(offset, offset + payloadSize);
    if (streamType === 1) {
      stdoutParts.push(payload);
    } else if (streamType === 2) {
      stderrParts.push(payload);
    }
    offset += payloadSize;
  }

  return {
    stdout: Buffer.concat(stdoutParts).toString('utf-8'),
    stderr: Buffer.concat(stderrParts).toString('utf-8'),
  };
}

export class PythonEvaluationStrategy implements IEvaluationStrategy {
  readonly language = ProgramingLanguage.PYTHON;

  private readonly docker: Docker;
  private readonly queue: IEvaluationQueue;

  constructor(queue: IEvaluationQueue) {
    this.docker = new Docker();
    this.queue = queue;
  }

  async enqueue(submission: Submission): Promise<string> {
    return this.queue.add({
      submissionId: submission.id,
      sourceCode: submission.sourceCode,
      language: submission.language,
      problemId: submission.problemId,
    });
  }

  async execute(context: SubmissionExcecutionContext): Promise<TestCaseResult[]> {
    const results: TestCaseResult[] = [];

    for (const testCase of context.testCases) {
      const result = await this.runSingleTestCase(
        context.sourceCode,
        testCase,
        context.timeLimitMs,
        context.memoryLimitMb
      );
      results.push(result);

      if (result.status === SubmissionStatus.COMPILATION_ERROR) {
        const rest = context.testCases.slice(results.length).map(
          (tc): TestCaseResult => ({
            testCaseId: tc.id,
            status: SubmissionStatus.COMPILATION_ERROR,
            actualOutput: null,
            executionTimeMs: null,
            memoryUsageMb: null,
          })
        );
        results.push(...rest);
        break;
      }
    }

    return results;
  }

  private async runSingleTestCase(
    sourceCode: string,
    testCase: TestCaseInput,
    timeLimitMs: number,
    memoryLimitMb: number
  ): Promise<TestCaseResult> {
    const sandboxDir = await mkdtemp(join(tmpdir(), 'gshield-'));

    try {
      await chmod(sandboxDir, 0o755);
      await writeFile(join(sandboxDir, 'solution.py'), sourceCode, 'utf-8');
      await writeFile(join(sandboxDir, 'input.txt'), testCase.input, 'utf-8');
      await chmod(join(sandboxDir, 'solution.py'), 0o644);
      await chmod(join(sandboxDir, 'input.txt'), 0o644);

      return await this.runContainer(sandboxDir, testCase, timeLimitMs, memoryLimitMb);
    } finally {
      await rm(sandboxDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  private async runContainer(
    sandboxDir: string,
    testCase: TestCaseInput,
    timeLimitMs: number,
    memoryLimitMb: number
  ): Promise<TestCaseResult> {
    const memoryBytes = memoryLimitMb * 1024 * 1024;

    const container = await this.docker.createContainer({
      Image: PYTHON_IMAGE,
      Cmd: ['sh', '-c', 'python /sandbox/solution.py < /sandbox/input.txt'],
      AttachStdout: true,
      AttachStderr: true,
      NetworkDisabled: true,
      HostConfig: {
        Memory: memoryBytes,
        MemorySwap: memoryBytes,
        NanoCpus: 500_000_000, // Limit to 0.5 CPU
        NetworkMode: 'none',
        Binds: [`${sandboxDir}:/sandbox:ro`],
        PidsLimit: 64,
        CapDrop: ['ALL'],
        SecurityOpt: ['no-new-privileges:true'],
        AutoRemove: false,
      },
    });

    let killedByTimeout = false;
    let exitCode = 0;
    const startTime = Date.now();

    try {
      await container.start();

      const timeoutHandle = setTimeout(() => {
        killedByTimeout = true;
        container.kill({ signal: 'SIGKILL' }).catch(() => {});
      }, timeLimitMs);

      const waitResult: unknown = await container.wait();
      clearTimeout(timeoutHandle);
      exitCode = hasStatusCode(waitResult) ? waitResult.StatusCode : 1;
    } catch {
      await container.remove({ force: true }).catch(() => {});
      return {
        testCaseId: testCase.id,
        status: killedByTimeout
          ? SubmissionStatus.TIME_LIMIT_EXCEEDED
          : SubmissionStatus.RUNTIME_ERROR,
        actualOutput: null,
        executionTimeMs: Date.now() - startTime,
        memoryUsageMb: null,
      };
    }

    const executionTimeMs = Date.now() - startTime;

    let oomKilled = false;
    if (!killedByTimeout && exitCode === 137) {
      const info = await container.inspect().catch(() => null);
      oomKilled = info?.State?.OOMKilled || false;
    }

    let stdout = '';
    let stderr = '';

    try {
      const logBuffer = await container.logs({ stdout: true, stderr: true, follow: false });
      console.log(
        `[PythonEvaluationStrategy] Raw Docker log for test case ${testCase.id}:\n${logBuffer.toString('utf-8')}`
      );
      ({ stdout, stderr } = parseDockerLog(logBuffer));
    } catch {
      /* empty */
    }

    await container.remove({ force: true }).catch(() => {});

    const status = this.determineStatus(
      exitCode,
      killedByTimeout,
      oomKilled,
      stdout.trimEnd(),
      testCase.expectedOutput.trimEnd(),
      stderr
    );

    return {
      testCaseId: testCase.id,
      status,
      actualOutput: stdout.trimEnd() || null,
      executionTimeMs,
      memoryUsageMb: null,
    };
  }

  private determineStatus(
    exitCode: number,
    killedByTimeout: boolean,
    oomKilled: boolean,
    actualOutput: string,
    expectedOutput: string,
    stderr: string
  ): SubmissionStatus {
    if (killedByTimeout) {
      return SubmissionStatus.TIME_LIMIT_EXCEEDED;
    }

    if (oomKilled) {
      return SubmissionStatus.MEMORY_LIMIT_EXCEEDED;
    }

    if (exitCode !== 0) {
      return this.isPythonSyntaxError(stderr)
        ? SubmissionStatus.COMPILATION_ERROR
        : SubmissionStatus.RUNTIME_ERROR;
    }

    return actualOutput === expectedOutput
      ? SubmissionStatus.ACCEPTED
      : SubmissionStatus.WRONG_ANSWER;
  }

  private isPythonSyntaxError(stderr: string): boolean {
    return (
      (stderr.includes('SyntaxError') || stderr.includes('IndentationError')) &&
      stderr.includes('TabError')
    );
  }
}
