import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';
import { verifyShareToken } from '@/lib/share-token';
import PlayerClient from './PlayerClient';

export default async function PlayPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const verified = verifyShareToken(token);
  if (!verified) notFound();

  const supabase = createServerClient();

  const { data: walkthrough } = await supabase
    .from('walkthroughs')
    .select('id, title, description, steps, status')
    .eq('id', verified.walkthroughId)
    .eq('org_id', verified.orgId)
    .single();

  if (!walkthrough || walkthrough.status !== 'ready') notFound();

  const steps: {
    instruction?: string;
    screenshot?: string;
    type?: string;
    url?: string;
    element?: { text?: string };
  }[] = Array.isArray(walkthrough.steps) ? walkthrough.steps : [];

  return (
    <PlayerClient
      shareToken={token}
      title={walkthrough.title || 'Untitled Walkthrough'}
      description={walkthrough.description || ''}
      steps={steps}
    />
  );
}
