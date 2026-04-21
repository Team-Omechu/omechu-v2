// 계정 탈퇴.
// 기존 /user/withdraw → profiles.is_deleted = true, user_withdrawal 기록, auth.users 삭제.
// service_role 필요하므로 Edge Function.

import { admin, authed } from "../_shared/supabase.ts";
import { fail, handleOptions, ok } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  const pre = handleOptions(req);
  if (pre) return pre;
  if (req.method !== "POST") return fail(req, "M001", "method_not_allowed", 405);

  const supa = authed(req);
  const { data: userRes } = await supa.auth.getUser();
  if (!userRes?.user) return fail(req, "T001", "unauthorized", 401);
  const userId = userRes.user.id;

  let reason = "unspecified";
  try {
    const body = await req.json();
    if (typeof body?.reason === "string" && body.reason.trim())
      reason = body.reason.trim().slice(0, 100);
  } catch {
    // 빈 body 허용
  }

  const su = admin();

  const { error: wErr } = await su
    .from("user_withdrawal")
    .insert({ user_id: userId, reason });
  if (wErr) return fail(req, "DB01", wErr.message, 500);

  const { error: pErr } = await su
    .from("profiles")
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq("id", userId);
  if (pErr) return fail(req, "DB02", pErr.message, 500);

  // auth.users 실제 삭제는 grace period 두고 cron으로 돌리는 게 안전.
  // 여기선 즉시 로그아웃만 시키고, 삭제는 30일 후 pg_cron 예정.
  const { error: sErr } = await su.auth.admin.signOut(userId);
  if (sErr) return fail(req, "A004", sErr.message, 500);

  return ok(req, { withdrawn: true });
});
