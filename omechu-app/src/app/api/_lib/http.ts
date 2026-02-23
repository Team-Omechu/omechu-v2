type JsonValue = Record<string, unknown>;

const BASE_HEADERS: Record<string, string> = {
  "Content-Type": "application/json; charset=utf-8",
};

export function acceptsJson(req: Request): boolean {
  const accept = req.headers.get("accept");

  return (
    !accept || accept.includes("*/*") || accept.includes("application/json")
  );
}

export function jsonResponse(
  data: JsonValue,
  status = 200,
  extraHeaders?: Record<string, string>,
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...BASE_HEADERS,
      ...extraHeaders,
    },
  });
}

export function errorResponse(
  status: number,
  code: string,
  message: string,
  details?: unknown,
  extraHeaders?: Record<string, string>,
): Response {
  const body: JsonValue = {
    error: true,
    code,
    message,
  };

  if (details !== undefined) {
    body.details = details;
  }

  return jsonResponse(body, status, extraHeaders);
}
