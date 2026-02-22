import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';

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

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <a href="/dashboard/walkthroughs" style={{ fontSize: 13, color: '#8B92A5', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 16 }}>
          ← Back to Walkthroughs
        </a>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1A1D26', marginBottom: 4 }}>
          {w.title || 'Untitled Walkthrough'}
        </h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, color: '#8B92A5' }}>
            {steps.length} step{steps.length !== 1 ? 's' : ''} · Created {new Date(w.created_at).toLocaleDateString()}
          </span>
          {w.category && (
            <span style={{ background: '#F0F9FF', color: '#0EA5E9', padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>
              {w.category}
            </span>
          )}
          <span style={{ background: w.status === 'processing' ? '#FEF3C7' : '#D1FAE5', color: w.status === 'processing' ? '#92400E' : '#065F46', padding: '2px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>
            {w.status}
          </span>
        </div>
        {w.description && (
          <p style={{ fontSize: 15, color: '#4A5168', marginTop: 8, lineHeight: 1.6 }}>{w.description}</p>
        )}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: step.screenshot ? '1px solid #E8ECF2' : 'none' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: '#0EA5E9', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1D26', textTransform: 'capitalize' }}>
                    {step.type || 'action'}
                    {step.element?.text && <span style={{ fontWeight: 400, color: '#4A5168' }}> — {step.element.text.slice(0, 60)}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#8B92A5', marginTop: 2 }}>
                    {step.url && new URL(step.url).pathname}
                    {step.elapsed_ms != null && <span style={{ marginLeft: 8 }}>{(step.elapsed_ms / 1000).toFixed(1)}s</span>}
                  </div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 8,
                  background: step.type === 'click' ? '#EFF6FF' : step.type === 'input' ? '#F0FDF4' : '#F9FAFB',
                  color: step.type === 'click' ? '#1D4ED8' : step.type === 'input' ? '#16A34A' : '#6B7280',
                }}>
                  {step.type}
                </span>
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
