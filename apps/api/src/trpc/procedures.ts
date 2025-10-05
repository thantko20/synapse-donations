import { initTRPC } from "@trpc/server";
import superjson from "superjson";

export const t = initTRPC.create({
  transformer: superjson,
});

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
