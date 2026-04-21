import { type mukburimResponse } from "@/entities/mukburim/config/mukburim";

import { axiosInstance } from "@/shared";

export const postMukburim = async (
  menuName: string,
): Promise<mukburimResponse> => {
  const { data } = await axiosInstance.post<mukburimResponse>(
    "/menu/mukburim",
    {
      menu_name: menuName,
    },
  );
  return data;
};
