import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { openai } from '@/lib/openai';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;

async function generateInstruction(step: any): Promise<string> {
  const contextLines = [
    `Action type: ${step.type}`,
    step.element?.tag  && `Element: <${step.element.tag}>`,
    step.element?.text && `Text: "${step.element.text.slice(0, 120)}"`,
    step.element?.aria_label && `ARIA label: "${step.element.aria_label}"`,
    step.value         && `Value entered: "${step.value}"`,
    step.url           && `Page URL: ${step.url}`,
  ].filter(Boolean).join('\n');

  const content: any[] = [
    {
      type: 'text',
      text: `You are writing step-by-step instructions for a software training guide.\n\nContext:\n${contextLines}\n\nWrite ONE clear, concise instruction sentence for this step. Start with an action verb (Click, Type, Select, Navigate, etc.). Be specific about what element to interact with. Return only the sentence, no numbering or punctuation at the end.`,
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
    max_tokens: 120,
    temperature: 0.3,
  });

  return response.choices[0].message.content?.trim() ?? '';
}

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

  // Process all steps in parallel
  const processedSteps = await Promise.all(
    steps.map(async (step) => {
      try {
        const instruction = await generateInstruction(step);
        return { ...step, instruction };
      } catch (err) {
        console.error(`Step ${step.index} failed:`, err);
        return { ...step, instruction: '' };
      }
    }),
  );

  // Generate an overall summary from the instructions
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

  await supabase
    .from('walkthroughs')
    .update({ steps: processedSteps, status: 'ready', description: summary })
    .eq('id', id);

  return NextResponse.json({ ok: true, stepsProcessed: processedSteps.length });
}
