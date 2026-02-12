import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerClient();

  const { data: currentUser } = await supabase
    .from('users')
    .select('org_id')
    .eq('clerk_user_id', userId)
    .single();

  if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { data: members } = await supabase
    .from('users')
    .select('id, full_name, email, role, created_at')
    .eq('org_id', currentUser.org_id)
    .order('created_at', { ascending: true });

  return NextResponse.json({ members: members || [] });
}