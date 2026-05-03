import { type MenuDetail } from "@/entities/menu/model/menu.types";

import { createSupabaseBrowserClient } from "@/shared/lib/supabase";

interface MenuRow {
  id: number;
  name: string;
  description: string | null;
  calory: number | null;
  carbo: number | null;
  protein: number | null;
  fat: number | null;
  sodium: number | null;
  image_link: string | null;
}

export const getMenuDetail = async (name: string): Promise<MenuDetail> => {
  if (!name) throw new Error("menu name is required");

  const sb = createSupabaseBrowserClient();

  const { data: menu, error } = await sb
    .from("menu")
    .select(
      "id, name, description, calory, carbo, protein, fat, sodium, image_link",
    )
    .eq("name", name.trim())
    .limit(1)
    .maybeSingle<MenuRow>();
  if (error) throw error;
  if (!menu) throw new Error(`menu not found: ${name}`);

  const [vitamins, allergies] = await Promise.all([
    sb
      .from("menu_vitamin")
      .select("vitamin:vitamin_id(vitamin)")
      .eq("menu_id", menu.id),
    sb
      .from("menu_allergy")
      .select("allergy:allergy_id(allergy)")
      .eq("menu_id", menu.id),
  ]);
  if (vitamins.error) throw vitamins.error;
  if (allergies.error) throw allergies.error;

  return {
    name: menu.name,
    description: menu.description ?? "",
    calory: menu.calory?.toString() ?? "",
    carbo: menu.carbo?.toString() ?? "",
    protein: menu.protein?.toString() ?? "",
    fat: menu.fat?.toString() ?? "",
    sodium: menu.sodium?.toString() ?? "",
    vitamin: (
      (vitamins.data ?? []) as unknown as {
        vitamin: { vitamin: string } | null;
      }[]
    )
      .map((r) => r.vitamin?.vitamin)
      .filter((v): v is string => Boolean(v)),
    allergic: (
      (allergies.data ?? []) as unknown as {
        allergy: { allergy: string } | null;
      }[]
    )
      .map((r) => r.allergy?.allergy)
      .filter((a): a is string => Boolean(a)),
    image_link: menu.image_link,
    recipe_link: null,
    recipe_link_source: null,
    recipe_video_name: null,
  };
};
