import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  exceptMenu,
  fetchRecommendManagement,
  removeExceptMenu,
} from "@/entities/user/api/recommendApi";
import { useAuthStore } from "@/entities/user/model/auth.store";
import type {
  ExceptMenuRequest,
  RemoveExceptMenuRequest,
} from "@/entities/user/model/recommend.types";

const RECOMMEND_MANAGEMENT_KEY = ["user", "recommend", "management"] as const;

export function useRecommendManagement() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: RECOMMEND_MANAGEMENT_KEY,
    queryFn: fetchRecommendManagement,
    enabled: !!accessToken,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useExceptMenuMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExceptMenuRequest) => exceptMenu(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECOMMEND_MANAGEMENT_KEY });
    },
  });
}

export function useRemoveExceptMenuMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RemoveExceptMenuRequest) => removeExceptMenu(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECOMMEND_MANAGEMENT_KEY });
    },
  });
}
