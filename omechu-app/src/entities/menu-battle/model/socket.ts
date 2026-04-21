export interface ParticipantJoinedPayload {
  nickname: string;
  joinedAt: string;
}

export interface SpinCompletedPayload {
  nickname: string;
  stoppedAngle: number;
  closestMenuName: string;
  distanceToBoundary: number;
  rank: number;
  spunAt: string;
}

export interface BattleFinishedPayload {
  battleId: string;
  status: "finished";
  finishedAt: string;
  winner: {
    nickname: string;
    closestMenuName: string;
    distanceToBoundary: number;
    rank: number;
  };
}
