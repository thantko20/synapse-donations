import {
  loginAdminSchema,
  loginUserSchema,
  registerUserSchema,
} from "@repo/shared/schemas";
import { publicProcedure, router } from "../procedures.js";
import { loginAdmin, loginUser, registerUser } from "../../services/auth.js";
import { setCookie } from "hono/cookie";

export const authRouter = router({
  loginAdmin: publicProcedure
    .input(loginAdminSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await loginAdmin({ prisma: ctx.prisma }, input);
      setCookie(ctx.c, "admin_session_token", result.session.token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });
      return result;
    }),

  registerUser: publicProcedure
    .input(registerUserSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await registerUser({ prisma: ctx.prisma }, input);
      return result;
    }),
  loginUser: publicProcedure
    .input(loginUserSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await loginUser({ prisma: ctx.prisma }, input);
      setCookie(ctx.c, "session_token", result.session.token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });
      return result;
    }),
});
