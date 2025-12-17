import { CategoryId } from './category';

export type AchievementStatus = 'unlocked' | 'locked' | 'in-progress';
export type AchievementDifficulty = 'easy' | 'normal' | 'hard' | 'unmeasurable';
export type AchievementTime = 'day' | 'week' | 'month' | 'year' | 'over';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: CategoryId;
  tags: string[];
  icon: string;
  points: number;
  difficulty: AchievementDifficulty;
  time: AchievementTime;
  status: AchievementStatus;
}

