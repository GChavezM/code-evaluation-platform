import { BrandHeader } from '../components/BrandHeader';
import { LoginForm } from '../components/LoginForm';
import { useLoginForm } from '../hooks/useLoginForm';

export function LoginPage() {
  const { form, serverError, onSubmit } = useLoginForm();

  return (
    <div className="min-h-svh flex items-center justify-center bg-background px-4 py-12">
      <div className="relative w-full max-w-100">
        <BrandHeader />
        <LoginForm
          form={form}
          serverError={serverError}
          onSubmit={(event) => void onSubmit(event)}
        />
      </div>
    </div>
  );
}
