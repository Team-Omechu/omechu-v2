// CORS / JSON helpers used across Edge Functions.
// Omechu 프론트(로컬 3000 + Vercel 프로덕션) 허용.

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://omechu.log8.kr",
];

export function corsHeaders(origin: string | null): HeadersInit {
  const allowOrigin =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export function handleOptions(req: Request): Response | null {
  if (req.method !== "OPTIONS") return null;
  return new Response(null, {
    status: 204,
    headers: corsHeaders(req.headers.get("origin")),
  });
}

type Ok<T> = { resultType: "SUCCESS"; error: null; success: T };
type Err = {
  resultType: "FAIL";
  error: { errorCode: string; reason: string; data: unknown };
  success: null;
};

export function ok<T>(req: Request, success: T, status = 200): Response {
  const body: Ok<T> = { resultType: "SUCCESS", error: null, success };
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req.headers.get("origin")),
      "content-type": "application/json",
    },
  });
}

export function fail(
  req: Request,
  errorCode: string,
  reason: string,
  status = 400,
  data: unknown = null,
): Response {
  const body: Err = {
    resultType: "FAIL",
    error: { errorCode, reason, data },
    success: null,
  };
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(req.headers.get("origin")),
      "content-type": "application/json",
    },
  });
}
