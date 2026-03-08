import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import DashboardShell from './DashboardShell';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = createServerClient();
  const { data: user } = await supabase
    .from('users')
    .select('*, organizations(*)')
    .eq('clerk_user_id', userId)
    .single();

  return <DashboardShell user={user}>{children}</DashboardShell>;
}