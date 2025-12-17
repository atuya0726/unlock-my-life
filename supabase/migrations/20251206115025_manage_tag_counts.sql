-- --------------------------------------------------------
-- 6. Tag Count Trigger (タグ使用数自動集計)
-- アプリ側で +1 しなくても、DBが勝手に計算するようにする
-- --------------------------------------------------------

-- 1. カウントを増減させる「関数」を作る
create or replace function public.handle_tag_count()
returns trigger as $$
begin
  -- タグが紐付けられた時 (INSERT)
  if (TG_OP = 'INSERT') then
    update public.tags
    set usage_count = usage_count + 1
    where id = new.tag_id;
    return new;
  
  -- タグの紐付けが解除された時 (DELETE)
  elsif (TG_OP = 'DELETE') then
    update public.tags
    set usage_count = usage_count - 1
    where id = old.tag_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;


-- 2. その関数を「中間テーブル」の変更時に発動させる「トリガー」を作る
create trigger on_achievement_tag_change
  after insert or delete on public.achievement_tags
  for each row execute procedure public.handle_tag_count();