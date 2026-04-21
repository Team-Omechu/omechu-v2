// Browser Supabase client. Client Components / browser-side mutations에서 사용.
// RLS가 auth.uid() 기준으로 걸려 있으므로 일반 쿼리도 이 클라이언트로 충분하다.
import { createBrowserClient } from "@supabase/ssr";

// TODO: `supabase gen types typescript --project-id ...`로 생성한 Database 타입을
// types.ts에 덮어쓰고, 이 create* 함수들에 제네릭으로 넘길 것.

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
