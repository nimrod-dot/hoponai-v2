import { NextRequest, NextResponse } from 'next/server';
import type { ChatCompletionMessageParam, ChatCompletionUserMessageParam } from 'openai/resources';
import { verifyShareToken } from '@/lib/share-token';
import { verifyExtensionToken, extractBearerToken } from '@/lib/extension-token';
import { openai } from '@/lib/openai';

const SARAH_PLAY_SYSTEM = `You are Sarah, a warm and narrative AI training coach for Hoponai.
You guide users through recorded software walkthroughs as a journey — not a list of clicks.
You understand the platform, the workflow arc, and why each step matters in the bigger picture.

Core rules:
- Describe elements by what you SEE (button label, color, location) — never mention HTML, XPath, IDs, class names
- STRICT LIMIT: 1-2 short sentences only. Never write more than 2 sentences. Cut ruthlessly.
- Use a warm coaching tone, never robotic or tooltip-like
- Never say "step N" by number — narrate actions naturally
- Always explain WHY a step matters in the context of the current workflow phase, not just WHAT to click
- When a step is marked [flexible], mention it naturally: "we used X in the demo but any value works here"
- For input steps: accept any value in the correct field — never tell a user they're wrong for using their own names/values
- Draw on coaching notes and phase context to explain UI concepts and workflow purpose

JOURNEY AWARENESS (most important rule):
- The context includes "Workflow journey" — completed phases, current phase name, and upcoming phases
- ALWAYS narrate within the current phase's context. If we're in "Add tasks", you're helping add tasks to the project that was already created — never say "create a project" for a task
- Reference what was accomplished: "Now that the project is set up, we're adding tasks to it"
- At phase transitions, celebrate the milestone and preview what's next: "The tasks are all in — now let's bring them to life with budget tracking"
- Make the user feel progress: they're building something, not clicking buttons

OBSERVE MODE (mode = observe):
- Check if the user completed ONE specific step — the CURRENT step only
- For [flexible] steps: complete if the user performed the ACTION regardless of the specific value
- Look for EVIDENCE: dialog opened, panel appeared, item selected/highlighted, navigation happened, text entered in expected field
- If CLEAR EVIDENCE the current step was completed → set detectedStep = currentStepIndex + 1
- If NOT clearly completed → set detectedStep = currentStepIndex (no change)
- Respond ONLY with JSON: {"detectedStep": <0-indexed number>, "reply": "<message or empty string>"}
- reply = "" when NOT complete — stay silent
- reply = ONE sentence when complete: brief acknowledgement + EXACT next action. Example: "Got it — now click the Save button to lock in your changes." NEVER just say "Great job!" alone.

GREET MODE (mode = greet):
- Welcome warmly, mention the platform name, and give a 1-sentence overview of the journey ahead (use workflow phases if available)
- Then narrate step [0] — what to do first
- If step [0] is marked [flexible], note the user can use their own values
- Do NOT assume any steps are already done. Respond with plain text (no JSON).
- If a "Page mismatch" note is present: acknowledge where the user actually is, help complete prerequisites first, then explain how to get to the starting point

CHAT MODE (mode = chat):
- When the user message starts with [STEP — it is a step-narration request. Tell the user WHAT to do in one action-first sentence. Start with "Now", "Next", or "Go ahead and". Include why in the SAME sentence. NEVER start with "Great", "Well done", "Awesome", or any praise — go straight to the action.
- For free-form questions: respond conversationally, keep them on track, reference the current phase context
- If they ask what value to type, check if [flexible] — any reasonable value works`;


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
    allSteps = null,
    mode = 'chat',
    // Legacy compat fields (PlayerClient.tsx sends these, no changes needed there):
    stepInstruction = '',
    isGreeting = false,
    // Platform context — populated from walkthrough metadata after processing
    platformSummary = null,
    coachingNotes = null,
    // Workflow phases — generated during AI processing
    phases = null,
    // Page context — sent in greet mode to detect wrong starting page
    currentUrl = null,
  } = context;

  // Map legacy fields to new model
  const resolvedMode: 'greet' | 'observe' | 'chat' = isGreeting ? 'greet' : mode;
  const resolvedSteps: {
    instruction: string; url: string;
    elementText?: string; elementTag?: string; elementAria?: string;
    isFlexible?: boolean; flexibilityNote?: string | null; stepCategory?: string | null;
  }[] = allSteps ?? (stepInstruction ? [{ instruction: stepInstruction, url: '' }] : []);

  const stepsText = resolvedSteps
    .map((s, i) => {
      const path = s.url
        ? (() => { try { return new URL(s.url).pathname; } catch { return s.url; } })()
        : '';
      const elemParts: string[] = [];
      if (s.elementText) elemParts.push(`text:"${String(s.elementText).slice(0, 50)}"`);
      if (s.elementTag)  elemParts.push(`tag:<${s.elementTag}>`);
      if (s.elementAria) elemParts.push(`aria:"${String(s.elementAria).slice(0, 50)}"`);
      const elemInfo  = elemParts.length ? `  [target: ${elemParts.join(', ')}]` : '';
      const flexTag   = s.isFlexible ? '  [flexible]' : '';
      const flexNote  = s.flexibilityNote ? `  (note: ${s.flexibilityNote})` : '';
      return `  [${i}] ${s.instruction}${elemInfo}${path ? `  (${path})` : ''}${flexTag}${flexNote}`;
    })
    .join('\n');

  // Platform context block — only present when the walkthrough has been enriched
  const platformBlock = (platformSummary || coachingNotes)
    ? [
        '\nPlatform context:',
        platformSummary ? `Platform: ${platformSummary}` : '',
        coachingNotes   ? `Coaching notes:\n${coachingNotes}` : '',
      ].filter(Boolean).join('\n')
    : '';

  // Workflow journey block — gives Sarah the narrative arc
  const journeyBlock = (() => {
    if (!phases || !Array.isArray(phases) || phases.length === 0) return '';
    const typedPhases = phases as { name: string; stepStart: number; stepEnd: number; context?: string }[];
    const currentPhaseIdx = typedPhases.findIndex(p => stepIndex >= p.stepStart && stepIndex <= p.stepEnd);
    if (currentPhaseIdx === -1) return '';
    const current = typedPhases[currentPhaseIdx];
    const completed = typedPhases.slice(0, currentPhaseIdx).map(p => `"${p.name}"`).join(', ');
    const upcoming  = typedPhases.slice(currentPhaseIdx + 1).map(p => `"${p.name}"`).join(', ');
    return [
      '\nWorkflow journey:',
      completed ? `Completed phases: ${completed}` : 'This is the first phase',
      `CURRENT phase: "${current.name}" (steps ${current.stepStart}–${current.stepEnd})${current.context ? ` — ${current.context}` : ''}`,
      upcoming  ? `Upcoming phases: ${upcoming}` : 'This is the final phase',
    ].join('\n');
  })();

  const contextMsg = [
    `Walkthrough: "${walkthroughTitle}"`,
    platformBlock,
    journeyBlock,
    `Current step index (0-based): ${stepIndex} of ${totalSteps - 1}`,
    resolvedSteps.length > 0 ? `\nFull walkthrough steps:\n${stepsText}` : '',
    `\nMode: ${resolvedMode}`,
    resolvedMode === 'observe' ? `TASK: Determine if step [${stepIndex}] is completed. Look for evidence the action occurred. Return detectedStep = ${stepIndex + 1} if DONE, ${stepIndex} if NOT DONE.` : '',
    resolvedMode === 'greet'   ? 'This is the very start. Greet warmly and narrate step [0].' : '',
    resolvedMode === 'greet' && currentUrl && resolvedSteps[0]?.url
      ? (() => {
          try {
            const expected = new URL(resolvedSteps[0].url).pathname;
            const current  = new URL(currentUrl as string).pathname;
            if (expected !== current)
              return `Page mismatch: User is on "${current}", but step [0] starts at "${expected}". Help the user navigate to the correct starting page, or complete any required prerequisites (login, account creation, etc.) first. Look at the screenshot to understand the current page.`;
          } catch { /* ignore malformed URLs */ }
          return '';
        })()
      : '',
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

  // Attach screenshot in observe mode (step verification) and greet mode (page awareness)
  const imgToAttach = (resolvedMode === 'observe' || resolvedMode === 'greet') ? screenshot : null;

  const openaiMessages = [
    { role: 'system' as const, content: SARAH_PLAY_SYSTEM },
    { role: 'system' as const, content: `Current context:\n${contextMsg}` },
    ...buildMessages(messages, imgToAttach),
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: openaiMessages,
    max_tokens: 160,
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
