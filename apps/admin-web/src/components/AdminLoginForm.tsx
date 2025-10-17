import {
  LoginAdminInput,
  loginAdminSchema,
} from "../../../../packages/shared/src/schemas/auth";
import { useAppForm } from "@/lib/tanstack-form";

interface AdminLoginFormProps {
  onSubmit: (data: LoginAdminInput) => Promise<void>;
  error?: string;
}

export function AdminLoginForm({ onSubmit, error }: AdminLoginFormProps) {
  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    } as LoginAdminInput,
    validators: {
      onSubmit: loginAdminSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Admin Login</h1>
        <p className="text-muted-foreground">
          Sign in to your admin account to continue
        </p>
      </div>

      <form.AppForm>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
          <form.AppField
            name="email"
            validators={{
              onBlur: loginAdminSchema.shape.email,
              onChange: loginAdminSchema.shape.email,
            }}
            children={(field) => {
              return (
                <field.TextField
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                />
              );
            }}
          />

          <form.AppField
            name="password"
            validators={{
              onBlur: loginAdminSchema.shape.password,
              onChange: loginAdminSchema.shape.password,
            }}
            children={(field) => {
              return (
                <field.TextField
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                />
              );
            }}
          />

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
              {error}
            </div>
          )}

          <form.SubmitButton>Sign In</form.SubmitButton>
        </form>
      </form.AppForm>
    </div>
  );
}
