'use client';

import { useMemo } from 'react';
import { Category } from '@/types/category';
import { Achievement } from '@/types/achievement';
import categoriesData from '@/data/categories.json';

const categories = categoriesData as Category[];

interface StatusBarChartProps {
  achievements: Achievement[];
}

export default function StatusBarChart({ achievements }: StatusBarChartProps) {
  // 各カテゴリごとの獲得ポイントを計算
  const categoryPoints = useMemo(() => {
    const points: Record<string, number> = {};
    
    categories.forEach(cat => {
      points[cat.id] = 0;
    });
    
    achievements.forEach(achievement => {
      if (achievement.category && achievement.status === 'unlocked') {
        points[achievement.category] += achievement.points;
      }
    });
    
    return points;
  }, [achievements]);

  // 最大ポイントを取得（相対表示用）
  const maxPoint = useMemo(() => {
    return Math.max(...Object.values(categoryPoints), 1);
  }, [categoryPoints]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-md border-2 border-gray-200">
      <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">📊 ステータスバランス</h3>
      
      <div className="space-y-4">
        {categories.map(cat => {
          const current = categoryPoints[cat.id] || 0;
          const percentage = (current / maxPoint) * 100;
          
          return (
            <div key={cat.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cat.icon}</span>
                  <span 
                    className="text-sm font-bold"
                    style={{ color: cat.color }}
                  >
                    {cat.nameJa}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {current} pt
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="h-4 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: cat.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
