-- ============================================================
-- 1. TAGS (タグマスタ - 10件)
-- ============================================================
INSERT INTO public.tags (name, is_official)
VALUES
  ('資格', true),
  ('語学', true),
  ('お金', true),
  ('資産形成', true),
  ('健康', true),
  ('筋トレ', true),
  ('アウトドア', true),
  ('グルメ', true),
  ('旅行', true),
  ('人間関係', true)
ON CONFLICT (name) DO NOTHING;


-- ============================================================
-- 2. ACHIEVEMENTS (公式実績 - 50件)
-- icon_path に絵文字を直接設定
-- 難易度: easy, normal, hard
-- ============================================================

-- ■ INT (知力)
INSERT INTO public.achievements (category, code, title, base_points, difficulty, estimated_time, is_official, icon_path)
VALUES
  ('INT', 'INT_READING_1',    '読書家への第一歩 (1冊読破)', 10, 'easy', 'day', true, '📖'),
  ('INT', 'INT_READING_50',   '本の虫 (年間50冊)', 200, 'normal', 'year', true, '📚'),
  ('INT', 'INT_EIKEN_3',      '英検3級 合格', 30, 'easy', 'month', true, '📝'),
  ('INT', 'INT_EIKEN_2',      '英検2級 合格', 100, 'normal', 'month', true, '💮'),
  ('INT', 'INT_EIKEN_1',      '英検1級 合格', 500, 'hard', 'year', true, '👑'),
  ('INT', 'INT_TOEIC_600',    'TOEIC 600点突破', 50, 'easy', 'month', true, '🅰️'),
  ('INT', 'INT_TOEIC_800',    'TOEIC 800点突破', 200, 'normal', 'month', true, '🅰️'),
  ('INT', 'INT_BOKI_3',       '日商簿記3級', 50, 'easy', 'month', true, '🧮'),
  ('INT', 'INT_IT_PASS',      'ITパスポート', 30, 'easy', 'week', true, '💻'),
  ('INT', 'INT_HISTORY_MUSEUM', '博物館に行った', 20, 'easy', 'day', true, '🏛️')
ON CONFLICT (code) DO UPDATE 
SET title = EXCLUDED.title, base_points = EXCLUDED.base_points, difficulty = EXCLUDED.difficulty, icon_path = EXCLUDED.icon_path;

-- ■ WLT (財力)
INSERT INTO public.achievements (category, code, title, base_points, difficulty, estimated_time, is_official, icon_path)
VALUES
  ('WLT', 'WLT_WALLET_CLEAN', '財布の中身を整理した', 10, 'easy', 'day', true, '👛'),
  ('WLT', 'WLT_KAKEIBO_1M',   '家計簿を1ヶ月つけた', 50, 'easy', 'month', true, '📒'),
  ('WLT', 'WLT_SAVING_100K',  '貯金10万円達成', 30, 'easy', 'month', true, '💰'),
  ('WLT', 'WLT_SAVING_1M',    '貯金100万円達成', 200, 'normal', 'year', true, '💰'),
  ('WLT', 'WLT_SAVING_10M',   '貯金1000万円達成', 1000, 'hard', 'over', true, '🏦'),
  ('WLT', 'WLT_NISA_START',   'つみたてNISAを始めた', 50, 'easy', 'week', true, '📈'),
  ('WLT', 'WLT_FURUSATO',     'ふるさと納税をした', 30, 'easy', 'day', true, '🎁'),
  ('WLT', 'WLT_BUY_MACBOOK',  'MacBookを買った', 50, 'easy', 'day', true, '💻'),
  ('WLT', 'WLT_BUY_CAR',      'マイカー購入', 500, 'normal', 'over', true, '🚗'),
  ('WLT', 'WLT_BUY_HOME',     'マイホーム購入', 2000, 'hard', 'over', true, '🏠')
ON CONFLICT (code) DO UPDATE 
SET title = EXCLUDED.title, base_points = EXCLUDED.base_points, difficulty = EXCLUDED.difficulty, icon_path = EXCLUDED.icon_path;

-- ■ VIT (体力)
INSERT INTO public.achievements (category, code, title, base_points, difficulty, estimated_time, is_official, icon_path)
VALUES
  ('VIT', 'VIT_WALK_10K',     '1日1万歩あるいた', 10, 'easy', 'day', true, '👣'),
  ('VIT', 'VIT_RUN_5KM',      '5kmランニング完走', 30, 'easy', 'day', true, '🏃'),
  ('VIT', 'VIT_RUN_FULL',     'フルマラソン完走', 500, 'hard', 'month', true, '🥇'),
  ('VIT', 'VIT_GYM_JOIN',     'ジムに入会した', 20, 'easy', 'day', true, '💪'),
  ('VIT', 'VIT_BENCH_40',     'ベンチプレス 40kg', 30, 'easy', 'month', true, '🏋️'),
  ('VIT', 'VIT_BENCH_100',    'ベンチプレス 100kg', 300, 'hard', 'year', true, '🦍'),
  ('VIT', 'VIT_FASTING_1D',   '1日断食をした', 50, 'easy', 'day', true, '🍽️'),
  ('VIT', 'VIT_CHECKUP_A',    '健康診断オールA', 200, 'normal', 'year', true, '🩺'),
  ('VIT', 'VIT_DENTAL',       '歯の定期検診に行った', 20, 'easy', 'day', true, '🦷'),
  ('VIT', 'VIT_SLEEP_8H',     '8時間睡眠をした', 10, 'easy', 'day', true, '🛌')
ON CONFLICT (code) DO UPDATE 
SET title = EXCLUDED.title, base_points = EXCLUDED.base_points, difficulty = EXCLUDED.difficulty, icon_path = EXCLUDED.icon_path;

-- ■ SOC (社会)
INSERT INTO public.achievements (category, code, title, base_points, difficulty, estimated_time, is_official, icon_path)
VALUES
  ('SOC', 'SOC_VOTE',         '選挙の投票に行った', 20, 'easy', 'day', true, '🗳️'),
  ('SOC', 'SOC_BLOOD',        '献血をした', 30, 'easy', 'day', true, '🩸'),
  ('SOC', 'SOC_VOLUNTEER',    'ボランティアに参加した', 50, 'easy', 'day', true, '🤝'),
  ('SOC', 'SOC_SNS_100',      'SNSフォロワー100人', 20, 'easy', 'month', true, '📱'),
  ('SOC', 'SOC_SNS_1000',     'SNSフォロワー1000人', 100, 'normal', 'year', true, '📡'),
  ('SOC', 'SOC_PRESENT',      '親にプレゼントを贈った', 30, 'easy', 'day', true, '🎁'),
  ('SOC', 'SOC_PARTY_HOST',   'ホームパーティを主催した', 50, 'easy', 'week', true, '🎉'),
  ('SOC', 'SOC_LOVE_PARTNER', '恋人ができた', 200, 'normal', 'month', true, '👩‍❤️‍👨'),
  ('SOC', 'SOC_MARRIAGE',     '結婚した', 1000, 'hard', 'over', true, '💍'),
  ('SOC', 'SOC_LEADER',       'リーダー職に昇進', 300, 'normal', 'over', true, '💼')
ON CONFLICT (code) DO UPDATE 
SET title = EXCLUDED.title, base_points = EXCLUDED.base_points, difficulty = EXCLUDED.difficulty, icon_path = EXCLUDED.icon_path;

-- ■ EXP (経験)
INSERT INTO public.achievements (category, code, title, base_points, difficulty, estimated_time, is_official, icon_path)
VALUES
  ('EXP', 'EXP_BORN',         'この世に生を受けた', 0, 'unmeasurable', 'over', true, '🌟'),
  ('EXP', 'EXP_MOVIE_ALONE',  '一人映画館', 10, 'easy', 'day', true, '🎬'),
  ('EXP', 'EXP_SUSHI_COUNTER','回らない寿司屋に行った', 50, 'easy', 'day', true, '🍣'),
  ('EXP', 'EXP_FRENCH_FULL',  'フレンチフルコース完食', 80, 'easy', 'day', true, '🍽️'),
  ('EXP', 'EXP_CAMP_SOLO',    'ソロキャンプをした', 50, 'normal', 'day', true, '⛺'),
  ('EXP', 'EXP_SAUNA',        'サウナでととのった', 20, 'easy', 'day', true, '🧖'),
  ('EXP', 'EXP_BUNGEE',       'バンジージャンプ', 100, 'normal', 'day', true, '🪂'),
  ('EXP', 'EXP_TRIP_DOMESTIC','国内旅行に行った', 50, 'easy', 'day', true, '🚅'),
  ('EXP', 'EXP_TRIP_OVERSEAS','海外旅行に行った', 200, 'normal', 'week', true, '✈️'),
  ('EXP', 'EXP_TRIP_WORLD',   '世界一周', 5000, 'hard', 'year', true, '🌍'),
  ('EXP', 'EXP_FIRST_CLASS',  'ファーストクラスに乗った', 300, 'hard', 'day', true, '🥂')
ON CONFLICT (code) DO UPDATE 
SET title = EXCLUDED.title, base_points = EXCLUDED.base_points, difficulty = EXCLUDED.difficulty, icon_path = EXCLUDED.icon_path;


-- ============================================================
-- 3. ACHIEVEMENT_TAGS (紐付け - 動作確認用)
-- ============================================================

INSERT INTO public.achievement_tags (achievement_id, tag_id)
VALUES
  -- 英語系 (INT)
  ((SELECT id FROM achievements WHERE code = 'INT_EIKEN_2'), (SELECT id FROM tags WHERE name = '資格')),
  ((SELECT id FROM achievements WHERE code = 'INT_EIKEN_2'), (SELECT id FROM tags WHERE name = '語学')),
  ((SELECT id FROM achievements WHERE code = 'INT_TOEIC_600'), (SELECT id FROM tags WHERE name = '資格')),
  ((SELECT id FROM achievements WHERE code = 'INT_TOEIC_600'), (SELECT id FROM tags WHERE name = '語学')),
  
  -- お金系 (WLT)
  ((SELECT id FROM achievements WHERE code = 'WLT_SAVING_1M'), (SELECT id FROM tags WHERE name = '資産形成')),
  ((SELECT id FROM achievements WHERE code = 'WLT_SAVING_1M'), (SELECT id FROM tags WHERE name = 'お金')),
  ((SELECT id FROM achievements WHERE code = 'WLT_NISA_START'), (SELECT id FROM tags WHERE name = '資産形成')),
  
  -- 筋トレ系 (VIT)
  ((SELECT id FROM achievements WHERE code = 'VIT_GYM_JOIN'), (SELECT id FROM tags WHERE name = '健康')),
  ((SELECT id FROM achievements WHERE code = 'VIT_GYM_JOIN'), (SELECT id FROM tags WHERE name = '筋トレ')),
  ((SELECT id FROM achievements WHERE code = 'VIT_BENCH_100'), (SELECT id FROM tags WHERE name = '筋トレ')),
  
  -- 旅行・グルメ (EXP)
  ((SELECT id FROM achievements WHERE code = 'EXP_TRIP_OVERSEAS'), (SELECT id FROM tags WHERE name = '旅行')),
  ((SELECT id FROM achievements WHERE code = 'EXP_CAMP_SOLO'), (SELECT id FROM tags WHERE name = 'アウトドア')),
  ((SELECT id FROM achievements WHERE code = 'EXP_SUSHI_COUNTER'), (SELECT id FROM tags WHERE name = 'グルメ')),
  ((SELECT id FROM achievements WHERE code = 'EXP_FRENCH_FULL'), (SELECT id FROM tags WHERE name = 'グルメ')),
  
  -- 複合パターン確認用
  ((SELECT id FROM achievements WHERE code = 'EXP_TRIP_WORLD'), (SELECT id FROM tags WHERE name = '旅行')),
  ((SELECT id FROM achievements WHERE code = 'EXP_TRIP_WORLD'), (SELECT id FROM tags WHERE name = 'アウトドア'))

ON CONFLICT (achievement_id, tag_id) DO NOTHING;