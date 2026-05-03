import { createSupabaseBrowserClient } from "@/shared/lib/supabase";

export async function ensureBattleSession(): Promise<string> {
  const sb = createSupabaseBrowserClient();
  const {
    data: { session },
  } = await sb.auth.getSession();
  if (session?.user?.id) return session.user.id;

  const { data, error } = await sb.auth.signInAnonymously();
  if (error || !data.user) {
    throw new Error(error?.message ?? "익명 세션 생성에 실패했습니다.");
  }
  return data.user.id;
}
