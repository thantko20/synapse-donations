import { loginAdminSchema } from "@repo/shared/schemas";
import { publicProcedure, router } from "../procedures.js";
import { login } from "../../services/auth.js";
import { setCookie } from "hono/cookie";

export const authRouter = router({
  loginAdmin: publicProcedure
    .input(loginAdminSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await login(ctx.prisma, input);
      setCookie(ctx.c, "session_token", result.session.token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });
      return result;
    }),
});
