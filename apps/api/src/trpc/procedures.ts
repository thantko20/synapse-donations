import { initTRPC } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { Context as HonoContext } from "hono";
import superjson from "superjson";
import { prisma } from "../../prisma/index.js";

export const createContext = async (
  _opts: FetchCreateContextFnOptions,
  c: HonoContext
) => {
  return {
    c,
    prisma,
  };
};

type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;

export const publicProcedure = t.procedure;

export const authProcedure = t.procedure.use((opts) => {
  return opts.next({});
});

export const platformAdminProcedure = t.procedure.use((opts) => {
  return opts.next({});
});

export const organizationProcedure = t.procedure.use((opts) => {
  return opts.next({});
});
