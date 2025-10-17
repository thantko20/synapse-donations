import { t } from "./procedures.js";
import { authRouter } from "./routers/auth.js";

export const appRouter = t.router({
  hello: t.procedure.query(async () => {
    return "Hello from Hono + tRPC!";
  }),
  auth: authRouter,
});

export type AppRouter = typeof appRouter;
