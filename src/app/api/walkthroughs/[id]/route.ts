import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerClient();
  const { data: user } = await supabase
    .from('users')
    .select('id, org_id')
    .eq('clerk_user_id', userId)
    .single();
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const body = await req.json();
  if (!Array.isArray(body.steps)) {
    return NextResponse.json({ error: 'steps array required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('walkthroughs')
    .update({ steps: body.steps })
    .eq('id', id)
    .eq('org_id', user.org_id);

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
