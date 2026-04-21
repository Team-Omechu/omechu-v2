// 원격 Supabase에 대한 스모크 테스트.
// - anon 클라이언트가 공개 테이블(allergy / meal_time)을 읽을 수 있는지
// - RLS가 인증 없이 profiles 접근을 막는지
// 테스트용 env를 여기서 직접 세팅한다 (다른 테스트에 영향 X).
import { describe, expect, it } from "vitest";

import { createClient } from "./client";

process.env.NEXT_PUBLIC_SUPABASE_URL ??=
  "https://xztldvunnasjaxnzqpct.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??=
  "sb_publishable_TW1dRfU6xM4uxpt2jodk8w_AIO67EMq";

const hasEnv =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

describe.skipIf(!hasEnv)("supabase client smoke", () => {
  it("reads public allergy rows (public read policy)", async () => {
    const sb = createClient();
    const { data, error } = await sb
      .from("allergy")
      .select("id, allergy")
      .limit(3);
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    expect(data?.length).toBeGreaterThan(0);
  });

  it("reads meal_time seeds", async () => {
    const sb = createClient();
    const { data, error } = await sb
      .from("meal_time")
      .select("id, comment")
      .order("id");
    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data!.length).toBeGreaterThanOrEqual(3);
  });

  it("RLS blocks unauth profiles select (returns empty array, not error)", async () => {
    const sb = createClient();
    const { data, error } = await sb
      .from("profiles")
      .select("id, email")
      .limit(1);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("recommend_random RPC is reachable", async () => {
    const sb = createClient();
    // anon 호출도 동작하되 로그인 안 된 상태에선 알러지 필터가 적용되지 않음.
    const { error } = await sb.rpc("recommend_random", { limit_count: 1 });
    // 메뉴가 없을 수 있으므로 error만 없으면 통과.
    expect(error).toBeNull();
  });
});
