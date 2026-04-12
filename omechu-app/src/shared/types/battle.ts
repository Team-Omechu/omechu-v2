export interface BattleResponse {
  battleId: string;
  creatorNickname: string;
  status: "active" | "finished";
  participantCount: number;
  createdAt: string;
  finishedAt: string | null;
  expiresAt: string;

  menus: {
    menuId: string;
    menuName: string;
    boundaryAngle: number;
    menuOrder: number;
    imageLink: string | null;
  }[];

  participants: {
    nickname: string;
    isCreator: boolean;
    joinedAt: string;
  }[];

  spinResults: {
    nickname: string;
    stoppedAngle: number;
    closestMenuName: string;
    distanceToBoundary: number;
    rank: number;
    spunAt: string;
  }[];
}
