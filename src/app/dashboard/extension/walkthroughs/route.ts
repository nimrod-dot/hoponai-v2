import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { verifyExtensionToken, extractBearerToken } from '@/lib/extension-token';
import { NextRequest, NextResponse } from 'next/server';

// ── Helper: resolve DB user from Bearer token or Clerk cookie ──────────────────
async function resolveUser(req: NextRequest) {
  const supabase = createServerClient();
  const bearerToken = extractBearerToken(req.headers.get('Authorization'));

  if (bearerToken) {
    const verified = verifyExtensionToken(bearerToken);
    if (!verified) return null;
    const { data: user } = await supabase
      .from('users')
      .select('id, org_id, role')
      .eq('id', verified.userId)
      .single();
    return user ?? null;
  }

  const { userId } = await auth();
  if (!userId) return null;
  const { data: clerkUser } = await supabase
    .from('users')
    .select('id, org_id, role')
    .eq('clerk_user_id', userId)
    .single();
  return clerkUser ?? null;
}

// ── GET: list ready walkthroughs, or full detail with ?id= ────────────────────
export async function GET(req: NextRequest) {
  const supabase = createServerClient();
  const user = await resolveUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const walkthroughId = req.nextUrl.searchParams.get('id');

  if (walkthroughId) {
    // Full walkthrough including steps + platform metadata (for training widget)
    const { data: w } = await supabase
      .from('walkthroughs')
      .select('id, title, description, steps, status, metadata')
      .eq('id', walkthroughId)
      .eq('org_id', user.org_id)
      .eq('status', 'ready')
      .single();
    if (!w) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({
      walkthrough: {
        ...w,
        metadata: {
          platform_summary: (w.metadata as any)?.platform_summary ?? null,
          coaching_notes:   (w.metadata as any)?.coaching_notes   ?? null,
          platform_name:    (w.metadata as any)?.platform_name    ?? null,
          phases:           (w.metadata as any)?.phases           ?? null,
        },
      },
    });
  }

  // List only (no step bodies)
  const { data: walkthroughs } = await supabase
    .from('walkthroughs')
    .select('id, title, description, status, created_at, metadata')
    .eq('org_id', user.org_id)
    .eq('status', 'ready')
    .order('created_at', { ascending: false });

  const list = (walkthroughs ?? []).map((w) => ({
    id: w.id,
    title: w.title,
    description: w.description,
    stepCount: w.metadata?.step_count ?? 0,
  }));

  return NextResponse.json({ walkthroughs: list });
}

// ── POST: upload a new walkthrough (from extension recording) ─────────────────
export async function POST(req: NextRequest) {
  const supabase = createServerClient();
  const user = await resolveUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

  return NextResponse.json({ walkthrough });
}
