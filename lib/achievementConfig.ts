import { AchievementStatus } from '@/types/achievement';

/**
 * 実績ごとの特別な設定
 * - allowedStatuses: 選択可能なステータス（指定しない場合はすべて選択可能）
 * - 今後、他の制限も追加可能（例: canUnlock, requiresAchievements など）
 */
interface AchievementConfig {
  allowedStatuses?: AchievementStatus[];
  // 将来の拡張用
  // canUnlock?: boolean;
  // requiresAchievements?: string[];
}

/**
 * 実績IDごとの設定マップ
 */
const achievementConfigs: Record<string, AchievementConfig> = {
  // 「この世に生を受ける」は未解除か解除済みのみ（挑戦中は不可）
  'EXP_BORN': {
    allowedStatuses: ['locked', 'unlocked'],
  },
  // 他の実績の設定を追加可能
  // 'SOME_OTHER_ID': {
  //   allowedStatuses: ['locked', 'in-progress'],
  // },
};

/**
 * デフォルトで利用可能なすべてのステータス
 */
const defaultStatuses: AchievementStatus[] = ['locked', 'in-progress', 'unlocked'];

/**
 * 指定した実績IDで利用可能なステータスを取得
 */
export function getAllowedStatuses(achievementId: string): AchievementStatus[] {
  const config = achievementConfigs[achievementId];
  return config?.allowedStatuses || defaultStatuses;
}

/**
 * 実績の設定を取得
 */
export function getAchievementConfig(achievementId: string): AchievementConfig | undefined {
  return achievementConfigs[achievementId];
}
