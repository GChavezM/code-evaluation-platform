import { Button } from '@/components/ui/button';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { CreateProblemPayload, Difficulty } from '@/api/problems.api';
import { useMemo, useState } from 'react';

interface ProblemFormProps {
  initialValue?: Partial<CreateProblemPayload>;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (payload: CreateProblemPayload) => Promise<void>;
}

const DEFAULT_VALUE: CreateProblemPayload = {
  title: '',
  description: '',
  difficulty: 'EASY',
  timeLimitMs: 1000,
  memoryLimitMb: 128,
  isPublished: false,
};

export function ProblemForm({
  initialValue,
  submitLabel,
  isSubmitting = false,
  onSubmit,
}: ProblemFormProps) {
  const mergedValue = useMemo(() => ({ ...DEFAULT_VALUE, ...initialValue }), [initialValue]);

  const [title, setTitle] = useState(mergedValue.title);
  const [description, setDescription] = useState(mergedValue.description);
  const [difficulty, setDifficulty] = useState<Difficulty>(mergedValue.difficulty);
  const [timeLimitMs, setTimeLimitMs] = useState(String(mergedValue.timeLimitMs));
  const [memoryLimitMb, setMemoryLimitMb] = useState(String(mergedValue.memoryLimitMb));
  const [isPublished, setIsPublished] = useState(Boolean(mergedValue.isPublished));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const payload: CreateProblemPayload = {
      title: title.trim(),
      description: description.trim(),
      difficulty,
      timeLimitMs: Number(timeLimitMs),
      memoryLimitMb: Number(memoryLimitMb),
      isPublished,
    };

    if (!payload.title || !payload.description) {
      setErrorMessage('Title and description are required.');
      return;
    }

    if (!Number.isFinite(payload.timeLimitMs) || payload.timeLimitMs < 1) {
      setErrorMessage('Time limit must be a positive number.');
      return;
    }

    if (!Number.isFinite(payload.memoryLimitMb) || payload.memoryLimitMb < 1) {
      setErrorMessage('Memory limit must be a positive number.');
      return;
    }

    try {
      await onSubmit(payload);
    } catch {
      setErrorMessage('Unable to save problem. Please try again.');
    }
  };

  return (
    <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <FieldContent>
            <Input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Two Sum"
              required
            />
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <FieldContent>
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-36"
              placeholder="Explain the problem requirements and constraints."
              required
            />
          </FieldContent>
        </Field>

        <div className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="difficulty">Difficulty</FieldLabel>
            <FieldContent>
              <select
                id="difficulty"
                className="h-9 rounded-md border border-input bg-background px-2.5 text-sm"
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as Difficulty)}
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="timeLimit">Time Limit (ms)</FieldLabel>
            <FieldContent>
              <Input
                id="timeLimit"
                type="number"
                min={1}
                value={timeLimitMs}
                onChange={(event) => setTimeLimitMs(event.target.value)}
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="memoryLimit">Memory Limit (MB)</FieldLabel>
            <FieldContent>
              <Input
                id="memoryLimit"
                type="number"
                min={1}
                value={memoryLimitMb}
                onChange={(event) => setMemoryLimitMb(event.target.value)}
              />
            </FieldContent>
          </Field>
        </div>

        <Field orientation="horizontal" className="items-center gap-2">
          <input
            id="isPublished"
            type="checkbox"
            checked={isPublished}
            onChange={(event) => setIsPublished(event.target.checked)}
            className="size-4 rounded border border-input"
          />
          <FieldContent>
            <FieldLabel htmlFor="isPublished">Published</FieldLabel>
            <FieldDescription>Published problems are visible to CODER users.</FieldDescription>
          </FieldContent>
        </Field>
      </FieldGroup>

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : submitLabel}
      </Button>
    </form>
  );
}
