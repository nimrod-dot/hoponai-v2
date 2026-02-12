import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { email, role } = await req.json();
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

  const supabase = createServerClient();

  const { data: currentUser } = await supabase
    .from('users')
    .select('id, org_id, role')
    .eq('clerk_user_id', userId)
    .single();

  if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Only owners and admins can invite
  if (!['owner', 'admin'].includes(currentUser.role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const token = randomBytes(32).toString('hex');

  const { error } = await supabase.from('team_invites').insert({
    org_id: currentUser.org_id,
    invited_by: currentUser.id,
    email,
    role: role || 'member',
    token,
  });

  if (error) {
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
  }

  // TODO: Send invite email via Resend or SendGrid
  // For now, the invite link would be:
  // ${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}

  return NextResponse.json({ success: true, token });
}