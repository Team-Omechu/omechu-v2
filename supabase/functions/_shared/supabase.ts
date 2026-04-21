// Edge Function 내부에서 Supabase 클라이언트 생성.
// - authed(req): 호출자 JWT를 그대로 위임 (RLS 적용)
// - admin(): service_role 키 사용 (auth.users 관리, 서버 트랜잭션)

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function env(key: string): string {
  const v = Deno.env.get(key);
  if (!v) throw new Error(`Missing env: ${key}`);
  return v;
}

export function authed(req: Request): SupabaseClient {
  return createClient(env("SUPABASE_URL"), env("SUPABASE_ANON_KEY"), {
    global: {
      headers: { Authorization: req.headers.get("Authorization") ?? "" },
    },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function admin(): SupabaseClient {
  return createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
