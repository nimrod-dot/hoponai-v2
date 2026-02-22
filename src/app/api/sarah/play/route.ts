import { NextRequest, NextResponse } from 'next/server';
import type { ChatCompletionMessageParam, ChatCompletionUserMessageParam } from 'openai/resources';
import { verifyShareToken } from '@/lib/share-token';
import { verifyExtensionToken, extractBearerToken } from '@/lib/extension-token';
import { openai } from '@/lib/openai';

const SARAH_PLAY_SYSTEM = `You are Sarah, a warm and concise AI training guide for Hoponai.
You are walking a user through a recorded software walkthrough step by step.
You can see a screenshot of what the user currently sees on their screen.

Rules:
- LOOK at the screenshot first — understand where the user actually is right now
- If the current page/view does not match what is needed for the step, tell the user to navigate there first before anything else
- ALWAYS base your instruction on the exact step instruction provided in the context
- Describe elements using what you can SEE on screen (button label, color, location) — never use HTML tags, XPath, IDs, or class names
- If the instruction mentions a "<div>" or similar tag, describe the element by its visible label or position instead
- Lead with the specific action and location, add one short encouraging sentence
- Keep the entire reply to 2–3 sentences maximum
- If they ask a question, answer briefly then redirect to the current step
- Never say "step X" — describe the action naturally
- Use a warm coaching tone

VERIFICATION MODE (when context says "Verify step completion"):
- Examine the screenshot carefully to determine if the required action was actually done
- Common verification signals: text entered in a field, modal/dialog opened, page navigation occurred, checkbox/toggle changed, item selected
- If clearly done → verified:true, briefly confirm and narrate the next step
- If NOT clearly done or uncertain → verified:false, kindly but firmly tell them what is still missing
- Respond ONLY with valid JSON (no markdown fences): {"verified": true/false, "reply": "1-2 sentence message"}`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { shareToken, messages = [], context = {}, screenshot = null } = body;

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
    nextInstruction = '',  // next step's instruction, present only during verification
    verifyCompletion = false,
  } = context;

  const isFinalStep = stepIndex + 1 >= totalSteps;

  let contextMsg: string;
  if (verifyCompletion) {
    contextMsg = [
      `Verify step completion — Walkthrough: "${walkthroughTitle}"`,
      `Step ${stepIndex + 1} of ${totalSteps}: "${stepInstruction}"`,
      nextInstruction && `Next step (narrate only if current is verified): "${nextInstruction}"`,
      `Respond ONLY with valid JSON: {"verified": true/false, "reply": "1-2 sentence message"}`,
    ].filter(Boolean).join('\n');
  } else {
    contextMsg = [
      `Walkthrough title: "${walkthroughTitle}"`,
      `Current step: ${stepIndex + 1} of ${totalSteps}`,
      stepInstruction && `What the user needs to do right now: "${stepInstruction}"`,
      isFinalStep && `This is the FINAL step — congratulate them when they complete it.`,
    ].filter(Boolean).join('\n');
  }

  // Build chat messages — attach the screenshot to the last user message so
  // Sarah can see exactly what's on screen when she replies.
  const buildMessages = (
    msgs: { role: string; content: string }[],
    img: string | null,
  ): ChatCompletionMessageParam[] => {
    const textMsgs: ChatCompletionMessageParam[] = msgs.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
    if (!img || msgs.length === 0) return textMsgs;

    const last = msgs[msgs.length - 1];
    const visionMsg: ChatCompletionUserMessageParam = {
      role: 'user',
      content: [
        { type: 'text', text: last.content },
        { type: 'image_url', image_url: { url: img, detail: 'low' } },
      ],
    };
    return [...textMsgs.slice(0, -1), visionMsg];
  };

  const openaiMessages = [
    { role: 'system' as const, content: SARAH_PLAY_SYSTEM },
    { role: 'system' as const, content: `Current context:\n${contextMsg}` },
    ...buildMessages(messages, screenshot),
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: openaiMessages,
    max_tokens: 200,
    temperature: 0.5,
  });

  const rawReply = completion.choices[0].message.content?.trim() ?? '';

  if (verifyCompletion) {
    try {
      // GPT sometimes wraps JSON in markdown fences — strip them
      const jsonMatch = rawReply.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch?.[0] ?? rawReply);
      const reply = String(parsed.reply || rawReply);
      const stepVerified = parsed.verified !== false; // default true on ambiguity
      return NextResponse.json({ reply, stepVerified });
    } catch {
      // JSON parse failed — let the user proceed so they're never stuck
      return NextResponse.json({ reply: rawReply, stepVerified: true });
    }
  }

  const reply = rawReply || "Let's keep going — click 'Got it' when you're ready for the next step!";
  return NextResponse.json({ reply, stepVerified: true });
}
