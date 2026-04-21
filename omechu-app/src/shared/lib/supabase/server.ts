// Server Supabase client.
// Next 16 RSC / Route Handler / Server Action에서 사용.
// cookies()를 통해 세션 쿠키를 읽고 갱신한다.
import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";
import { createClient as createSbClient } from "@supabase/supabase-js";
import "server-only";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Component에서 set 불가. proxy.ts에서 대신 처리한다.
          }
        },
      },
    },
  );
}

// 서버 전용. service_role 키가 필요한 어드민 작업용.
// ❗ 클라이언트 번들에 절대 들어가면 안 된다.
export function createAdminClient() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret) {
    throw new Error("SUPABASE_SECRET_KEY is required for admin client");
  }
  return createSbClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
