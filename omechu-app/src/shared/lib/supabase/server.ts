// Server Supabase client.
// Next 16 RSC / Route Handler / Server Action에서 사용.
// cookies()를 통해 세션 쿠키를 읽고 갱신한다.
//
// 서비스 롤 키가 필요한 admin 작업은 Supabase Edge Function
// (supabase/functions/*)에서 수행한다. Next 서버에서 service_role을
// 직접 다루지 않도록 의도적으로 admin client는 제공하지 않는다.
import { cookies } from "next/headers";

import { createServerClient } from "@supabase/ssr";
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
