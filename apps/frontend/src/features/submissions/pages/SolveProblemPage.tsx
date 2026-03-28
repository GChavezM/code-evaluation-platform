import { createSubmission, getProblem } from '@/api';
import type { ProblemWithTestCases } from '@/api/problems.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Editor from '@monaco-editor/react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

const DEFAULT_CODE = `def solve():
    # Read input from stdin and print output to stdout
    pass

if __name__ == '__main__':
    solve()
`;

export function SolveProblemPage() {
  const { problemId } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState<ProblemWithTestCases | null>(null);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [language, setLanguage] = useState<'PYTHON'>('PYTHON');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editorTheme, setEditorTheme] = useState<'vs' | 'vs-dark'>('vs');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateEditorTheme = () => {
      const root = document.documentElement;
      const isDark = root.classList.contains('dark') || mediaQuery.matches;
      setEditorTheme(isDark ? 'vs-dark' : 'vs');
    };

    updateEditorTheme();

    mediaQuery.addEventListener('change', updateEditorTheme);

    const observer = new MutationObserver(updateEditorTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      mediaQuery.removeEventListener('change', updateEditorTheme);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const loadProblem = async () => {
      if (!problemId) {
        setErrorMessage('Problem id is missing.');
        setIsLoading(false);
        return;
      }

      try {
        const loaded = await getProblem(problemId);
        setProblem(loaded);
      } catch {
        setErrorMessage('Unable to load this problem.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadProblem();
  }, [problemId]);

  const sampleCases = useMemo(
    () => (problem?.testCases ?? []).filter((testCase) => testCase.isSample),
    [problem]
  );

  const handleSubmit = async () => {
    if (!problem) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const created = await createSubmission({
        problemId: problem.id,
        language,
        sourceCode: code,
      });
      void navigate(`/submissions/${created.id}`);
    } catch {
      setErrorMessage('Submission failed. Check your code and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading problem...</p>;
  }

  if (!problem) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Problem unavailable</CardTitle>
          <CardDescription>{errorMessage ?? 'Could not load this problem.'}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{problem.title}</h1>
          <p className="text-sm text-muted-foreground">
            {problem.difficulty} • {problem.timeLimitMs}ms • {problem.memoryLimitMb}MB
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/submissions">Back to Submissions</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Problem Statement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{problem.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Code Editor</CardTitle>
          <CardDescription>
            Write your solution and submit for asynchronous evaluation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <select
              className="h-9 rounded-md border border-input bg-background px-2.5 text-sm"
              value={language}
              onChange={(event) => setLanguage(event.target.value as 'PYTHON')}
            >
              <option value="PYTHON">Python</option>
            </select>

            <Button onClick={() => void handleSubmit()} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Solution'}
            </Button>
          </div>

          <div className="overflow-hidden rounded-md border">
            <Editor
              height="420px"
              defaultLanguage="python"
              theme={editorTheme}
              value={code}
              onChange={(value) => setCode(value ?? '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbersMinChars: 3,
                automaticLayout: true,
              }}
            />
          </div>

          {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sample Test Cases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sampleCases.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sample test cases available.</p>
          ) : (
            sampleCases.map((testCase) => (
              <div key={testCase.id} className="grid gap-3 rounded-md border p-3 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                    Input
                  </p>
                  <pre className="overflow-auto rounded-md bg-muted p-2 text-xs">
                    {testCase.input}
                  </pre>
                </div>
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                    Expected Output
                  </p>
                  <pre className="overflow-auto rounded-md bg-muted p-2 text-xs">
                    {testCase.expectedOutput}
                  </pre>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
