import { Achievement } from '@/types/achievement';

interface AchievementListItemProps {
  achievement: Achievement;
  onClick: () => void;
}

export default function AchievementListItem({ achievement, onClick }: AchievementListItemProps) {
  const { title, description, icon, status, difficulty, time } = achievement;

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

  const getDifficultyLabel = () => {
    switch (difficulty) {
      case 'easy': return 'EASY';
      case 'normal': return 'NORMAL';
      case 'hard': return 'HARD';
      case 'unmeasurable': return '測定不能';
      default: return 'NORMAL';
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-lg p-4 
        transition-all duration-200 hover:shadow-md hover:bg-gray-50
        ${statusStyle.bg}
        cursor-pointer border border-gray-200
        flex items-center gap-4
      `}
    >
      {/* アイコン */}
      <div className={`text-4xl flex-shrink-0 ${statusStyle.iconFilter}`}>
        {icon}
      </div>

      {/* コンテンツ */}
      <div className="flex-1 min-w-0">
        {/* タイトル */}
        <h3 className={`text-base font-semibold mb-1 ${statusStyle.textColor}`}>
          {title}
        </h3>
        {/* 説明 */}
        <p className={`text-sm line-clamp-1 ${statusStyle.descColor}`}>
          {description}
        </p>
      </div>

      {/* メタ情報 */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* 難易度 */}
        <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600 min-w-[70px] text-center">
          {getDifficultyLabel()}
        </span>
        {/* 時間 */}
        <span className="text-xs text-gray-600 min-w-[80px]">
          ⏱️ {time}
        </span>
      </div>
    </button>
  );
}

