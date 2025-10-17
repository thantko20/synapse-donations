import { createFileRoute, useRouter } from "@tanstack/react-router";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { trpc } from "@/lib/tanstack-query";
import { useMutation } from "@tanstack/react-query";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const loginMutation = useMutation(
    trpc.auth.loginAdmin.mutationOptions({
      retry: false,
    }),
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <AdminLoginForm
        onSubmit={async (value) => {
          await loginMutation.mutateAsync(value);
        }}
        error={loginMutation.error?.message}
      />
    </div>
  );
}
