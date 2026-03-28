import { getSubmission } from '@/api';
import type { SubmissionResult, SubmissionStatus } from '@/api/submissions.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAccessToken, getCurrentUser } from '@/lib/tokenStore';
import { io, type Socket } from 'socket.io-client';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';

type SubmissionLifecycleEvent =
  | {
      type: 'queued';
      submissionId: string;
      userId: string;
      language: string;
      queueJobId: string;
    }
  | {
      type: 'status';
      submissionId: string;
      userId: string;
      status: SubmissionStatus;
    }
  | {
      type: 'result';
      submissionId: string;
      userId: string;
      result: SubmissionResult;
    }
  | {
      type: 'progress';
      submissionId: string;
      userId: string;
      completed: number;
      total: number;
    };

type SubmissionDetail = {
  id: string;
  sourceCode: string;
  language: string;
  status: SubmissionStatus;
  submittedAt: string;
  queueJobId: string | null;
  userId: string;
  problemId: string;
  problem: {
    id: string;
    title: string;
    description: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    timeLimitMs: number;
    memoryLimitMb: number;
    isPublished: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
  };
  submissionResults: SubmissionResult[];
};

const TERMINAL_STATUSES: SubmissionStatus[] = [
  'ACCEPTED',
  'WRONG_ANSWER',
  'TIME_LIMIT_EXCEEDED',
  'MEMORY_LIMIT_EXCEEDED',
  'RUNTIME_ERROR',
  'COMPILATION_ERROR',
];

function getSocketBaseUrl(): string {
  const apiUrl = String(import.meta.env['VITE_API_URL'] ?? '');
  if (apiUrl.startsWith('http://') || apiUrl.startsWith('https://')) {
    return new URL(apiUrl).origin;
  }

  return window.location.origin;
}

function formatStatus(status: SubmissionStatus): string {
  return status.replaceAll('_', ' ');
}

export function SubmissionDetailPage() {
  const { id } = useParams();
  const user = getCurrentUser();

  const [submission, setSubmission] = useState<SubmissionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [socketState, setSocketState] = useState<'connecting' | 'connected' | 'disconnected'>(
    'connecting'
  );
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setErrorMessage('Submission id is missing.');
        setIsLoading(false);
        return;
      }

      setErrorMessage(null);
      try {
        const data = (await getSubmission(id)) as SubmissionDetail;
        setSubmission(data);
        setProgress(null);
      } catch {
        setErrorMessage('Unable to load submission details.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [id]);

  useEffect(() => {
    if (!id || !submission) {
      return;
    }

    if (TERMINAL_STATUSES.includes(submission.status)) {
      return;
    }

    const token = getAccessToken();
    if (!token) {
      return;
    }

    const socket: Socket = io(getSocketBaseUrl(), {
      transports: ['websocket'],
      auth: { token },
    });

    setSocketState('connecting');

    socket.on('connect', () => {
      setSocketState('connected');
      socket.emit('submission:subscribe', { submissionId: id });
      void getSubmission(id)
        .then((fresh) => setSubmission(fresh as SubmissionDetail))
        .catch(() => {
          // Keep current state when reconnect refresh fails.
        });
    });

    socket.on('disconnect', () => {
      setSocketState('disconnected');
    });

    socket.on('submission:update', (event: SubmissionLifecycleEvent) => {
      if (event.submissionId !== id) {
        return;
      }

      if (event.type === 'queued') {
        setSubmission((prev) => {
          if (!prev) {
            return prev;
          }

          return { ...prev, queueJobId: event.queueJobId };
        });
        return;
      }

      if (event.type === 'progress') {
        setProgress({ completed: event.completed, total: event.total });
        return;
      }

      void getSubmission(id)
        .then((fresh) => setSubmission(fresh as SubmissionDetail))
        .catch(() => {
          // Keep current state when refresh fails.
        });
    });

    socket.on('submission:error', (payload: { message?: string }) => {
      setErrorMessage(payload.message ?? 'Live updates unavailable for this submission.');
    });

    return () => {
      socket.emit('submission:unsubscribe', { submissionId: id });
      socket.disconnect();
    };
  }, [id, submission]);

  const sortedResults = useMemo(() => {
    return [...(submission?.submissionResults ?? [])].sort(
      (a, b) => (a.testCase?.order ?? 0) - (b.testCase?.order ?? 0)
    );
  }, [submission]);

  const progressPercent = useMemo(() => {
    if (progress && progress.total > 0) {
      return Math.min((progress.completed / progress.total) * 100, 100);
    }

    if (!submission) {
      return 0;
    }

    if (TERMINAL_STATUSES.includes(submission.status)) {
      return 100;
    }

    if (submission.status === 'RUNNING') {
      return 55;
    }

    if (submission.status === 'PENDING') {
      return 15;
    }

    return 0;
  }, [progress, submission]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading submission...</p>;
  }

  if (!submission) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Submission unavailable</CardTitle>
          <CardDescription>
            {errorMessage ?? 'This submission could not be loaded.'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Submission {submission.id.slice(0, 8)}...</h1>
          <p className="text-sm text-muted-foreground">Owner: {user?.email ?? submission.userId}</p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/submissions">Back to Submissions</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Problem Reference</CardTitle>
          <CardDescription>
            {submission.problem.difficulty} • {submission.problem.timeLimitMs}ms •{' '}
            {submission.problem.memoryLimitMb}MB
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-lg font-medium text-foreground">{submission.problem.title}</p>
          </div>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {submission.problem.description}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evaluation Progress</CardTitle>
          <CardDescription>
            Status: {formatStatus(submission.status)} • Socket: {socketState}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${progressPercent}%`,
              }}
            />
          </div>
          {errorMessage ? <p className="mt-3 text-sm text-destructive">{errorMessage}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Case Results</CardTitle>
          <CardDescription>
            Updates are streamed as the worker persists each result.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedResults.length === 0 ? (
            <p className="text-sm text-muted-foreground">No test case results yet.</p>
          ) : (
            sortedResults.map((result) => (
              <div key={result.id} className="rounded-md border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">Test case #{result.testCase.order}</p>
                  <span className="text-xs text-muted-foreground">
                    {formatStatus(result.status)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Time: {result.executionTimeMs ?? '-'}ms • Memory: {result.memoryUsedMb ?? '-'}MB
                </p>
                {result.actualOutput ? (
                  <pre className="mt-2 overflow-auto rounded-md bg-muted p-2 text-xs">
                    {result.actualOutput}
                  </pre>
                ) : null}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
