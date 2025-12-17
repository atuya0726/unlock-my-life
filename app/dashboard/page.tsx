import DashboardContent from '@/components/DashboardContent';
import { getAchievements, getTags } from '@/app/actions/achievements';
import { createServerSupabaseClient } from '@/lib/supabase-server';

export default async function Dashboard() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const [achievements, tags] = await Promise.all([
    getAchievements(),
    getTags(),
  ]);

  return (
    <DashboardContent 
      initialAchievements={achievements}
      tags={tags}
      isLoggedIn={!!user}
    />
  );
}
