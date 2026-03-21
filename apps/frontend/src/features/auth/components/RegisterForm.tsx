import type React from 'react';
import { useState } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import { EyeIcon, EyeOffIcon, Loader2, Lock, Mail, User } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@/components/ui/input-group';
import type { RegisterFormData } from '../hooks/useRegisterForm';

interface RegisterFormProps {
  form: UseFormReturn<RegisterFormData>;
  serverError: string | null;
  onSubmit: React.ComponentProps<'form'>['onSubmit'];
}

export function RegisterForm({ form, serverError, onSubmit }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const {
    formState: { isSubmitting },
    control,
  } = form;

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">Create your account</CardTitle>
        <CardDescription>Set up your account to start evaluating code securely</CardDescription>
      </CardHeader>

      <CardContent>
        <form id="register-form" onSubmit={onSubmit} noValidate>
          <FieldGroup>
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>First name (optional)</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id={field.name}
                      type="text"
                      placeholder="John"
                      autoComplete="given-name"
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                    />
                    <InputGroupAddon align="inline-start">
                      <User />
                    </InputGroupAddon>
                  </InputGroup>

                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="lastName"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Last name (optional)</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id={field.name}
                      type="text"
                      placeholder="Doe"
                      autoComplete="family-name"
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                    />
                    <InputGroupAddon align="inline-start">
                      <User />
                    </InputGroupAddon>
                  </InputGroup>

                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id={field.name}
                      type="email"
                      inputMode="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                    />
                    <InputGroupAddon align="inline-start">
                      <Mail />
                    </InputGroupAddon>
                  </InputGroup>

                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id={field.name}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="********"
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                    />
                    <InputGroupAddon align="inline-start">
                      <Lock />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword(!showPassword)}
                        size="icon-xs"
                      >
                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>

                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="confirmPassword"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      id={field.name}
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="********"
                      autoComplete="new-password"
                      aria-invalid={fieldState.invalid}
                      disabled={isSubmitting}
                    />
                    <InputGroupAddon align="inline-start">
                      <Lock />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label={
                          showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                        }
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        size="icon-xs"
                      >
                        {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>

                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {serverError !== null && <p className="text-sm text-destructive">{serverError}</p>}
          </FieldGroup>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button
          type="submit"
          form="register-form"
          className="w-full"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 data-icon="inline-start" className="animate-spin" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
          >
            Log in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
