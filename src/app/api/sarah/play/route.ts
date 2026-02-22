import { NextRequest, NextResponse } from 'next/server';
import { verifyShareToken } from '@/lib/share-token';
import { verifyExtensionToken, extractBearerToken } from '@/lib/extension-token';
import { openai } from '@/lib/openai';

const SARAH_PLAY_SYSTEM = `You are Sarah, a warm and concise AI training guide for Hoponai.
You are walking a user through a recorded software walkthrough step by step.

Rules:
- ALWAYS base your reply on the exact step instruction provided in the context — do not skip it, rephrase it loosely, or invent alternative steps
- Lead directly with what to click, type, or do and exactly where — be specific
- Add one short sentence of encouragement before or after the instruction
- Keep the entire reply to 2–3 sentences maximum
- If they ask a question, answer it briefly then bring them back to the current step
- Never mention HTML tags, XPath, element IDs, class names, or any technical code details
- If the instruction mentions a "<div>" or similar tag, describe the element by its visible text or visual purpose instead
- Never say "step X" — describe the action naturally
- Use a warm coaching tone`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { shareToken, messages = [], context = {} } = body;

  // Auth: accept either a share token (web player) or extension Bearer token (in-page widget)
  const shareVerified = shareToken ? verifyShareToken(shareToken) : null;
  const bearerToken = extractBearerToken(req.headers.get('Authorization'));
  const bearerVerified = bearerToken ? verifyExtensionToken(bearerToken) : null;

  if (!shareVerified && !bearerVerified) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const {
    walkthroughTitle = 'this walkthrough',
    stepIndex = 0,
    totalSteps = 1,
    stepInstruction = '',
  } = context;

  const isFinalStep = stepIndex + 1 >= totalSteps;

  const contextMsg = [
    `Walkthrough title: "${walkthroughTitle}"`,
    `Current step: ${stepIndex + 1} of ${totalSteps}`,
    stepInstruction && `What the user needs to do right now: "${stepInstruction}"`,
    isFinalStep && `This is the FINAL step — congratulate them when they complete it.`,
  ]
    .filter(Boolean)
    .join('\n');

  const openaiMessages = [
    { role: 'system' as const, content: SARAH_PLAY_SYSTEM },
    { role: 'system' as const, content: `Current context:\n${contextMsg}` },
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: openaiMessages,
    max_tokens: 180,
    temperature: 0.5,
  });

  const reply =
    completion.choices[0].message.content?.trim() ??
    "Let's keep going — click 'Got it' when you're ready for the next step!";

  return NextResponse.json({ reply });
}
