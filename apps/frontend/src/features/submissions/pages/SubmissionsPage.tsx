import { getProblems, getSubmissions, type Problem } from '@/api';
import type { Submission } from '@/api/submissions.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/features/dashboard/components/StatusBadge';
import { getCurrentUser } from '@/lib/tokenStore';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

function formatLanguage(language: string): string {
  return language.charAt(0).toUpperCase() + language.slice(1).toLowerCase();
}

function shortId(id: string): string {
  return id.slice(0, 8) + '...';
}

export function SubmissionsPage() {
  const user = getCurrentUser();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const submissionByProblem = useMemo(() => {
    const map = new Map<string, Submission[]>();
    for (const submission of submissions) {
      const bucket = map.get(submission.problemId) ?? [];
      bucket.push(submission);
      map.set(submission.problemId, bucket);
    }
    return map;
  }, [submissions]);

  const problemTitleById = useMemo(
    () => new Map(problems.map((problem) => [problem.id, problem.title])),
    [problems]
  );

  const recentSubmissions = useMemo(
    () => [...submissions].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 15),
    [submissions]
  );

  useEffect(() => {
    const loadData = async () => {
      setErrorMessage(null);
      try {
        const [problemData, submissionData] = await Promise.all([getProblems(), getSubmissions()]);
        setProblems(problemData);
        setSubmissions(submissionData);
      } catch {
        setErrorMessage('Unable to load submissions data.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, []);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading submissions...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Submission Workspace</h1>
        <p className="text-sm text-muted-foreground">Signed in as {user?.email}</p>
      </div>

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Available Problems</CardTitle>
          <CardDescription>Choose a published problem and submit your solution.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {problems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No published problems are currently available.
            </p>
          ) : (
            problems.map((problem) => {
              const attempts = submissionByProblem.get(problem.id) ?? [];
              const latest = attempts[0];
              return (
                <div
                  key={problem.id}
                  className="flex flex-col gap-2 rounded-md border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium">{problem.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {problem.difficulty} • {problem.timeLimitMs}ms • {problem.memoryLimitMb}MB •{' '}
                      {attempts.length} attempts
                    </p>
                    {latest ? (
                      <p className="text-xs text-muted-foreground">
                        Latest status: {latest.status.replace(/_/g, ' ')}
                      </p>
                    ) : null}
                  </div>
                  <Button asChild>
                    <Link to={`/solve/${problem.id}`}>Solve</Link>
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>Track your latest attempts across all problems.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No submissions yet.</p>
          ) : (
            recentSubmissions.map((submission) => (
              <Link
                key={submission.id}
                to={`/submissions/${submission.id}`}
                className="flex flex-col gap-2 rounded-md border p-3 text-sm hover:bg-muted md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {problemTitleById.get(submission.problemId) ?? 'Unknown problem'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    #{shortId(submission.id)} • {formatLanguage(submission.language)} •{' '}
                    {formatDate(submission.submittedAt)}
                  </p>
                </div>
                <StatusBadge status={submission.status} />
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
