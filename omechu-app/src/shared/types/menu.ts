export type RandomMenu = {
  name: string;
  image_link: string;
};

export type MenuItem = {
  menu: string;
  text: string;
  image_link: string;
  allergens: string[];
};

export type MenuListResponse = {
  query_text: string;
  results: MenuItem[];
};
