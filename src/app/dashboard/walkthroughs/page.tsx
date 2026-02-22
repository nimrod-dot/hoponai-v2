import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';

export default async function WalkthroughsPage() {
  const { userId } = await auth();
  const supabase = createServerClient();

  const { data: user } = await supabase
    .from('users')
    .select('org_id')
    .eq('clerk_user_id', userId)
    .single();

  const { data: walkthroughs } = await supabase
    .from('walkthroughs')
    .select('*')
    .eq('org_id', user?.org_id)
    .order('created_at', { ascending: false });

  const hasWalkthroughs = walkthroughs && walkthroughs.length > 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1A1D26', marginBottom: 4 }}>
            Walkthroughs
          </h1>
          <p style={{ fontSize: 15, color: '#8B92A5' }}>
            Interactive training guides created by your team.
          </p>
        </div>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {!hasWalkthroughs ? (
        <div style={{
          background: '#fff', borderRadius: 16, border: '1px solid #E8ECF2',
          padding: '64px 40px', textAlign: 'center', maxWidth: 520, margin: '40px auto',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1A1D26', marginBottom: 8 }}>
            No walkthroughs yet
          </h2>
          <p style={{ fontSize: 15, color: '#8B92A5', lineHeight: 1.6, marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
            Install the Hoponai Chrome extension to start recording walkthroughs. Simply navigate your software while the extension captures each step.
          </p>
          <a href="/dashboard/extension" style={{
            display: 'inline-block', background: '#0EA5E9', color: '#fff',
            padding: '12px 28px', borderRadius: 8, fontWeight: 600, fontSize: 15,
            textDecoration: 'none',
          }}>
            Get the Extension
          </a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {walkthroughs.map((w: any) => {
            const stepCount = Array.isArray(w.steps) ? w.steps.length : (w.steps_count || 0);
            return (
              <a key={w.id} href={`/dashboard/walkthroughs/${w.id}`} style={{
                display: 'block', textDecoration: 'none',
                background: '#fff', borderRadius: 12, border: '1px solid #E8ECF2',
                padding: 24, transition: 'box-shadow 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#0EA5E9';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(14,165,233,0.1)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = '#E8ECF2';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1D26', marginBottom: 6 }}>
                  {w.title || 'Untitled Walkthrough'}
                </div>
                <div style={{ fontSize: 13, color: '#8B92A5', marginBottom: w.description ? 8 : 0 }}>
                  {stepCount} step{stepCount !== 1 ? 's' : ''} · {new Date(w.created_at).toLocaleDateString()}
                  {w.category && <span style={{ marginLeft: 8, background: '#F0F9FF', color: '#0EA5E9', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{w.category}</span>}
                </div>
                {w.description && (
                  <div style={{ fontSize: 13, color: '#4A5168', lineHeight: 1.5 }}>{w.description}</div>
                )}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}