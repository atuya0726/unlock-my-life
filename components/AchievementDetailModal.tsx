'use client';

import { Achievement } from '@/types/achievement';
import { Tag } from '@/types/tag';
import { Category } from '@/types/category';
import categoriesData from '@/data/categories.json';
import { formatTime, formatDifficultyText } from '@/lib/formatters';
import { getAllowedStatuses } from '@/lib/achievementConfig';

const categories = categoriesData as Category[];

// ステータスのラベル定義
const statusLabels: Record<Achievement['status'], string> = {
  'locked': '未解除',
  'in-progress': '挑戦中',
  'unlocked': '解除済み',
};

interface AchievementDetailModalProps {
  achievement: Achievement;
  allTags: Tag[];
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (achievementId: string, newStatus: Achievement['status']) => void;
}

export default function AchievementDetailModal({
  achievement,
  allTags,
  isOpen,
  onClose,
  onStatusChange,
}: AchievementDetailModalProps) {
  if (!isOpen) return null;

  const { id, title, description, tags, icon, points, difficulty, time, status, category } = achievement;
  const categoryInfo = categories.find(c => c.id === category);

  // タグIDからタグ情報を取得
  const tagObjects = tags.map(tagId => allTags.find(t => t.id === tagId)).filter(Boolean) as Tag[];

  // この実績で利用可能なステータスを取得
  const allowedStatuses = getAllowedStatuses(id);
  const statusOptions = allowedStatuses.map(value => ({
    value,
    label: statusLabels[value],
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* 背景オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* モーダルコンテンツ */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-lg shadow-xl w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 text-gray-500 hover:text-gray-700 text-xl sm:text-2xl w-8 h-8 flex items-center justify-center"
        >
          ×
        </button>

        <div className="p-5 sm:p-8">
          {/* アイコン */}
          <div className="text-5xl sm:text-7xl mb-3 sm:mb-4 text-center">
            {icon}
          </div>

          {/* カテゴリバッジ */}
          {categoryInfo && (
            <div className="flex justify-center mb-2 sm:mb-3">
              <span 
                className="text-xs sm:text-sm font-bold px-3 sm:px-4 py-1 rounded-full text-white"
                style={{ backgroundColor: categoryInfo.color }}
              >
                {categoryInfo.icon} {categoryInfo.nameJa}（{categoryInfo.id}）
              </span>
            </div>
          )}

          {/* タイトル */}
          <h2 className="text-xl sm:text-3xl font-bold text-gray-700 mb-3 sm:mb-4 text-center">
            {title}
          </h2>

          {/* 説明 */}
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 text-center leading-relaxed">
            {description}
          </p>

          {/* 情報グリッド */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6 bg-gray-50 rounded-lg p-3 sm:p-4">
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">難易度</div>
              <div className="text-sm sm:text-base font-semibold text-gray-700">{formatDifficultyText(difficulty)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">ポイント</div>
              <div className="text-sm sm:text-base font-semibold text-gray-700">{points}pt</div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-500 mb-0.5 sm:mb-1">目安時間</div>
              <div className="text-sm sm:text-base font-semibold text-gray-700">{formatTime(time)}</div>
            </div>
          </div>

          {/* タグ */}
          {tagObjects.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <div className="text-xs sm:text-sm text-gray-500 mb-2">タグ</div>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {tagObjects.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-xs sm:text-sm font-semibold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-gray-200 text-gray-700"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ステータス変更 - セグメントコントロール */}
          <div className="mb-2 sm:mb-4">
            <div className="text-xs sm:text-sm text-gray-500 mb-2 text-center">ステータス</div>
            <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
              {statusOptions.map((option) => {
                const isSelected = status === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      if (!isSelected) {
                        onStatusChange(id, option.value);
                      }
                    }}
                    className={`
                      flex-1 px-2 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold rounded-md transition-all duration-200
                      ${isSelected
                        ? 'bg-gray-700 text-white shadow-sm'
                        : 'bg-transparent text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {option.label}
                    {isSelected && option.value === 'unlocked' && ' ✓'}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

