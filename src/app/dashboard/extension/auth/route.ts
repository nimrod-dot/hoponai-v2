import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { verifyExtensionToken, extractBearerToken } from '@/lib/extension-token';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const supabase = createServerClient();

  // ── Auth method 1: Bearer token (reliable from Chrome extensions) ──
  const bearerToken = extractBearerToken(req.headers.get('Authorization'));
  if (bearerToken) {
    const verified = verifyExtensionToken(bearerToken);
    if (!verified) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { data: user } = await supabase
      .from('users')
      .select('id, full_name, email, role, org_id, organizations(id, name, plan)')
      .eq('id', verified.userId)
      .single();

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const canRecord = ['owner', 'admin', 'trainer'].includes(user.role);
    return NextResponse.json({
      user: { id: user.id, name: user.full_name, email: user.email, role: user.role, canRecord },
      organization: user.organizations,
    });
  }

  // ── Auth method 2: Clerk session cookie (web app logged-in users) ──
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: user } = await supabase
    .from('users')
    .select('id, full_name, email, role, org_id, organizations(id, name, plan)')
    .eq('clerk_user_id', userId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const canRecord = ['owner', 'admin', 'trainer'].includes(user.role);
  return NextResponse.json({
    user: { id: user.id, name: user.full_name, email: user.email, role: user.role, canRecord },
    organization: user.organizations,
  });
}
