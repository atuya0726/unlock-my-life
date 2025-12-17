import { Achievement } from '@/types/achievement';
import { Category } from '@/types/category';
import categoriesData from '@/data/categories.json';

const categories = categoriesData as Category[];

interface AchievementCardProps {
  achievement: Achievement;
  onClick: () => void;
}

export default function AchievementCard({ achievement, onClick }: AchievementCardProps) {
  const { title, description, icon, status, difficulty, time, category } = achievement;
  const categoryInfo = categories.find(c => c.id === category);

  // ステータスに応じたスタイル
  const getStatusStyle = () => {
    switch (status) {
      case 'unlocked':
        return {
          bg: 'bg-gray-100 border border-gray-300 opacity-70',
          textColor: 'text-gray-500',
          descColor: 'text-gray-400',
          iconFilter: 'grayscale',
        };
      case 'in-progress':
        return {
          bg: 'bg-white border border-gray-400',
          textColor: 'text-gray-700',
          descColor: 'text-gray-600',
          iconFilter: '',
        };
      case 'locked':
        return {
          bg: 'bg-white border border-gray-300',
          textColor: 'text-gray-700',
          descColor: 'text-gray-600',
          iconFilter: '',
        };
      default:
        return {
          bg: 'bg-white border border-gray-300',
          textColor: 'text-gray-700',
          descColor: 'text-gray-600',
          iconFilter: '',
        };
    }
  };

  const statusStyle = getStatusStyle();

  // 難易度ラベル
  const getDifficultyLabel = () => {
    switch (difficulty) {
      case 'easy': return 'EASY';
      case 'normal': return 'NORMAL';
      case 'hard': return 'HARD';
      case 'unmeasurable': return '測定不能';
      default: return 'NORMAL';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-lg p-2 sm:p-4 
        transition-all duration-200 hover:shadow-md hover:scale-[1.02]
        ${statusStyle.bg}
        cursor-pointer
      `}
    >
      {/* アイコン */}
      <div className={`text-2xl sm:text-4xl mb-1 sm:mb-2 text-center ${statusStyle.iconFilter}`}>
        {icon}
      </div>

      {/* タイトル */}
      <h3 className={`text-xs sm:text-sm font-semibold text-center mb-0.5 sm:mb-1 line-clamp-2 ${statusStyle.textColor}`}>
        {title}
      </h3>

      {/* 説明（モバイルでは非表示） */}
      <p className={`hidden sm:block text-xs text-center mb-2 line-clamp-2 ${statusStyle.descColor}`}>
        {description}
      </p>

      {/* カテゴリバッジ */}
      {categoryInfo && (
        <div className="flex justify-center mb-1 sm:mb-2">
          <span 
            className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: status === 'unlocked' ? '#9CA3AF' : categoryInfo.color }}
          >
            {categoryInfo.nameJa}
          </span>
        </div>
      )}

      {/* メタ情報（モバイルでは非表示） */}
      <div className="hidden sm:flex items-center justify-center gap-2 text-xs">
        <span className={`font-semibold ${statusStyle.descColor}`}>
          {getDifficultyLabel()}
        </span>
        <span className={statusStyle.descColor}>•</span>
        <span className={statusStyle.descColor}>
          {time}
        </span>
      </div>
    </button>
  );
}
