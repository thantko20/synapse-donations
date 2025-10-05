import { t } from "./procedures.js";

export const appRouter = t.router({
  hello: t.procedure.query(async () => {
    return "Hello from Hono + tRPC!";
  }),
});

export type AppRouter = typeof appRouter;
