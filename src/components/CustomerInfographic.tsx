'use client';

import { useState, useEffect } from 'react';

const steps = [
  {
    title: 'Customer signs up',
    bubble: '"Welcome to the platform! I\'m Sarah, your personal guide. Let\'s get you set up..."',
    screen: 'Welcome',
    metric: { label: 'Time to first value', before: '3 days', after: '15 min' },
  },
  {
    title: 'Guided product tour',
    bubble: '"Let me show you the dashboard. This is where you\'ll manage all your projects..."',
    screen: 'Dashboard Tour',
    metric: { label: 'Feature discovery', before: '23%', after: '89%' },
  },
  {
    title: 'First workflow complete',
    bubble: '"You just created your first project! Now let me show you how to invite your team..."',
    screen: 'First Success',
    metric: { label: 'Activation rate', before: '34%', after: '78%' },
  },
  {
    title: 'Self-sufficient user',
    bubble: '"You\'re all set! I\'m always here if you need help with anything new."',
    screen: 'Proficient',
    metric: { label: '90-day retention', before: '52%', after: '91%' },
  },
];

export default function CustomerInfographic() {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => { setActive((s) => (s + 1) % steps.length); setFading(false); }, 250);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const step = steps[active];

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <div style={{
        background: '#fff', borderRadius: 20, overflow: 'hidden',
        border: '1px solid #E8ECF2', boxShadow: '0 12px 48px rgba(0,0,0,0.07)',
      }}>
        {/* Header */}
        <div style={{
          background: '#F8FAFC', borderBottom: '1px solid #E2E8F0',
          padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🤝</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>Customer Onboarding Journey</div>
              <div style={{ fontSize: 11, color: '#64748B' }}>New customer experience with Hoponai</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {steps.map((_, i) => (
              <div key={i} style={{
                width: 32, height: 4, borderRadius: 2,
                background: i <= active ? '#0EA5E9' : '#E2E8F0',
                transition: 'background 0.4s ease',
              }} />
            ))}
          </div>
        </div>

        <div style={{
          padding: 28, opacity: fading ? 0.3 : 1,
          transition: 'opacity 0.25s ease',
        }}>
          {/* Customer journey visualization */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
            {/* Left - simulated product screen */}
            <div style={{
              flex: 1, background: '#F8FAFC', borderRadius: 12,
              border: '1px solid #E2E8F0', padding: 20, minHeight: 180,
            }}>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
                Your Product - {step.screen}
              </div>

              {active === 0 && (
                <div style={{ textAlign: 'center', paddingTop: 20 }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>👋</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1E293B' }}>Welcome!</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Let&apos;s get you started...</div>
                </div>
              )}

              {active === 1 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Projects', 'Analytics', 'Team', 'Integrations'].map((item, i) => (
                    <div key={item} style={{
                      padding: '8px 12px', borderRadius: 8, fontSize: 13,
                      background: i === 0 ? 'rgba(14,165,233,0.08)' : '#fff',
                      border: i === 0 ? '2px solid #0EA5E9' : '1px solid #E2E8F0',
                      color: i === 0 ? '#0EA5E9' : '#64748B',
                      fontWeight: i === 0 ? 600 : 400,
                      transition: 'all 0.4s ease',
                    }}>
                      {item}
                      {i === 0 && <span style={{ float: 'right', fontSize: 10 }}>← Start here</span>}
                    </div>
                  ))}
                </div>
              )}

              {active === 2 && (
                <div style={{
                  background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: 10, padding: 16, textAlign: 'center',
                }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>🎉</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#059669' }}>First Project Created!</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Q1 Marketing Campaign</div>
                </div>
              )}

              {active === 3 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Dashboard', 'Projects (3)', 'Team (5 members)', 'Reports'].map((item) => (
                    <div key={item} style={{
                      padding: '8px 12px', borderRadius: 8, fontSize: 13,
                      background: '#fff', border: '1px solid #BBF7D0',
                      color: '#166534', display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <span style={{ fontSize: 10 }}>✅</span> {item}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right - metric comparison */}
            <div style={{ width: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {step.metric.label}
              </div>
              <div style={{
                padding: '12px 16px', borderRadius: 10, marginBottom: 8,
                background: '#FEF2F2', border: '1px solid #FECACA',
              }}>
                <div style={{ fontSize: 11, color: '#991B1B', marginBottom: 2 }}>Without Hoponai</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#DC2626' }}>{step.metric.before}</div>
              </div>
              <div style={{
                padding: '12px 16px', borderRadius: 10,
                background: '#F0FDF4', border: '1px solid #BBF7D0',
              }}>
                <div style={{ fontSize: 11, color: '#166534', marginBottom: 2 }}>With Hoponai</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#16A34A' }}>{step.metric.after}</div>
              </div>
            </div>
          </div>

          {/* Sarah bubble */}
          <div style={{
            background: '#fff', borderRadius: 14, padding: '12px 16px',
            boxShadow: '0 4px 20px rgba(14,165,233,0.15)',
            border: '1px solid rgba(14,165,233,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'linear-gradient(135deg, #0EA5E9, #0369A1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: '#fff', fontWeight: 800,
              }}>S</div>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#0EA5E9' }}>Sarah</span>
            </div>
            <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5, fontStyle: 'italic' }}>{step.bubble}</div>
          </div>
        </div>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
        {steps.map((s, i) => (
          <button key={i}
            onClick={() => { setFading(true); setTimeout(() => { setActive(i); setFading(false); }, 200); }}
            style={{
              padding: '7px 14px', borderRadius: 20,
              border: '1px solid', borderColor: i === active ? '#0EA5E9' : '#E2E8F0',
              background: i === active ? 'rgba(14,165,233,0.06)' : '#fff',
              color: i === active ? '#0EA5E9' : '#94A3B8',
              fontSize: 12, fontWeight: i === active ? 600 : 400,
              cursor: 'pointer', transition: 'all 0.3s ease',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            }}
          >{s.title}</button>
        ))}
      </div>
    </div>
  );
}
