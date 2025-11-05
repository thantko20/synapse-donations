import { adminSessionSchema, LoginAdmin } from "./auth.types";
import { fetcher } from "@/lib/fetcher";

export async function loginAdmin(data: LoginAdmin) {
  return fetcher.json(
    "/auth/login/admin",
    {
      body: JSON.stringify(data),
    }
    // adminSessionSchema
  );
}
