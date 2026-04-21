// Google OAuth 로그인 → Supabase 세션 발급.
// 흐름:
//   1. 클라이언트가 Google OAuth redirect로 authorization code 수신
//   2. POST /google-login { code, redirectUri }
//   3. 서버:
//      - Google 토큰 교환 + userinfo 조회
//      - Supabase admin API로 provider_id(sub) 기반 유저 생성/조회
//      - generateLink(magiclink) → verifyOtp로 세션 발행
//   4. 클라이언트는 받은 access/refresh 토큰으로 supabase.auth.setSession 호출.
//
// Supabase 네이티브 Google provider 대신 이 경로를 쓰는 이유:
// OAuth 리다이렉트 체인에서 Supabase 프로젝트 서브도메인 노출을 피하고
// omechu.log8.kr/auth/google/callback 한 도메인으로 통일하기 위함.

import { admin } from "../_shared/supabase.ts";
import { fail, handleOptions, ok } from "../_shared/cors.ts";

interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
}

interface GoogleUserInfoResponse {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
}

async function exchangeCode(
  code: string,
  redirectUri: string,
): Promise<{ providerId: string; email: string | null; nickname: string | null }> {
  const clientId = Deno.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID missing");
  if (!clientSecret) throw new Error("GOOGLE_CLIENT_SECRET missing");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    code,
  });

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!tokenRes.ok) {
    throw new Error(`google token exchange failed: ${await tokenRes.text()}`);
  }
  const token = (await tokenRes.json()) as GoogleTokenResponse;

  const meRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!meRes.ok) {
    throw new Error(`google userinfo failed: ${await meRes.text()}`);
  }
  const me = (await meRes.json()) as GoogleUserInfoResponse;

  return {
    providerId: me.sub,
    email: me.email ?? null,
    nickname: me.name ?? null,
  };
}

Deno.serve(async (req) => {
  const preflight = handleOptions(req);
  if (preflight) return preflight;

  if (req.method !== "POST") return fail(req, "M001", "method_not_allowed", 405);

  let code: string, redirectUri: string;
  try {
    const body = await req.json();
    code = String(body?.code ?? "");
    redirectUri = String(body?.redirectUri ?? "");
    if (!code || !redirectUri) throw new Error("missing");
  } catch {
    return fail(req, "P001", "code and redirectUri required");
  }

  try {
    const google = await exchangeCode(code, redirectUri);

    const supa = admin();
    const existingByProvider = await supa
      .from("profiles")
      .select("id")
      .eq("provider", "google")
      .eq("provider_id", google.providerId)
      .maybeSingle();

    let userId: string;

    if (existingByProvider.data?.id) {
      userId = existingByProvider.data.id;
    } else {
      const fallbackEmail =
        google.email ?? `google_${google.providerId}@google.omechu.local`;
      const createRes = await supa.auth.admin.createUser({
        email: fallbackEmail,
        email_confirm: true,
        app_metadata: { provider: "google", providers: ["google"] },
        user_metadata: {
          provider_id: google.providerId,
          nickname: google.nickname,
        },
      });
      if (createRes.error) {
        const list = await supa.auth.admin.listUsers();
        const existing = list.data.users.find((u) => u.email === fallbackEmail);
        if (!existing) return fail(req, "A001", createRes.error.message, 500);
        userId = existing.id;
        await supa
          .from("profiles")
          .update({ provider: "google", provider_id: google.providerId })
          .eq("id", userId);
      } else {
        userId = createRes.data.user!.id;
      }
    }

    const { data: linkData, error: linkErr } =
      await supa.auth.admin.generateLink({
        type: "magiclink",
        email:
          google.email ?? `google_${google.providerId}@google.omechu.local`,
      });
    if (linkErr || !linkData) {
      return fail(req, "A002", linkErr?.message ?? "generateLink failed", 500);
    }

    const { data: session, error: verifyErr } = await supa.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: "magiclink",
    });
    if (verifyErr || !session.session) {
      return fail(req, "A003", verifyErr?.message ?? "session_failed", 500);
    }

    return ok(req, {
      userId,
      accessToken: session.session.access_token,
      refreshToken: session.session.refresh_token,
      expiresIn: session.session.expires_in,
      expiresAt: session.session.expires_at,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return fail(req, "G001", msg, 500);
  }
});
