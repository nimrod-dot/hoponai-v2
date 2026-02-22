import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { verifyExtensionToken, extractBearerToken } from '@/lib/extension-token';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  let dbUserId: string | null = null;

  // ── Auth method 1: Bearer token ──
  const bearerToken = extractBearerToken(req.headers.get('Authorization'));
  if (bearerToken) {
    const verified = verifyExtensionToken(bearerToken);
    if (!verified) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    dbUserId = verified.userId;
  } else {
    // ── Auth method 2: Clerk session cookie ──
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: clerkUser } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', userId)
      .single();

    if (!clerkUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    dbUserId = clerkUser.id;
  }

  const { data: user } = await supabase
    .from('users')
    .select('id, org_id, role')
    .eq('id', dbUserId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (!['owner', 'admin', 'trainer'].includes(user.role)) {
    return NextResponse.json({ error: 'Not authorized to record' }, { status: 403 });
  }

  const body = await req.json();

  const { data: walkthrough, error } = await supabase
    .from('walkthroughs')
    .insert({
      org_id: user.org_id,
      created_by: user.id,
      title: body.title,
      description: body.description,
      category: body.category,
      target_url: body.target_url,
      steps: body.steps,
      metadata: body.metadata,
      status: 'processing',
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to save walkthrough' }, { status: 500 });
  }

  // TODO: Trigger Sarah AI processing pipeline here
  return NextResponse.json({ walkthrough });
}
