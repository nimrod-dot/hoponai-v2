import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ProcessButton from './ProcessButton';
import ShareButton from './ShareButton';
import StepList from './StepList';

export default async function WalkthroughDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId } = await auth();
  const supabase = createServerClient();

  const { data: user } = await supabase
    .from('users')
    .select('org_id')
    .eq('clerk_user_id', userId)
    .single();

  const { data: w } = await supabase
    .from('walkthroughs')
    .select('*')
    .eq('id', id)
    .eq('org_id', user?.org_id)
    .single();

  if (!w) notFound();

  const steps: any[] = Array.isArray(w.steps) ? w.steps : [];
  const isProcessed = w.status === 'ready';

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <a href="/dashboard/walkthroughs" style={{ fontSize: 13, color: '#8B92A5', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
          ← Back to Walkthroughs
        </a>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1A1D26', marginBottom: 4 }}>
              {w.title || 'Untitled Walkthrough'}
            </h1>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 14, color: '#8B92A5' }}>
                {steps.length} step{steps.length !== 1 ? 's' : ''} · {new Date(w.created_at).toLocaleDateString()}
              </span>
              {w.category && (
                <span style={{ background: '#F0F9FF', color: '#0EA5E9', padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>
                  {w.category}
                </span>
              )}
              <span style={{
                background: isProcessed ? '#D1FAE5' : '#FEF3C7',
                color: isProcessed ? '#065F46' : '#92400E',
                padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600,
              }}>
                {isProcessed ? 'ready' : 'processing'}
              </span>
            </div>
            {w.description && (
              <p style={{ fontSize: 15, color: '#4A5168', marginTop: 8, lineHeight: 1.6, maxWidth: 640 }}>{w.description}</p>
            )}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            {isProcessed && <ShareButton walkthroughId={id} />}
            <ProcessButton walkthroughId={id} reprocess={isProcessed} />
          </div>
        </div>
      </div>

      {/* Steps */}
      <StepList walkthroughId={id} steps={steps} />
    </div>
  );
}
