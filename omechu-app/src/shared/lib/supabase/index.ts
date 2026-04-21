// Public barrel - CLIENT-safe exports only.
// 서버 전용은 `@/shared/lib/supabase/server`에서 직접 import.

export { createClient as createSupabaseBrowserClient } from "./client";
export type { Database } from "./types";
