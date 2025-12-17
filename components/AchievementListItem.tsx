import { Achievement } from '@/types/achievement';
import { Category } from '@/types/category';
import categoriesData from '@/data/categories.json';
import { formatTime, formatDifficultyText } from '@/lib/formatters';

const categories = categoriesData as Category[];

interface AchievementListItemProps {
  achievement: Achievement;
  onClick: () => void;
}

export default function AchievementListItem({ achievement, onClick }: AchievementListItemProps) {
  const { title, description, icon, status, difficulty, time, category } = achievement;
  const categoryInfo = categories.find(c => c.id === category);

  // ステータスに応じたスタイル
  const getStatusStyle = () => {
    switch (status) {
      case 'unlocked':
        return {
          bg: 'bg-gray-50 opacity-70',
          textColor: 'text-gray-500',
          descColor: 'text-gray-400',
          iconFilter: 'grayscale',
        };
      case 'in-progress':
        return {
          bg: 'bg-white border-l-4 border-gray-600',
          textColor: 'text-gray-700',
          descColor: 'text-gray-600',
          iconFilter: '',
        };
      case 'locked':
        return {
          bg: 'bg-white',
          textColor: 'text-gray-700',
          descColor: 'text-gray-600',
          iconFilter: '',
        };
      default:
        return {
          bg: 'bg-white',
          textColor: 'text-gray-700',
          descColor: 'text-gray-600',
          iconFilter: '',
        };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-lg p-3 sm:p-4 
        transition-all duration-200 hover:shadow-md hover:bg-gray-50
        ${statusStyle.bg}
        cursor-pointer border border-gray-200
        flex items-center gap-2 sm:gap-4
      `}
    >
      {/* アイコン */}
      <div className={`text-2xl sm:text-4xl flex-shrink-0 ${statusStyle.iconFilter}`}>
        {icon}
      </div>

      {/* コンテンツ */}
      <div className="flex-1 min-w-0">
        <h3 className={`text-sm sm:text-base font-semibold ${statusStyle.textColor} truncate mb-0.5 sm:mb-1`}>
          {title}
        </h3>
        <p className={`text-xs sm:text-sm line-clamp-1 ${statusStyle.descColor}`}>
          {description}
        </p>
      </div>

      {/* メタ情報（右揃え） */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 text-right">
        {/* カテゴリ */}
        {categoryInfo && (
          <span 
            className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-white"
            style={{ backgroundColor: status === 'unlocked' ? '#9CA3AF' : categoryInfo.color }}
          >
            {categoryInfo.id}
          </span>
        )}
        {/* 難易度 */}
        <span className="text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-gray-100 text-gray-600">
          {formatDifficultyText(difficulty)}
        </span>
        {/* 時間 */}
        <span className="text-[10px] sm:text-xs text-gray-600 whitespace-nowrap">
          {formatTime(time)}
        </span>
      </div>
    </button>
  );
}

