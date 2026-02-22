import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ProcessButton from './ProcessButton';

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

          {/* Process button — shown when not yet processed */}
          {!isProcessed && <ProcessButton walkthroughId={id} />}
        </div>
      </div>

      {/* Steps */}
      {steps.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8ECF2', padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
          <p style={{ color: '#8B92A5' }}>No steps were recorded for this walkthrough.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {steps.map((step: any, i: number) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8ECF2', overflow: 'hidden' }}>
              {/* Step header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px 20px', borderBottom: step.screenshot ? '1px solid #E8ECF2' : 'none' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: '#0EA5E9', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, marginTop: 2,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  {/* AI instruction — shown when processed */}
                  {step.instruction ? (
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1D26', marginBottom: 4, lineHeight: 1.5 }}>
                      {step.instruction}
                    </div>
                  ) : (
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1D26', textTransform: 'capitalize', marginBottom: 2 }}>
                      {step.type || 'action'}
                      {step.element?.text && <span style={{ fontWeight: 400, color: '#4A5168' }}> — {step.element.text.slice(0, 60)}</span>}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: '#8B92A5', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {step.url && <span>{new URL(step.url).pathname}</span>}
                    {step.elapsed_ms != null && <span>{(step.elapsed_ms / 1000).toFixed(1)}s</span>}
                    <span style={{
                      fontWeight: 600, padding: '0px 6px', borderRadius: 6,
                      background: step.type === 'click' ? '#EFF6FF' : step.type === 'input' ? '#F0FDF4' : '#F9FAFB',
                      color: step.type === 'click' ? '#1D4ED8' : step.type === 'input' ? '#16A34A' : '#6B7280',
                    }}>
                      {step.type}
                    </span>
                  </div>
                </div>
              </div>

              {/* Screenshot */}
              {step.screenshot && (
                <div style={{ background: '#F8FAFC', padding: 16 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={step.screenshot}
                    alt={`Step ${i + 1}`}
                    style={{ width: '100%', borderRadius: 8, border: '1px solid #E8ECF2', display: 'block' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
