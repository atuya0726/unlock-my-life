import { AchievementTime, AchievementDifficulty } from '@/types/achievement';

/**
 * 所要時間を日本語表示に変換
 */
export function formatTime(time: AchievementTime): string {
  const timeLabels: Record<AchievementTime, string> = {
    day: '1日',
    week: '1週間',
    month: '1ヶ月',
    year: '1年',
    over: '1年以上',
  };
  return timeLabels[time] || time;
}

/**
 * 難易度を星マークで表示
 */
export function formatDifficulty(difficulty: AchievementDifficulty): string {
  const difficultyLabels: Record<AchievementDifficulty, string> = {
    easy: '★☆☆',
    normal: '★★☆',
    hard: '★★★',
    unmeasurable: '？',
  };
  return difficultyLabels[difficulty] || difficulty;
}

/**
 * 難易度を日本語テキストで表示
 */
export function formatDifficultyText(difficulty: AchievementDifficulty): string {
  const difficultyLabels: Record<AchievementDifficulty, string> = {
    easy: '簡単',
    normal: '普通',
    hard: '難しい',
    unmeasurable: '計測不能',
  };
  return difficultyLabels[difficulty] || difficulty;
}

/**
 * 所要時間を日数に変換（ソート用）
 */
export function getTimeValue(time: AchievementTime): number {
  const timeValues: Record<AchievementTime, number> = {
    day: 1,
    week: 7,
    month: 30,
    year: 365,
    over: 9999,
  };
  return timeValues[time] || 0;
}

/**
 * 難易度を数値に変換（ソート用）
 */
export function getDifficultyValue(difficulty: AchievementDifficulty): number {
  const difficultyValues: Record<AchievementDifficulty, number> = {
    easy: 1,
    normal: 2,
    hard: 3,
    unmeasurable: 4,
  };
  return difficultyValues[difficulty] || 2;
}
