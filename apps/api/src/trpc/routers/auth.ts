import { loginAdminSchema } from "@repo/shared/schemas";
import { publicProcedure, router } from "../procedures.js";
import { loginAdmin } from "../../services/auth.js";
import { setCookie } from "hono/cookie";

export const authRouter = router({
  loginAdmin: publicProcedure
    .input(loginAdminSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await loginAdmin(ctx.prisma, input);
      setCookie(ctx.c, "session_token", result.session.token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });
      return result;
    }),
});
