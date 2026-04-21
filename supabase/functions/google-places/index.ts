// Google Places proxy.
// 기존 /menu/fetch-google-places / /menu/place/search / /menu/place/suggestions 통합.
// 서버 전용 키를 숨기기 위한 proxy.
//
// 요청:
//   POST /google-places { action: "nearby"|"text"|"autocomplete", payload: {...} }

import { corsHeaders, fail, handleOptions } from "../_shared/cors.ts";

type Action = "nearby" | "text" | "autocomplete" | "detail";

const BASE = "https://places.googleapis.com/v1";

async function nearby(payload: Record<string, unknown>, key: string) {
  const res = await fetch(`${BASE}/places:searchNearby`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types,places.photos",
    },
    body: JSON.stringify(payload),
  });
  return res;
}

async function searchText(payload: Record<string, unknown>, key: string) {
  const res = await fetch(`${BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types,places.photos",
    },
    body: JSON.stringify(payload),
  });
  return res;
}

async function autocomplete(payload: Record<string, unknown>, key: string) {
  const res = await fetch(`${BASE}/places:autocomplete`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key },
    body: JSON.stringify(payload),
  });
  return res;
}

async function detail(placeId: string, key: string) {
  const res = await fetch(`${BASE}/places/${encodeURIComponent(placeId)}`, {
    headers: {
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "id,displayName,formattedAddress,location,rating,userRatingCount,types,photos,websiteUri,internationalPhoneNumber,regularOpeningHours",
    },
  });
  return res;
}

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;
  if (req.method !== "POST")
    return fail(req, "M001", "method_not_allowed", 405);

  const key = Deno.env.get("GOOGLE_MAP_SERVER_API_KEY");
  if (!key) return fail(req, "E001", "GOOGLE_MAP_SERVER_API_KEY missing", 500);

  let action: Action;
  let payload: Record<string, unknown>;
  let placeId: string | undefined;
  try {
    const body = await req.json();
    action = body.action as Action;
    payload = (body.payload ?? {}) as Record<string, unknown>;
    placeId = body.placeId as string | undefined;
  } catch {
    return fail(req, "P001", "invalid_body");
  }

  try {
    let upstream: Response;
    switch (action) {
      case "nearby":
        upstream = await nearby(payload, key);
        break;
      case "text":
        upstream = await searchText(payload, key);
        break;
      case "autocomplete":
        upstream = await autocomplete(payload, key);
        break;
      case "detail":
        if (!placeId) return fail(req, "P001", "placeId_required");
        upstream = await detail(placeId, key);
        break;
      default:
        return fail(req, "P001", "unknown_action");
    }

    const body = await upstream.text();
    if (!upstream.ok) {
      return fail(req, "G001", `google_error`, upstream.status, body);
    }
    return new Response(body, {
      status: 200,
      headers: {
        ...corsHeaders(req.headers.get("origin")),
        "content-type": "application/json",
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return fail(req, "G002", msg, 500);
  }
});
