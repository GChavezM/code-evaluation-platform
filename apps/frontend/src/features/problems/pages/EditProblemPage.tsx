import { getProblem, updateProblem, type ProblemWithTestCases } from '@/api/problems.api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ProblemForm } from '../components/ProblemForm';
import { Button } from '@/components/ui/button';

export function EditProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<ProblemWithTestCases | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadProblem = async () => {
      if (!id) {
        setErrorMessage('Problem id is missing.');
        setIsLoading(false);
        return;
      }

      try {
        setProblem(await getProblem(id));
      } catch {
        setErrorMessage('Unable to load this problem.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadProblem();
  }, [id]);

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading problem...</p>;
  }

  if (!problem) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Problem not found</CardTitle>
          <CardDescription>
            {errorMessage ?? 'The requested problem could not be loaded.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" asChild>
            <Link to="/problems">Back to Problems</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Problem</CardTitle>
        <CardDescription>Update statement, limits, and publication settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <ProblemForm
          initialValue={problem}
          submitLabel="Save Changes"
          isSubmitting={isSubmitting}
          onSubmit={async (payload) => {
            setIsSubmitting(true);
            try {
              await updateProblem(problem.id, payload);
              void navigate(`/problems/${problem.id}`);
            } finally {
              setIsSubmitting(false);
            }
          }}
        />
      </CardContent>
    </Card>
  );
}
