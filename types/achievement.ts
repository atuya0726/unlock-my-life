export type AchievementStatus = 'unlocked' | 'locked' | 'in-progress';
export type AchievementDifficulty = 'easy' | 'normal' | 'hard' | 'unmeasurable';
export type AchievementTime = '1日程度' | '一週間程度' | '一ヶ月程度' | '一年程度' | '四年程度' | 'それ以上';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  tags: string[];
  icon: string;
  points: number;
  difficulty: AchievementDifficulty;
  time: AchievementTime;
  status: AchievementStatus;
}

