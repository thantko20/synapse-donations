import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(admin)/a/_auth/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/(admin)/_auth/login"!</div>
}
