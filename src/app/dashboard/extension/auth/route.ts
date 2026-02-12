import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// Extension calls this to verify the user and get org context
export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerClient();

  const { data: user } = await supabase
    .from('users')
    .select('id, full_name, email, role, org_id, organizations(id, name, plan)')
    .eq('clerk_user_id', userId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Only trainers, admins, and owners can record
  const canRecord = ['owner', 'admin', 'trainer'].includes(user.role);

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.full_name,
      email: user.email,
      role: user.role,
      canRecord,
    },
    organization: user.organizations,
  });
}