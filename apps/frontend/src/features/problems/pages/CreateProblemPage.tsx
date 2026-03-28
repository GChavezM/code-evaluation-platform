import { createProblem } from '@/api/problems.api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProblemForm } from '../components/ProblemForm';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export function CreateProblemPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Problem</CardTitle>
        <CardDescription>Define constraints, limits, and publication state.</CardDescription>
      </CardHeader>
      <CardContent>
        <ProblemForm
          submitLabel="Create Problem"
          isSubmitting={isSubmitting}
          onSubmit={async (payload) => {
            setIsSubmitting(true);
            try {
              const created = await createProblem(payload);
              void navigate(`/problems/${created.id}`);
            } finally {
              setIsSubmitting(false);
            }
          }}
        />
      </CardContent>
    </Card>
  );
}
