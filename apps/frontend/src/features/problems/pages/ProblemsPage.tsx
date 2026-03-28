import { deleteProblem, getProblems, type Problem } from '@/api/problems.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, PencilLine, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';

export function ProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const publishedCount = useMemo(
    () => problems.filter((problem) => problem.isPublished).length,
    [problems]
  );

  const fetchProblems = async () => {
    setErrorMessage(null);
    try {
      const data = await getProblems();
      setProblems(data);
    } catch {
      setErrorMessage('Unable to load problems.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchProblems();
  }, []);

  const handleDelete = async (problemId: string) => {
    const confirmed = window.confirm('Delete this problem and all related test cases?');
    if (!confirmed) {
      return;
    }

    setIsDeleting(problemId);
    setErrorMessage(null);

    try {
      await deleteProblem(problemId);
      await fetchProblems();
    } catch {
      setErrorMessage('Unable to delete this problem.');
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading problems...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Problem Management</h1>
          <p className="text-sm text-muted-foreground">
            {publishedCount} published of {problems.length} total problems
          </p>
        </div>

        <Button asChild>
          <Link to="/problems/new">
            <Plus data-icon="inline-start" />
            New Problem
          </Link>
        </Button>
      </div>

      {errorMessage ? (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4" />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      {problems.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No problems yet</CardTitle>
            <CardDescription>Create your first coding problem.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4">
          {problems.map((problem) => (
            <Card key={problem.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between gap-4">
                  <Link to={`/problems/${problem.id}`} className="hover:underline">
                    {problem.title}
                  </Link>

                  <span
                    className={
                      problem.isPublished
                        ? 'rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700'
                        : 'rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-700'
                    }
                  >
                    {problem.isPublished ? 'Published' : 'Draft'}
                  </span>
                </CardTitle>
                <CardDescription>
                  {problem.difficulty} • {problem.timeLimitMs}ms • {problem.memoryLimitMb}MB
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/problems/${problem.id}`}>Manage Test Cases</Link>
                </Button>

                <Button variant="outline" size="sm" asChild>
                  <Link to={`/problems/${problem.id}/edit`}>
                    <PencilLine data-icon="inline-start" />
                    Edit
                  </Link>
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => void handleDelete(problem.id)}
                  disabled={isDeleting === problem.id}
                >
                  <Trash2 data-icon="inline-start" />
                  {isDeleting === problem.id ? 'Deleting...' : 'Delete'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
