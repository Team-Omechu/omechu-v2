import { type MukburimResponse } from "@/entities/mukburim/config/mukburim";

import { createSupabaseBrowserClient } from "@/shared/lib/supabase";

export const postMukburim = async (
  menuName: string,
): Promise<MukburimResponse> => {
  const sb = createSupabaseBrowserClient();
  const { data: userRes, error: userErr } = await sb.auth.getUser();
  if (userErr) throw userErr;
  if (!userRes.user) throw new Error("unauthorized");

  const { data: menu, error: menuErr } = await sb
    .from("menu")
    .select("id, name")
    .eq("name", menuName)
    .limit(1)
    .maybeSingle();
  if (menuErr) throw menuErr;
  if (!menu) throw new Error(`menu not found: ${menuName}`);

  const { data: inserted, error } = await sb
    .from("mukburim")
    .insert({ user_id: userRes.user.id, menu_id: menu.id })
    .select()
    .single();
  if (error) throw error;

  return {
    resultType: "SUCCESS",
    error: null,
    success: {
      id: inserted.id as number,
      // 기존 API 호환: user_id는 number였지만 Supabase는 uuid(string). 타입만 맞춤.
      user_id: 0,
      menu_name: menuName,
      date: inserted.eaten_at as string,
    },
  };
};
