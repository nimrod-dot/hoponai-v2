import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// Extension sends recorded walkthrough data here
export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerClient();

  const { data: user } = await supabase
    .from('users')
    .select('id, org_id, role')
    .eq('clerk_user_id', userId)
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
      steps: body.steps,        // JSON array of step data from extension
      metadata: body.metadata,  // duration, screenshot count, etc.
      status: 'processing',     // Sarah AI will process this
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to save walkthrough' }, { status: 500 });
  }

  // TODO: Trigger Sarah AI processing pipeline here
  // This is where Arik's service would be called to:
  // 1. Process the DOM snapshots
  // 2. Generate training modules
  // 3. Update status to 'ready'

  return NextResponse.json({ walkthrough });
}