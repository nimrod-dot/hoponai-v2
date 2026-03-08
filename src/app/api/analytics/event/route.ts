import { verifyExtensionToken, extractBearerToken } from '@/lib/extension-token';
import { createServerClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

const VALID_TYPES = new Set([
  'session_start',
  'step_advance',
  'hint_shown',
  'question_asked',
  'session_complete',
]);

export async function POST(req: NextRequest) {
  const token = extractBearerToken(req.headers.get('Authorization'));
  const verified = token ? verifyExtensionToken(token) : null;
  if (!verified) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { walkthroughId, eventType, stepIndex = null } = body;

  if (!walkthroughId || !VALID_TYPES.has(eventType)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const supabase = createServerClient();
  await supabase.from('training_events').insert({
    org_id:         verified.orgId,
    walkthrough_id: walkthroughId,
    event_type:     eventType,
    step_index:     stepIndex,
  });

  return NextResponse.json({ ok: true });
}
