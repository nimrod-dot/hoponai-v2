import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { generateShareToken } from '@/lib/share-token';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerClient();

  const { data: user } = await supabase
    .from('users')
    .select('org_id')
    .eq('clerk_user_id', userId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { data: walkthrough } = await supabase
    .from('walkthroughs')
    .select('id, status')
    .eq('id', id)
    .eq('org_id', user.org_id)
    .single();

  if (!walkthrough) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (walkthrough.status !== 'ready')
    return NextResponse.json({ error: 'Walkthrough not yet processed' }, { status: 400 });

  const token = generateShareToken(id, user.org_id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hoponai.com';
  const shareUrl = `${appUrl}/play/${token}`;

  return NextResponse.json({ shareUrl });
}
