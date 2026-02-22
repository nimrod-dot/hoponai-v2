import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { generateExtensionToken } from '@/lib/extension-token';
import { NextResponse } from 'next/server';

// Clerk-protected: user must be logged into the web app to call this.
// Returns a 30-day HMAC-signed token the extension can use as a Bearer token.
export async function POST() {
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
    return NextResponse.json({ error: 'Role cannot record' }, { status: 403 });
  }

  const token = generateExtensionToken(user.id, user.org_id);
  return NextResponse.json({ token });
}
