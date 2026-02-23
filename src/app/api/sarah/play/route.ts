import { NextRequest, NextResponse } from 'next/server';
import type { ChatCompletionMessageParam, ChatCompletionUserMessageParam } from 'openai/resources';
import { verifyShareToken } from '@/lib/share-token';
import { verifyExtensionToken, extractBearerToken } from '@/lib/extension-token';
import { openai } from '@/lib/openai';

const SARAH_PLAY_SYSTEM = `You are Sarah, a warm and concise AI training coach for Hoponai.
You guide users through recorded software walkthroughs step by step.
You watch the user's screen by looking at screenshots and tell them where they are in their journey.

Rules:
- Describe elements by what you SEE (button label, color, location) — never mention HTML, XPath, IDs, class names
- Keep every reply to 2 sentences maximum — direct and encouraging
- Use a warm coaching tone, never robotic
- If the user asks a question, answer briefly and redirect them to their current step
- Never say "step N" by number — describe actions naturally

OBSERVE MODE (mode = observe):
- You are checking if the user completed ONE specific step — the CURRENT step only
- The current step index, its instruction, and the target element (text, tag, aria) are provided
- DO NOT scan all steps — focus ONLY on whether the current step's action produced a visible result
- Look for EVIDENCE the action occurred: a dialog opened, panel appeared, item got selected/highlighted, navigation happened, button state changed
- If you see CLEAR EVIDENCE the current step was completed → set detectedStep = currentStepIndex + 1
- If NOT clearly completed → set detectedStep = currentStepIndex (no change)
- Respond ONLY with JSON: {"detectedStep": <0-indexed number>, "reply": "<message or empty string>"}
- Set reply to "" when step is NOT complete yet — stay completely silent, never say "I don't see that"
- Set reply to a brief warm confirmation ONLY when advancement detected ("The task detail panel is open! Now...")

GREET MODE (mode = greet):
- Welcome warmly and narrate step [0] — what the user needs to do first
- Do NOT assume any steps are already done. Respond with plain text (no JSON).

CHAT MODE (mode = chat):
- The user typed a message. Respond conversationally and keep them on track. Plain text.`;

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
    allSteps = null,         // [{instruction: string, url: string}] — new field
    mode = 'chat',           // 'greet' | 'observe' | 'chat' — new field
    // Legacy compat fields (PlayerClient.tsx sends these, no changes needed there):
    stepInstruction = '',
    isGreeting = false,
  } = context;

  // Map legacy fields to new model
  const resolvedMode: 'greet' | 'observe' | 'chat' = isGreeting ? 'greet' : mode;
  const resolvedSteps: { instruction: string; url: string; elementText?: string; elementTag?: string; elementAria?: string }[] =
    allSteps ?? (stepInstruction ? [{ instruction: stepInstruction, url: '' }] : []);

  const stepsText = resolvedSteps
    .map((s, i) => {
      const path = s.url
        ? (() => { try { return new URL(s.url).pathname; } catch { return s.url; } })()
        : '';
      const elemParts: string[] = [];
      if (s.elementText) elemParts.push(`text:"${String(s.elementText).slice(0, 50)}"`);
      if (s.elementTag)  elemParts.push(`tag:<${s.elementTag}>`);
      if (s.elementAria) elemParts.push(`aria:"${String(s.elementAria).slice(0, 50)}"`);
      const elemInfo = elemParts.length ? `  [target: ${elemParts.join(', ')}]` : '';
      return `  [${i}] ${s.instruction}${elemInfo}${path ? `  (${path})` : ''}`;
    })
    .join('\n');

  const contextMsg = [
    `Walkthrough: "${walkthroughTitle}"`,
    `Current step index (0-based): ${stepIndex} of ${totalSteps - 1}`,
    resolvedSteps.length > 0 ? `\nFull walkthrough steps:\n${stepsText}` : '',
    `\nMode: ${resolvedMode}`,
    resolvedMode === 'observe' ? `TASK: Determine if step [${stepIndex}] is completed. Look for evidence the action occurred. Return detectedStep = ${stepIndex + 1} if DONE, ${stepIndex} if NOT DONE.` : '',
    resolvedMode === 'greet'   ? 'This is the very start. Greet warmly and narrate step [0].' : '',
    resolvedMode === 'chat'    ? `User is working on step [${stepIndex}]. Respond conversationally.` : '',
    stepIndex + 1 >= totalSteps ? 'This is the FINAL step — congratulate when done.' : '',
  ].filter(Boolean).join('\n');

  // Build chat messages — attach screenshot to the last user message (only for observe mode)
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

  // Only attach screenshot in observe mode
  const imgToAttach = resolvedMode === 'observe' ? screenshot : null;

  const openaiMessages = [
    { role: 'system' as const, content: SARAH_PLAY_SYSTEM },
    { role: 'system' as const, content: `Current context:\n${contextMsg}` },
    ...buildMessages(messages, imgToAttach),
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: openaiMessages,
    max_tokens: 200,
    temperature: 0.4,
  });

  const rawReply = completion.choices[0].message.content?.trim() ?? '';

  if (resolvedMode === 'observe') {
    try {
      // GPT sometimes wraps JSON in markdown fences — strip them
      const jsonMatch = rawReply.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch?.[0] ?? rawReply);
      // Clamp: Sarah can never go backward, can never go past last step
      const detectedStep = typeof parsed.detectedStep === 'number'
        ? Math.max(stepIndex, Math.min(parsed.detectedStep, totalSteps - 1))
        : stepIndex;
      const reply = String(parsed.reply ?? '');
      return NextResponse.json({ reply, detectedStep });
    } catch {
      // JSON parse failed — safe default: no advancement, no message
      return NextResponse.json({ reply: '', detectedStep: stepIndex });
    }
  }

  // greet and chat modes: plain text, detectedStep = stepIndex (no position change)
  const reply = rawReply || "Let's keep going — you've got this!";
  return NextResponse.json({ reply, detectedStep: stepIndex });
}
