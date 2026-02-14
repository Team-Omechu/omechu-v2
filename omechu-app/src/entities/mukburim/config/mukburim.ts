export const MUKBURIM_ERROR_CODE = {
  NOT_FOUND: "MK001",
  STATISTICS_FAILED: "MK005",
} as const;

export type mukburimResponse = {
  resultType: string;
  error: null;
  success: {
    id: number;
    user_id: number;
    menu_name: string;
    date: string;
  };
};
