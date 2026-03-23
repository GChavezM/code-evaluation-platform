import { BrandHeader } from '../components/BrandHeader';
import { RegisterForm } from '../components/RegisterForm';
import { useRegisterForm } from '../hooks/useRegisterForm';

export function RegisterPage() {
  const { form, serverError, onSubmit } = useRegisterForm();

  return (
    <div className="min-h-svh flex items-center justify-center bg-background px-4 py-12">
      <div className="relative w-full max-w-100">
        <BrandHeader />
        <RegisterForm
          form={form}
          serverError={serverError}
          onSubmit={(event) => void onSubmit(event)}
        />
      </div>
    </div>
  );
}
