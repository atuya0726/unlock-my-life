import { Achievement } from '@/types/achievement';

interface AchievementCardProps {
  achievement: Achievement;
  onClick: () => void;
}

export default function AchievementCard({ achievement, onClick }: AchievementCardProps) {
  const { title, description, icon, status, difficulty, time } = achievement;

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
        w-full text-left rounded-lg p-4 
        transition-all duration-200 hover:shadow-md hover:scale-[1.02]
        ${statusStyle.bg}
        cursor-pointer
      `}
    >
      {/* アイコン */}
      <div className={`text-4xl mb-2 text-center ${statusStyle.iconFilter}`}>
        {icon}
      </div>

      {/* タイトル */}
      <h3 className={`text-sm font-semibold text-center mb-1 line-clamp-2 ${statusStyle.textColor}`}>
        {title}
      </h3>

      {/* 説明 */}
      <p className={`text-xs text-center mb-2 line-clamp-2 ${statusStyle.descColor}`}>
        {description}
      </p>

      {/* メタ情報 */}
      <div className="flex items-center justify-center gap-2 text-xs">
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
