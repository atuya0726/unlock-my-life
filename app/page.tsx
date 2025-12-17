import HomeContent from '@/components/HomeContent';
import { getAchievements, getTags } from '@/app/actions/achievements';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import categoriesData from '@/data/categories.json';
import { Category } from '@/types/category';

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const [achievements, tags] = await Promise.all([
    getAchievements(),
    getTags(),
  ]);

  const categories = categoriesData as Category[];

  return (
    <HomeContent 
      initialAchievements={achievements}
      initialTags={tags}
      categories={categories}
      isLoggedIn={!!user}
    />
  );
}
