import type { AppRouter } from "@repo/api/trpc";
import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchStreamLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import superjson from "superjson";
import { TRPCProvider } from "../trpc/react";
import { createIsomorphicFn, createServerOnlyFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

const queryClient = new QueryClient({
  defaultOptions: {
    hydrate: { deserializeData: superjson.deserialize },
    dehydrate: { serializeData: superjson.serialize },
  },
});

const getUrl = () => {
  return import.meta.env.VITE_API_URL ?? "http://localhost:4000/trpc";
};

const getHeaders = createIsomorphicFn()
  .client(() => ({}))
  .server(() => getRequestHeaders());

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchStreamLink({
      url: getUrl(),
      transformer: superjson,
      headers: getHeaders(),
    }),
  ],
});

export const trpc = createTRPCOptionsProxy({ client: trpcClient, queryClient });

export const getContext = () => ({
  queryClient,
  trpc,
});

export function Provider({ children }: { children?: React.ReactNode }) {
  return (
    <TRPCProvider queryClient={queryClient} trpcClient={trpcClient}>
      {children}
    </TRPCProvider>
  );
}
