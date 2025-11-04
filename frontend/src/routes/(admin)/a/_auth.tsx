import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)/a/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
