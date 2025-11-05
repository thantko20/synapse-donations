import z, { int } from "zod";
import { apiResponseSchema } from "./types";
import { err, ok } from "neverthrow";
import { AppError } from "./errors";

type ApiResponseSchema<T> = z.ZodType<T>;

const baseApiUrl = import.meta.env.VITE_BASE_API_URL || "http://localhost:8080";

export function fetcher<TData>(endpoint: string, init: RequestInit) {
  const url = new URL(endpoint, baseApiUrl);
  return fetch(url, init);
}

fetcher.json = async function <TData>(
  endpoint: string,
  init: RequestInit,
  dataSchema?: ApiResponseSchema<TData>
) {
  try {
    const response = await fetcher(endpoint, {
      method: "POST",
      ...init,
      headers: {
        ...(init.headers ? init.headers : {}),
        "Content-Type": "application/json",
      },
    });
    const json = await response.json().catch(() => undefined);
    const parsed = await apiResponseSchema.safeParseAsync(json);
    if (!parsed.success) {
      console.log(parsed.error);
      return err({
        code: "parsed_error",
        message: "Unexpected response from the server",
      });
    }

    if (!response.ok) {
      const error = parsed.data.error!;
      return err({
        code: error.code,
        message: error.message,
        status: response.status,
      } satisfies AppError);
    }

    if (dataSchema) {
      const dataResult = await dataSchema.safeParseAsync(parsed.data);
      if (!dataResult.success) {
        return err({
          code: "parsed_error",
          message: "Error while parsing the response data",
        });
      }
      return ok(dataResult.data);
    }

    return ok(null);
  } catch (error) {
    return err({
      code: "unknown_error",
      message: (error as Error).message ?? "Unexpected error occurred",
    });
  }
};
