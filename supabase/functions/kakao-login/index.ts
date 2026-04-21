// Kakao OAuth 로그인 → Supabase 세션 발급.
// 흐름:
//   1. 클라이언트가 카카오 JS SDK 혹은 redirect로 authorization code 받음
//   2. POST /kakao-login { code, redirectUri }
//   3. 서버:
//      - 카카오 토큰 교환 + 유저 조회
//      - Supabase admin API로 유저 생성/조회 (provider_id로 매칭)
//      - generateLink로 Magic Link 발급 → email_otp 발행
//      - 혹은 직접 세션 발행: admin.createUser로 만들고 admin.generateLink로 hashed token 반환
//   4. 클라이언트는 받은 access/refresh 토큰으로 supabase.auth.setSession 호출.
//
// Supabase는 kakao를 네이티브 지원하지 않으므로 이 방식이 표준이다.

import { admin } from "../_shared/supabase.ts";
import { corsHeaders, fail, handleOptions, ok } from "../_shared/cors.ts";

interface KakaoTokenResponse {
  access_token: string;
  refresh_token?: string;
}

interface KakaoUserResponse {
  id: number;
  kakao_account?: {
    email?: string | null;
    profile?: { nickname?: string | null } | null;
  };
}

async function exchangeCode(
  code: string,
  redirectUri: string,
): Promise<{ providerId: string; email: string | null; nickname: string | null }> {
  const restKey = Deno.env.get("KAKAO_REST_API_KEY");
  if (!restKey) throw new Error("KAKAO_REST_API_KEY missing");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: restKey,
    redirect_uri: redirectUri,
    code,
  });
  const clientSecret = Deno.env.get("KAKAO_CLIENT_SECRET");
  if (clientSecret) body.set("client_secret", clientSecret);

  const tokenRes = await fetch("https://kauth.kakao.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!tokenRes.ok) {
    throw new Error(`kakao token exchange failed: ${await tokenRes.text()}`);
  }
  const token = (await tokenRes.json()) as KakaoTokenResponse;

  const meRes = await fetch("https://kapi.kakao.com/v2/user/me", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!meRes.ok) {
    throw new Error(`kakao /me failed: ${await meRes.text()}`);
  }
  const me = (await meRes.json()) as KakaoUserResponse;

  return {
    providerId: String(me.id),
    email: me.kakao_account?.email ?? null,
    nickname: me.kakao_account?.profile?.nickname ?? null,
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
    const kakao = await exchangeCode(code, redirectUri);

    const supa = admin();
    // 1) provider_id로 기존 유저 조회
    const existingByProvider = await supa
      .from("profiles")
      .select("id")
      .eq("provider", "kakao")
      .eq("provider_id", kakao.providerId)
      .maybeSingle();

    let userId: string;

    if (existingByProvider.data?.id) {
      userId = existingByProvider.data.id;
    } else {
      // 2) 없으면 이메일 기반 기존 auth 유저 매칭 or 신규 생성
      const fakeEmail =
        kakao.email ?? `kakao_${kakao.providerId}@kakao.omechu.local`;
      const createRes = await supa.auth.admin.createUser({
        email: fakeEmail,
        email_confirm: true,
        app_metadata: { provider: "kakao", providers: ["kakao"] },
        user_metadata: {
          provider_id: kakao.providerId,
          nickname: kakao.nickname,
        },
      });
      if (createRes.error) {
        // already-registered: 이메일 재사용 케이스
        const list = await supa.auth.admin.listUsers();
        const existing = list.data.users.find((u) => u.email === fakeEmail);
        if (!existing) return fail(req, "A001", createRes.error.message, 500);
        userId = existing.id;
        // profile에 provider_id 동기화
        await supa
          .from("profiles")
          .update({ provider: "kakao", provider_id: kakao.providerId })
          .eq("id", userId);
      } else {
        userId = createRes.data.user!.id;
      }
    }

    // 3) Magic link 생성 → 토큰 해시 추출
    const { data: linkData, error: linkErr } =
      await supa.auth.admin.generateLink({
        type: "magiclink",
        email:
          kakao.email ?? `kakao_${kakao.providerId}@kakao.omechu.local`,
      });
    if (linkErr || !linkData) {
      return fail(req, "A002", linkErr?.message ?? "generateLink failed", 500);
    }

    // 4) verifyOtp로 세션 발급
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
    return fail(req, "K001", msg, 500);
  }
});
