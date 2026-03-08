import { auth, clerkClient } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { generateExtensionToken } from '@/lib/extension-token';
import { NextResponse } from 'next/server';

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerClient();
  let { data: user } = await supabase
    .from('users')
    .select('id, org_id, role')
    .eq('clerk_user_id', userId)
    .single();

  // ── Auto-provision if webhook never created the record ──────────────────────
  if (!user) {
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress || '';
    const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ');

    // Create org first
    const { data: org } = await supabase
      .from('organizations')
      .insert({
        name: fullName ? `${fullName}'s Organization` : 'My Organization',
        slug: `org-${userId.slice(-8)}`,
      })
      .select()
      .single();

    // Create user record
    const { data: newUser } = await supabase
      .from('users')
      .insert({
        clerk_user_id: userId,
        org_id: org?.id,
        email,
        full_name: fullName || null,
        avatar_url: clerkUser.imageUrl || null,
        role: 'owner',
        onboarded: true,
      })
      .select('id, org_id, role')
      .single();

    user = newUser;
  }

  // ── Ensure existing auto-provisioned users are marked onboarded ─────────────
  if (user) {
    await supabase
      .from('users')
      .update({ onboarded: true })
      .eq('id', user.id)
      .is('onboarded', null);
  }

  if (!user) return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 });

  if (!['owner', 'admin', 'trainer'].includes(user.role)) {
    return NextResponse.json({ error: 'Role cannot record' }, { status: 403 });
  }

  const token = generateExtensionToken(user.id, user.org_id);
  return NextResponse.json({ token });
}
