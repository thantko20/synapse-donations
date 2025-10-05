import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { getContext as getQueryContext } from "./lib/tanstack-query";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

export function getRouter() {
  const { queryClient, trpc } = getQueryContext();
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
    context: {
      queryClient,
      trpc,
    },
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
}
