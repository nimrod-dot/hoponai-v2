import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const supabase = createServerClient();

  // Get user and org
  const { data: user } = await supabase
    .from('users')
    .select('id, org_id')
    .eq('clerk_user_id', userId)
    .single();

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Save onboarding responses
  await supabase.from('onboarding_responses').insert({
    org_id: user.org_id,
    user_id: user.id,
    primary_use_case: body.primary_use_case,
    systems_used: body.systems_used,
    team_size: body.team_size,
    biggest_pain: body.biggest_pain,
  });

  // Update org with team size
  await supabase
    .from('organizations')
    .update({ company_size: body.team_size })
    .eq('id', user.org_id);

  // Mark user as onboarded
  await supabase
    .from('users')
    .update({ onboarded: true })
    .eq('id', user.id);

  return NextResponse.json({ success: true });
}