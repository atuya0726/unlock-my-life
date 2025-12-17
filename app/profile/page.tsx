import ProfileContent from '@/components/ProfileContent';
import { getProfile } from '@/app/actions/profile';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const profile = await getProfile();

  return <ProfileContent initialProfile={profile} />;
}
