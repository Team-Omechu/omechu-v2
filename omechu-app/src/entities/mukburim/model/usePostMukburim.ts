import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { mukburimResponse } from "@/entities/mukburim/config/mukburim";
import { postMukburim } from "@/entities/mukburim/api/postMukburim";

export function usePostMukburim() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<mukburimResponse, Error, string>({
    // menu_name을 파라미터로 받도록!
    mutationFn: (menu_name) => postMukburim(menu_name),
    onSuccess: (data, menu_name) => {
      // 관련된 쿼리만 새로고침! (예시로 "mukburim" 지정)
      queryClient.invalidateQueries({ queryKey: ["mukburim"] });
      queryClient.invalidateQueries({ queryKey: ["mukburim-statistics"] });
    },
  });
}
