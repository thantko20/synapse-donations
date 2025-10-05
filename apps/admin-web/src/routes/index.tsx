import { createFileRoute } from "@tanstack/react-router";
import { trpc } from "@/lib/tanstack-query";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@repo/ui/components/button";

export const Route = createFileRoute("/")({
  component: Home,
  loader: async ({ context }) =>
    context.queryClient.ensureQueryData(trpc.hello.queryOptions()),
});

function Home() {
  const { data: message, isLoading } = useQuery(trpc.hello.queryOptions());
  if (isLoading) return <div>Loading...</div>;
  if (!message) return <div>No message</div>;
  return (
    <div>
      {message} -- Yeah, baby! <Button>Click Me</Button>
    </div>
  );
}
