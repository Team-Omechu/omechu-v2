export type Player = {
  id: string;
  name: string;
  joinedAt: number;
};

export type PlayerResult = {
  playerId: string;
  name: string;
  menu: string;
  diff: number;
  stoppedAt: number;
};

export type Menu = {
  menuId: string;
  menuName: string;
  centerAngle: number;
  color: string;
};

export type Winner = {
  nickname: string;
  closestMenuName: string;
  distanceToBoundary: number;
  rank: number; // 항상 1
};

export type Ranking = {
  rank: number;
  nickname: string;
  closestMenuName: string;
  distanceToBoundary: number;
};
