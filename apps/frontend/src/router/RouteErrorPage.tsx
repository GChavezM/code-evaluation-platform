import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router';

function getErrorCopy(error: unknown): { title: string; description: string } {
  if (isRouteErrorResponse(error)) {
    return {
      title: `${error.status} ${error.statusText}`,
      description:
        typeof error.data === 'string' ? error.data : 'The requested page could not be loaded.',
    };
  }

  if (error instanceof Error) {
    return {
      title: 'Unexpected route error',
      description: error.message,
    };
  }

  return {
    title: 'Unexpected route error',
    description: 'An unknown error occurred while loading this page.',
  };
}

export function RouteErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();
  const copy = getErrorCopy(error);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <AlertTriangle className="size-5" />
          </div>
          <CardTitle>{copy.title}</CardTitle>
          <CardDescription>{copy.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button onClick={() => void navigate(0)}>Try Again</Button>
          <Button variant="outline" onClick={() => void navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
