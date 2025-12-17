'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Achievement, AchievementStatus, AchievementDifficulty, AchievementTime } from '@/types/achievement';
import { Tag } from '@/types/tag';
import tagsData from '@/data/tags.json';
import { formatTime, formatDifficultyText } from '@/lib/formatters';

const DIFFICULTIES: AchievementDifficulty[] = ['easy', 'normal', 'hard', 'unmeasurable'];
const TIMES: AchievementTime[] = ['day', 'week', 'month', 'year', 'over'];
const STATUSES: AchievementStatus[] = ['locked', 'in-progress', 'unlocked'];

const STATUS_LABELS: Record<AchievementStatus, string> = {
  locked: '未解除',
  'in-progress': '挑戦中',
  unlocked: '解除済み',
};

export default function AdminPage() {
  const tags = tagsData as Tag[];
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 初期フォームデータ
  const emptyAchievement: Achievement = {
    id: '',
    title: '',
    description: '',
    category: 'EXP',
    tags: [],
    icon: '',
    points: 0,
    difficulty: 'normal',
    time: 'month',
    status: 'locked',
  };

  const [formData, setFormData] = useState<Achievement>(emptyAchievement);

  // 実績を取得
  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      if (response.ok) {
        const data = await response.json();
        setAchievements(data);
      }
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
      showMessage('error', '実績の取得に失敗しました');
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  // メッセージ表示
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // 新規追加モードを開く
  const openAddMode = () => {
    setFormData(emptyAchievement);
    setIsAddMode(true);
    setEditingAchievement(null);
  };

  // 編集モードを開く
  const openEditMode = (achievement: Achievement) => {
    setFormData(achievement);
    setIsAddMode(false);
    setEditingAchievement(achievement);
  };

  // モーダルを閉じる
  const closeModal = () => {
    setIsAddMode(false);
    setEditingAchievement(null);
    setFormData(emptyAchievement);
  };

  // フォーム送信（新規追加または編集）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isAddMode) {
        // 新規追加
        const response = await fetch('/api/achievements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          showMessage('success', '実績を追加しました');
          fetchAchievements();
          closeModal();
        } else {
          const error = await response.json();
          showMessage('error', error.error || '追加に失敗しました');
        }
      } else if (editingAchievement) {
        // 編集
        const response = await fetch(`/api/achievements/${editingAchievement.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          showMessage('success', '実績を更新しました');
          fetchAchievements();
          closeModal();
        } else {
          showMessage('error', '更新に失敗しました');
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      showMessage('error', '処理に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 実績を削除
  const handleDelete = async (id: string) => {
    if (!confirm('本当にこの実績を削除しますか？')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/achievements/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showMessage('success', '実績を削除しました');
        fetchAchievements();
      } else {
        showMessage('error', '削除に失敗しました');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showMessage('error', '削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // タグの選択/解除
  const toggleTag = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId],
    }));
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* ヘッダー */}
        <header className="mb-12">
          <div className="text-center">
            <h1 className="text-6xl font-bold mb-4 text-gray-700">
              🔧 管理者ページ
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              実績の追加・編集・削除ができます
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-all duration-200 shadow-md"
              >
                ← トップページ
              </Link>
              <button
                onClick={openAddMode}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md"
              >
                ➕ 新規実績を追加
              </button>
            </div>
          </div>
        </header>

        {/* メッセージ */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg text-center font-semibold ${
              message.type === 'success'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* 実績一覧 */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-700 mb-6">
            実績一覧 ({achievements.length}件)
          </h2>
          <div className="space-y-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-white rounded-lg p-6 shadow-md border-2 border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-4xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {achievement.title}
                      </h3>
                      <p className="text-gray-600 mb-2">{achievement.description}</p>
                      <div className="flex flex-wrap gap-2 items-center text-sm">
                        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded">
                          ID: {achievement.id}
                        </span>
                        <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded">
                          {achievement.points}pt
                        </span>
                        <span className="px-2 py-1 bg-purple-200 text-purple-800 rounded">
                          {formatDifficultyText(achievement.difficulty)}
                        </span>
                        <span className="px-2 py-1 bg-orange-200 text-orange-800 rounded">
                          {formatTime(achievement.time)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded ${
                            achievement.status === 'unlocked'
                              ? 'bg-green-200 text-green-800'
                              : achievement.status === 'in-progress'
                              ? 'bg-yellow-200 text-yellow-800'
                              : 'bg-gray-300 text-gray-700'
                          }`}
                        >
                          {STATUS_LABELS[achievement.status]}
                        </span>
                        {achievement.tags.map((tagId) => {
                          const tag = tags.find(t => t.id === tagId);
                          return tag ? (
                            <span key={tagId} className={`px-2 py-1 rounded text-xs ${tag.color}`}>
                              {tag.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditMode(achievement)}
                      className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors"
                    >
                      編集
                    </button>
                    <button
                      onClick={() => handleDelete(achievement.id)}
                      className="px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition-colors"
                      disabled={loading}
                    >
                      削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 編集/追加モーダル */}
      {(isAddMode || editingAchievement) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              {isAddMode ? '🆕 新規実績を追加' : '✏️ 実績を編集'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ID */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ID <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                  required
                  disabled={!isAddMode}
                />
                {!isAddMode && (
                  <p className="text-xs text-gray-500 mt-1">IDは変更できません</p>
                )}
              </div>

              {/* タイトル */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  タイトル <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                  required
                />
              </div>

              {/* 説明 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  説明 <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                  rows={3}
                  required
                />
              </div>

              {/* アイコン */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  アイコン（絵文字） <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                  placeholder="🎮"
                  required
                />
              </div>

              {/* ポイント */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ポイント <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                  min="0"
                  required
                />
              </div>

              {/* 難易度 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  難易度 <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as AchievementDifficulty })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                  required
                >
                  {DIFFICULTIES.map((diff) => (
                    <option key={diff} value={diff}>
                      {formatDifficultyText(diff)}
                    </option>
                  ))}
                </select>
              </div>

              {/* 時間 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  所要時間 <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value as AchievementTime })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                  required
                >
                  {TIMES.map((time) => (
                    <option key={time} value={time}>
                      {formatTime(time)}
                    </option>
                  ))}
                </select>
              </div>

              {/* ステータス */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ステータス <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as AchievementStatus })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
                  required
                >
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>

              {/* タグ */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  タグ（複数選択可）
                </label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                        formData.tags.includes(tag.id)
                          ? `${tag.color} ring-2 ring-gray-600`
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {formData.tags.includes(tag.id) && '✓ '}
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* ボタン */}
              <div className="flex gap-4 justify-end pt-4 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-colors"
                  disabled={loading}
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  disabled={loading}
                >
                  {loading ? '処理中...' : isAddMode ? '追加' : '更新'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

