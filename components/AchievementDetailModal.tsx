'use client';

import { Achievement } from '@/types/achievement';
import { Tag } from '@/types/tag';

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

  const { id, title, description, tags, icon, points, difficulty, time, status } = achievement;

  // タグIDからタグ情報を取得
  const tagObjects = tags.map(tagId => allTags.find(t => t.id === tagId)).filter(Boolean) as Tag[];

  // 難易度に応じたスタイルとラベル
  const getDifficultyLabel = () => {
    switch (difficulty) {
      case 'easy': return 'EASY';
      case 'normal': return 'NORMAL';
      case 'hard': return 'HARD';
      case 'unmeasurable': return '測定不能';
      default: return 'NORMAL';
    }
  };

  // ステータスオプションの定義
  const statusOptions: Array<{ value: Achievement['status']; label: string }> = [
    { value: 'locked', label: '未解除' },
    { value: 'in-progress', label: '挑戦中' },
    { value: 'unlocked', label: '解除済み' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景オーバーレイ */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* モーダルコンテンツ */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl w-8 h-8 flex items-center justify-center"
        >
          ×
        </button>

        <div className="p-8">
          {/* アイコン */}
          <div className="text-7xl mb-4 text-center">
            {icon}
          </div>

          {/* タイトル */}
          <h2 className="text-3xl font-bold text-gray-700 mb-4 text-center">
            {title}
          </h2>

          {/* 説明 */}
          <p className="text-gray-600 mb-6 text-center leading-relaxed">
            {description}
          </p>

          {/* 情報グリッド */}
          <div className="grid grid-cols-3 gap-4 mb-6 bg-gray-50 rounded-lg p-4">
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">難易度</div>
              <div className="font-semibold text-gray-700">{getDifficultyLabel()}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">ポイント</div>
              <div className="font-semibold text-gray-700">{points}pt</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">目安時間</div>
              <div className="font-semibold text-gray-700">{time}</div>
            </div>
          </div>

          {/* タグ */}
          {tagObjects.length > 0 && (
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-2">カテゴリ</div>
              <div className="flex flex-wrap gap-2">
                {tagObjects.map((tag) => (
                  <span
                    key={tag.id}
                    className="text-sm font-semibold px-3 py-1 rounded-full bg-gray-200 text-gray-700"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* ステータス変更 - セグメントコントロール */}
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-2 text-center">ステータス</div>
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
                      flex-1 px-4 py-3 text-sm font-semibold rounded-md transition-all duration-200
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

