import { initTRPC, TRPCError } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { Context as HonoContext } from "hono";
import superjson from "superjson";
import { prisma } from "../../prisma/index.js";
import { getCookie } from "hono/cookie";

export const createContext = async (
  _opts: FetchCreateContextFnOptions,
  c: HonoContext
) => {
  const cookie = getCookie(c, "admin_session_token");
  if (cookie) {
    const session = await prisma.session.findUnique({
      where: { token: cookie },
      include: { user: true },
    });
    if (session) {
      return {
        c,
        prisma,
        userId: session.userId,
        user: session.user,
      };
    }
  }
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
  if (!opts.ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  return opts.next({ ...opts });
});

export const platformAdminProcedure = t.procedure.use((opts) => {
  return opts.next({});
});

export const organizationProcedure = t.procedure.use((opts) => {
  return opts.next({});
});
