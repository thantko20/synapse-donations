import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(admin)/_auth")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
