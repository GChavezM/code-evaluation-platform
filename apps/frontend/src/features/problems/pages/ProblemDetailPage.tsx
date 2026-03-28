import {
  createTestCase,
  deleteProblem,
  deleteTestCase,
  getProblem,
  updateTestCase,
  type CreateTestCasePayload,
} from '@/api';
import type { ProblemWithTestCases } from '@/api/problems.api';
import type { TestCase } from '@/api/problems.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldContent, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PencilLine, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';

interface TestCaseFormState {
  input: string;
  expectedOutput: string;
  order: string;
  isSample: boolean;
}

const EMPTY_TEST_CASE: TestCaseFormState = {
  input: '',
  expectedOutput: '',
  order: '1',
  isSample: false,
};

function toPayload(form: TestCaseFormState): CreateTestCasePayload {
  return {
    input: form.input.trim(),
    expectedOutput: form.expectedOutput.trim(),
    order: Number(form.order),
    isSample: form.isSample,
  };
}

export function ProblemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [problem, setProblem] = useState<ProblemWithTestCases | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [createState, setCreateState] = useState<TestCaseFormState>(EMPTY_TEST_CASE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<TestCaseFormState>(EMPTY_TEST_CASE);
  const [isMutating, setIsMutating] = useState(false);

  const loadProblem = useCallback(async () => {
    if (!id) {
      setErrorMessage('Problem id is missing.');
      setIsLoading(false);
      return;
    }

    try {
      setProblem(await getProblem(id));
    } catch {
      setErrorMessage('Unable to load problem details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadProblem();
  }, [loadProblem]);

  const handleAddTestCase = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!problem) {
      return;
    }

    setIsMutating(true);
    setErrorMessage(null);

    try {
      const payload = toPayload(createState);
      await createTestCase(problem.id, payload);
      setCreateState(EMPTY_TEST_CASE);
      await loadProblem();
    } catch {
      setErrorMessage('Unable to create test case.');
    } finally {
      setIsMutating(false);
    }
  };

  const startEditing = (testCase: TestCase) => {
    setEditingId(testCase.id);
    setEditState({
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      order: String(testCase.order),
      isSample: testCase.isSample,
    });
  };

  const handleSaveEdit = async (testCaseId: string) => {
    if (!problem) {
      return;
    }

    setIsMutating(true);
    setErrorMessage(null);
    try {
      await updateTestCase(problem.id, testCaseId, toPayload(editState));
      setEditingId(null);
      await loadProblem();
    } catch {
      setErrorMessage('Unable to update test case.');
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteTestCase = async (testCaseId: string) => {
    if (!problem) {
      return;
    }

    if (!window.confirm('Delete this test case?')) {
      return;
    }

    setIsMutating(true);
    setErrorMessage(null);
    try {
      await deleteTestCase(problem.id, testCaseId);
      await loadProblem();
    } catch {
      setErrorMessage('Unable to delete test case.');
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteProblem = async () => {
    if (!problem) {
      return;
    }

    if (!window.confirm('Delete this problem and all test cases?')) {
      return;
    }

    setIsMutating(true);
    setErrorMessage(null);
    try {
      await deleteProblem(problem.id);
      void navigate('/problems');
    } catch {
      setErrorMessage('Unable to delete this problem.');
    } finally {
      setIsMutating(false);
    }
  };

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
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between gap-4">
            <span>{problem.title}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/problems/${problem.id}/edit`}>
                  <PencilLine data-icon="inline-start" />
                  Edit Problem
                </Link>
              </Button>
              <Button variant="destructive" size="sm" onClick={() => void handleDeleteProblem()}>
                <Trash2 data-icon="inline-start" />
                Delete Problem
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            {problem.difficulty} • {problem.timeLimitMs}ms • {problem.memoryLimitMb}MB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{problem.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New Test Case</CardTitle>
          <CardDescription>Add hidden or sample test cases for evaluation.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(event) => void handleAddTestCase(event)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="new-input">Input</FieldLabel>
                <FieldContent>
                  <Textarea
                    id="new-input"
                    value={createState.input}
                    onChange={(event) =>
                      setCreateState((prev) => ({ ...prev, input: event.target.value }))
                    }
                    required
                  />
                </FieldContent>
              </Field>
              <Field>
                <FieldLabel htmlFor="new-output">Expected Output</FieldLabel>
                <FieldContent>
                  <Textarea
                    id="new-output"
                    value={createState.expectedOutput}
                    onChange={(event) =>
                      setCreateState((prev) => ({ ...prev, expectedOutput: event.target.value }))
                    }
                    required
                  />
                </FieldContent>
              </Field>
              <div className="flex items-center gap-4">
                <Field>
                  <FieldLabel htmlFor="new-order">Order</FieldLabel>
                  <FieldContent>
                    <Input
                      id="new-order"
                      type="number"
                      min={1}
                      value={createState.order}
                      onChange={(event) =>
                        setCreateState((prev) => ({ ...prev, order: event.target.value }))
                      }
                      required
                    />
                  </FieldContent>
                </Field>

                <label className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={createState.isSample}
                    onChange={(event) =>
                      setCreateState((prev) => ({ ...prev, isSample: event.target.checked }))
                    }
                  />
                  Sample test case
                </label>
              </div>
            </FieldGroup>

            <Button type="submit" disabled={isMutating}>
              {isMutating ? 'Saving...' : 'Add Test Case'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Cases</CardTitle>
          <CardDescription>{problem.testCases.length} configured</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

          {problem.testCases.length === 0 ? (
            <p className="text-sm text-muted-foreground">No test cases yet.</p>
          ) : (
            problem.testCases.map((testCase) => {
              const isEditing = editingId === testCase.id;

              return (
                <div key={testCase.id} className="rounded-lg border p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">
                      Case #{testCase.order} {testCase.isSample ? '• Sample' : '• Hidden'}
                    </p>
                    <div className="flex gap-2">
                      {!isEditing ? (
                        <Button variant="outline" size="sm" onClick={() => startEditing(testCase)}>
                          Edit
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handleSaveEdit(testCase.id)}
                          disabled={isMutating}
                        >
                          Save
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => void handleDeleteTestCase(testCase.id)}
                        disabled={isMutating}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                        Input
                      </p>
                      {isEditing ? (
                        <Textarea
                          value={editState.input}
                          onChange={(event) =>
                            setEditState((prev) => ({ ...prev, input: event.target.value }))
                          }
                        />
                      ) : (
                        <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">
                          {testCase.input}
                        </pre>
                      )}
                    </div>
                    <div>
                      <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                        Expected Output
                      </p>
                      {isEditing ? (
                        <Textarea
                          value={editState.expectedOutput}
                          onChange={(event) =>
                            setEditState((prev) => ({
                              ...prev,
                              expectedOutput: event.target.value,
                            }))
                          }
                        />
                      ) : (
                        <pre className="overflow-auto rounded-md bg-muted p-3 text-xs">
                          {testCase.expectedOutput}
                        </pre>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
