import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postMukburim } from "@/entities/mukburim/api/postMukburim";
import { type MukburimResponse } from "@/entities/mukburim/config/mukburim";

export function usePostMukburim() {
  const queryClient = useQueryClient();

  return useMutation<MukburimResponse, Error, string>({
    mutationFn: (menuName) => postMukburim(menuName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mukburim"] });
      queryClient.invalidateQueries({ queryKey: ["mukburim-statistics"] });
    },
  });
}
