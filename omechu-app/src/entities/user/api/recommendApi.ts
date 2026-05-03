import type {
  ExceptMenuRequest,
  ExceptMenuResponse,
  RecommendManagementResponse,
  RecommendMenuItem,
  RemoveExceptMenuRequest,
  RemoveExceptMenuResponse,
} from "@/entities/user/model/recommend.types";

import { createSupabaseBrowserClient } from "@/shared/lib/supabase";

interface MenuRow {
  id: number;
  name: string;
  image_link: string | null;
}

async function getAuthedUserId(): Promise<string> {
  const sb = createSupabaseBrowserClient();
  const { data, error } = await sb.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error("unauthorized");
  return data.user.id;
}

function toItem(m: MenuRow): RecommendMenuItem {
  return {
    id: String(m.id),
    name: m.name,
    image_link: m.image_link ?? "",
  };
}

async function resolveMenuId(req: {
  menuId?: string;
  menuName?: string;
}): Promise<number> {
  if (req.menuId) {
    const n = Number(req.menuId);
    if (Number.isFinite(n)) return n;
  }
  if (req.menuName) {
    const sb = createSupabaseBrowserClient();
    const { data, error } = await sb
      .from("menu")
      .select("id")
      .eq("name", req.menuName)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (data) return data.id as number;
  }
  throw new Error("menu를 식별할 수 없습니다. menuId 또는 menuName 필요.");
}

export async function fetchRecommendManagement(): Promise<RecommendManagementResponse> {
  const sb = createSupabaseBrowserClient();
  const userId = await getAuthedUserId();

  const [allMenus, excepted] = await Promise.all([
    sb.from("menu").select("id, name, image_link").order("id"),
    sb
      .from("recommend_except")
      .select("menu:menu_id(id, name, image_link)")
      .eq("user_id", userId)
      .eq("active", true),
  ]);
  if (allMenus.error) throw allMenus.error;
  if (excepted.error) throw excepted.error;

  const allRows = (allMenus.data ?? []) as MenuRow[];
  const exceptedRows = (
    (excepted.data ?? []) as unknown as { menu: MenuRow | null }[]
  )
    .map((r) => r.menu)
    .filter((m): m is MenuRow => Boolean(m));

  const exceptedIds = new Set(exceptedRows.map((m) => m.id));
  const recommendRows = allRows.filter((m) => !exceptedIds.has(m.id));

  return {
    summary: {
      totalMenus: allRows.length,
      recommendMenus: recommendRows.length,
      exceptedMenus: exceptedRows.length,
    },
    recommendMenus: recommendRows.map(toItem),
    exceptedMenus: exceptedRows.map(toItem),
  };
}

export async function exceptMenu(
  data: ExceptMenuRequest,
): Promise<ExceptMenuResponse> {
  const sb = createSupabaseBrowserClient();
  const userId = await getAuthedUserId();
  const menuId = await resolveMenuId(data);

  const { data: menuRow, error: menuErr } = await sb
    .from("menu")
    .select("id, name, image_link")
    .eq("id", menuId)
    .single();
  if (menuErr) throw menuErr;

  const { data: row, error } = await sb
    .from("recommend_except")
    .upsert(
      { user_id: userId, menu_id: menuId, active: true },
      { onConflict: "user_id,menu_id" },
    )
    .select()
    .single();
  if (error) throw error;

  return {
    id: String(row.id),
    menu: toItem(menuRow as MenuRow),
    message: "메뉴가 제외 목록에 추가되었습니다.",
  };
}

export async function removeExceptMenu(
  data: RemoveExceptMenuRequest,
): Promise<RemoveExceptMenuResponse> {
  const sb = createSupabaseBrowserClient();
  const userId = await getAuthedUserId();
  const menuId = await resolveMenuId(data);

  const { error } = await sb
    .from("recommend_except")
    .delete()
    .eq("user_id", userId)
    .eq("menu_id", menuId);
  if (error) throw error;

  return { success: true, message: "제외가 해제되었습니다." };
}
