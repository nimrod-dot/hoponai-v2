import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { openai } from '@/lib/openai';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 120;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseJsonSafe(raw: string): any {
  const match = raw.match(/\{[\s\S]*\}/);
  return JSON.parse(match?.[0] ?? raw);
}

// ─── Per-step: classify + write a flexibility-aware instruction ───────────────

async function classifyAndDescribeStep(step: any): Promise<{
  instruction: string;
  isFlexible: boolean;
  flexibilityNote: string | null;
  stepCategory: string;
}> {
  const contextLines = [
    `Action type: ${step.type}`,
    step.element?.tag        && `Element: <${step.element.tag}>`,
    step.element?.text       && `Text: "${step.element.text.slice(0, 120)}"`,
    step.element?.aria_label && `ARIA label: "${step.element.aria_label}"`,
    step.value               && `Value entered: "${step.value}"`,
    step.url                 && `Page URL: ${step.url}`,
  ].filter(Boolean).join('\n');

  const content: any[] = [
    {
      type: 'text',
      text: `You are writing step-by-step instructions for a software training guide.
You must also classify whether this step involves the user's own freely-chosen data.

Context:
${contextLines}

Answer ONLY with valid JSON (no markdown fences):
{
  "instruction": "<One imperative sentence starting with a verb. For input steps where the value is user data (a name, title, description, date the user picks), write GENERIC instructions like 'Enter your project name' — NOT 'Type Test2 into...'. For clicks and navigation, be specific about what UI element to click.>",
  "isFlexible": <true if this is an input/change step where the recorded value is the user's own free-form choice — project name, task title, description, note text. false for clicks, navigation, required-format fields, dropdown selections.>,
  "flexibilityNote": "<If isFlexible=true: short note Sarah says proactively, e.g. 'We used Test2 in the demo but any project name works here.' If false: null.>",
  "stepCategory": "<navigate | click-action | input-flexible | input-required>"
}`,
    },
  ];

  if (step.screenshot) {
    content.push({
      type: 'image_url',
      image_url: { url: step.screenshot, detail: 'low' },
    });
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content }],
    max_tokens: 200,
    temperature: 0.2,
  });

  const raw = response.choices[0].message.content?.trim() ?? '';
  const parsed = parseJsonSafe(raw);

  return {
    instruction:     String(parsed.instruction    ?? ''),
    isFlexible:      parsed.isFlexible === true,
    flexibilityNote: parsed.flexibilityNote ? String(parsed.flexibilityNote) : null,
    stepCategory:    String(parsed.stepCategory   ?? (step.type === 'input' ? 'input-flexible' : 'click-action')),
  };
}

// ─── Holistic: platform + coaching context from all steps together ────────────

async function analyzeWalkthrough(
  title: string,
  targetUrl: string,
  steps: any[],
): Promise<{
  platform_name: string | null;
  platform_summary: string | null;
  coaching_notes: string | null;
  step_corrections: { index: number; isFlexible: boolean; flexibilityNote: string | null }[];
}> {
  const stepLines = steps
    .map((s, i) => `[${i}] type:${s.type} cat:${s.stepCategory} instruction:"${s.instruction}"`)
    .join('\n');

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `You are a software training analyst.

Walkthrough title: "${title}"
Target URL: ${targetUrl || 'unknown'}

Steps:
${stepLines}

Return ONLY valid JSON (no markdown):
{
  "platform_name": "<e.g. GanttPro>",
  "platform_summary": "<1-2 sentences: what is this platform and what does this walkthrough teach?>",
  "coaching_notes": "<2-5 coaching tips for Sarah about this platform's UI, each on its own line. E.g. 'In GanttPro, colored horizontal bars in the timeline represent tasks — their length shows duration.'>",
  "step_corrections": [
    { "index": <0-based step index>, "isFlexible": <bool>, "flexibilityNote": <string or null> }
  ]
}
If no corrections needed, return step_corrections: [].`,
      },
    ],
    max_tokens: 600,
    temperature: 0.3,
  });

  const raw = response.choices[0].message.content?.trim() ?? '';
  const parsed = parseJsonSafe(raw);

  return {
    platform_name:    parsed.platform_name    ? String(parsed.platform_name)    : null,
    platform_summary: parsed.platform_summary ? String(parsed.platform_summary) : null,
    coaching_notes:   parsed.coaching_notes   ? String(parsed.coaching_notes)   : null,
    step_corrections: Array.isArray(parsed.step_corrections) ? parsed.step_corrections : [],
  };
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerClient();

  const { data: user } = await supabase
    .from('users')
    .select('id, org_id')
    .eq('clerk_user_id', userId)
    .single();

  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { data: walkthrough } = await supabase
    .from('walkthroughs')
    .select('*')
    .eq('id', id)
    .eq('org_id', user.org_id)
    .single();

  if (!walkthrough) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const steps: any[] = Array.isArray(walkthrough.steps) ? walkthrough.steps : [];

  // ── Step 1: Classify + describe each step in parallel ───────────────────────
  const processedSteps = await Promise.all(
    steps.map(async (step) => {
      try {
        const { instruction, isFlexible, flexibilityNote, stepCategory } =
          await classifyAndDescribeStep(step);
        return { ...step, instruction, isFlexible, flexibilityNote, stepCategory };
      } catch (err) {
        console.error(`Step ${step.index} failed:`, err);
        return {
          ...step,
          instruction: '',
          isFlexible: step.type === 'input' || step.type === 'change',
          flexibilityNote: null,
          stepCategory: step.type === 'input' ? 'input-flexible' : 'click-action',
        };
      }
    }),
  );

  // ── Step 2: Generate overall summary ────────────────────────────────────────
  const instructionList = processedSteps
    .map((s, i) => `${i + 1}. ${s.instruction}`)
    .filter((s) => s.trim().length > 3)
    .join('\n');

  let summary = walkthrough.description || '';
  try {
    const summaryRes = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'user',
        content: `These are the steps from a software walkthrough titled "${walkthrough.title}":\n\n${instructionList}\n\nWrite a 1-2 sentence summary of what this walkthrough covers. Be concise and use plain language.`,
      }],
      max_tokens: 150,
      temperature: 0.3,
    });
    summary = summaryRes.choices[0].message.content?.trim() ?? summary;
  } catch (err) {
    console.error('Summary generation failed:', err);
  }

  // ── Step 3: Holistic walkthrough analysis (platform + corrections) ───────────
  let enrichedSteps = [...processedSteps];
  let updatedMetadata: Record<string, any> = {
    ...(walkthrough.metadata || {}),
    step_count: enrichedSteps.length,
  };

  try {
    const targetUrl = walkthrough.target_url || processedSteps[0]?.url || '';
    const analysis = await analyzeWalkthrough(walkthrough.title, targetUrl, processedSteps);

    // Apply any corrections from the holistic pass
    for (const c of analysis.step_corrections) {
      if (c.index >= 0 && c.index < enrichedSteps.length) {
        enrichedSteps[c.index] = {
          ...enrichedSteps[c.index],
          isFlexible: c.isFlexible,
          flexibilityNote: c.flexibilityNote ?? null,
        };
      }
    }

    updatedMetadata = {
      ...updatedMetadata,
      platform_name:    analysis.platform_name,
      platform_summary: analysis.platform_summary,
      coaching_notes:   analysis.coaching_notes,
    };
  } catch (err) {
    console.error('Holistic walkthrough analysis failed:', err);
    // Safe fallback: enrichedSteps already have per-step classification; just no platform context
  }

  // ── Step 4: Save everything ──────────────────────────────────────────────────
  await supabase
    .from('walkthroughs')
    .update({
      steps: enrichedSteps,
      status: 'ready',
      description: summary,
      metadata: updatedMetadata,
    })
    .eq('id', id);

  return NextResponse.json({ ok: true, stepsProcessed: enrichedSteps.length });
}
