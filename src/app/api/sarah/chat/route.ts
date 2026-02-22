import { NextRequest, NextResponse } from 'next/server';
import { verifyExtensionToken, extractBearerToken } from '@/lib/extension-token';
import { openai } from '@/lib/openai';

const SARAH_SYSTEM = `You are Sarah, a warm and concise AI onboarding guide for Hoponai — a platform that turns screen recordings into AI-powered training walkthroughs.

You live in the Hoponai Chrome extension popup. Your job is to help the user:
1. Record a GanttPRO walkthrough (navigate → start recording → demonstrate the task → stop)
2. Save it with a good title
3. Review it in the Hoponai dashboard

Rules:
- Address the user by their first name (provided in context)
- Keep every reply to 2–3 sentences maximum — be concise and friendly
- Be encouraging and specific about what to do next
- Never mention HTML tags, element types, or any technical implementation details
- Adapt your tone to the current state (recording, idle, done, etc.)
- If the user asks about something unrelated to Hoponai or GanttPRO, gently redirect them`;

function getActions(ctx: {
  isGanttPro: boolean;
  recording: boolean;
  stepCount: number;
}): { label: string; action: string }[] {
  if (ctx.recording) {
    return [{ label: 'Stop Recording', action: 'stop_recording' }];
  }
  if (ctx.stepCount > 0 && !ctx.recording) {
    return [
      { label: 'Save Walkthrough', action: 'open_save_form' },
      { label: 'Discard', action: 'discard' },
    ];
  }
  if (!ctx.isGanttPro) {
    return [{ label: 'Open GanttPRO', action: 'open_ganttpro' }];
  }
  return [
    { label: 'Start Recording', action: 'start_recording' },
    { label: 'How does it work?', action: 'help' },
  ];
}

export async function POST(req: NextRequest) {
  // Auth: Bearer token only (extension doesn't send Clerk cookies reliably)
  const bearerToken = extractBearerToken(req.headers.get('Authorization'));
  if (!bearerToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const verified = verifyExtensionToken(bearerToken);
  if (!verified) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const body = await req.json();
  const { messages = [], context = {} } = body;

  const {
    userName = 'there',
    orgName = '',
    isGanttPro = false,
    recording = false,
    stepCount = 0,
  } = context;

  const contextMsg = [
    `User's first name: ${userName}`,
    orgName && `Organization: ${orgName}`,
    `Currently on GanttPRO: ${isGanttPro}`,
    `Recording in progress: ${recording}`,
    `Steps captured so far: ${stepCount}`,
  ]
    .filter(Boolean)
    .join('\n');

  const openaiMessages = [
    { role: 'system' as const, content: SARAH_SYSTEM },
    { role: 'system' as const, content: `Current context:\n${contextMsg}` },
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: openaiMessages,
    max_tokens: 120,
    temperature: 0.5,
  });

  const reply = completion.choices[0].message.content?.trim() ?? "Hi! I'm Sarah, your Hoponai guide. How can I help?";
  const actions = getActions({ isGanttPro, recording, stepCount });

  return NextResponse.json({ reply, actions });
}
