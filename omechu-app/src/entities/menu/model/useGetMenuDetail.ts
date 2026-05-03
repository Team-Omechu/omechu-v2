import { useQuery } from "@tanstack/react-query";

import { getMenuDetail } from "@/entities/menu/api/getMenuDetail";
import { type MenuDetail } from "@/entities/menu/model/menu.types";

const MENU_DETAIL_STALE_TIME_MS = 5 * 60 * 1000;
const MENU_DETAIL_GC_TIME_MS = 5 * 60 * 1000;

export function useGetMenuDetail(menuName?: string) {
  return useQuery<MenuDetail>({
    queryKey: ["menuDetail", (menuName ?? "").trim()],
    queryFn: ({ queryKey }) => getMenuDetail(queryKey[1] as string),
    enabled: !!menuName,
    staleTime: MENU_DETAIL_STALE_TIME_MS,
    refetchOnWindowFocus: false,
    retry: 0,
    gcTime: MENU_DETAIL_GC_TIME_MS,
  });
}
