import * as Sentry from "@sentry/nextjs";

import { acceptsJson, errorResponse } from "@/app/api/_lib/http";

export type RouteHandler<Ctx> = (
  req: Request,
  ctx: Ctx,
) => Promise<Response> | Response;

export function withErrorHandler<Ctx = unknown>(
  handler: RouteHandler<Ctx>,
): RouteHandler<Ctx> {
  return async (req, ctx) => {
    if (!acceptsJson(req)) {
      return errorResponse(
        406,
        "NOT_ACCEPTABLE",
        "Only application/json responses are supported.",
      );
    }

    try {
      return await handler(req, ctx);
    } catch (err) {
      Sentry.captureException(err);

      return errorResponse(500, "INTERNAL_ERROR", "서버 오류가 발생했습니다.", {
        detail: err instanceof Error ? err.message : String(err),
      });
    }
  };
}
