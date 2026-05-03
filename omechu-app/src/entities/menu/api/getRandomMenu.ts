import {
  type RandomMenu,
  type RandomMenuRequest,
} from "@/entities/menu/config/resultData";

import { createSupabaseBrowserClient } from "@/shared/lib/supabase";

interface MenuRow {
  id: number;
  name: string;
  image_link: string | null;
}

export const getRandomMenu = async (
  request: RandomMenuRequest,
): Promise<RandomMenu> => {
  const sb = createSupabaseBrowserClient();
  const tags = request.addition ?? null;

  const { data, error } = await sb.rpc("recommend_random", {
    tags,
    limit_count: 1,
  });
  if (error) throw error;

  const rows = (data ?? []) as MenuRow[];
  const picked = rows[0];
  if (!picked) throw new Error("no menu matched");

  return {
    name: picked.name,
    image_link: picked.image_link ?? "",
  };
};
