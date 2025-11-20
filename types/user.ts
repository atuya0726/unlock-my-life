export interface User {
  id: string;
  name: string;
  avatar: string;
  totalPoints: number;
  unlockedCount: number;
  achievementRate: number;
  isCurrentUser?: boolean;
}

