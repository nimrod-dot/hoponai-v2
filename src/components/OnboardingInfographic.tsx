'use client';

import { useState, useEffect } from 'react';

const timeline = [
  {
    time: '9:00 AM',
    title: 'HR System Setup',
    app: 'Workday',
    bubble: '"Welcome to the team! Let\'s get your HR profile set up. Click Personal Information..."',
    fields: ['Name', 'Emergency Contact', 'Tax Forms'],
    progress: 25,
  },
  {
    time: '9:30 AM',
    title: 'Email & Calendar',
    app: 'Google Workspace',
    bubble: '"Now let\'s configure your email signature and sync your team calendar..."',
    fields: ['Signature', 'Calendar Sync', 'Distribution Lists'],
    progress: 50,
  },
  {
    time: '10:15 AM',
    title: 'Project Tools',
    app: 'Jira',
    bubble: '"Here\'s how your team tracks work. Let me show you how to create your first ticket..."',
    fields: ['Board View', 'Create Ticket', 'Assign Sprint'],
    progress: 75,
  },
  {
    time: '11:00 AM',
    title: 'Ready to Work',
    app: 'Complete',
    bubble: '"You\'re all set! You just completed in 2 hours what usually takes 2 weeks."',
    fields: ['All Systems ✓', 'Permissions ✓', 'Team Intro ✓'],
    progress: 100,
  },
];

export default function OnboardingInfographic() {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActive((s) => (s + 1) % timeline.length);
        setFading(false);
      }, 250);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const step = timeline[active];

  return (
    <div style={{ maxWidth: 840, margin: '0 auto' }}>
      <div style={{
        background: '#fff', borderRadius: 20, overflow: 'hidden',
        border: '1px solid #E8ECF2', boxShadow: '0 12px 48px rgba(0,0,0,0.07)',
      }}>
        {/* Header bar */}
        <div style={{
          background: '#F8FAFC', borderBottom: '1px solid #E2E8F0',
          padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #DBEAFE, #BFDBFE)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
              👤
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>Alex Chen - Day 1</div>
              <div style={{ fontSize: 11, color: '#64748B' }}>New Hire Onboarding</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: 11, color: '#64748B' }}>Onboarding Progress</div>
            <div style={{ width: 120, height: 6, borderRadius: 3, background: '#E2E8F0', overflow: 'hidden' }}>
              <div style={{
                width: `${step.progress}%`, height: '100%', borderRadius: 3,
                background: step.progress === 100 ? '#10B981' : '#0EA5E9',
                transition: 'width 0.6s ease, background 0.6s ease',
              }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: step.progress === 100 ? '#10B981' : '#0EA5E9' }}>
              {step.progress}%
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', minHeight: 320 }}>
          {/* Timeline sidebar */}
          <div style={{ width: 180, borderRight: '1px solid #E2E8F0', padding: '20px 0' }}>
            {timeline.map((t, i) => (
              <div
                key={i}
                onClick={() => { setFading(true); setTimeout(() => { setActive(i); setFading(false); }, 200); }}
                style={{
                  padding: '12px 16px', cursor: 'pointer',
                  borderLeft: i === active ? '3px solid #0EA5E9' : '3px solid transparent',
                  background: i === active ? 'rgba(14,165,233,0.04)' : 'transparent',
                  transition: 'all 0.3s ease',
                }}
              >
                <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 2 }}>{t.time}</div>
                <div style={{
                  fontSize: 13, fontWeight: i === active ? 700 : 500,
                  color: i === active ? '#0EA5E9' : i < active ? '#10B981' : '#64748B',
                }}>
                  {i < active ? '✓ ' : ''}{t.title}
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>{t.app}</div>
              </div>
            ))}
          </div>

          {/* Content area */}
          <div style={{
            flex: 1, padding: 24, position: 'relative',
            opacity: fading ? 0.3 : 1, transition: 'opacity 0.25s ease',
          }}>
            {/* App simulation */}
            <div style={{
              background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0',
              padding: 20, marginBottom: 16, minHeight: 140,
            }}>
              <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {step.app}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {step.fields.map((field, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px', borderRadius: 8, background: '#fff',
                    border: i === 0 && step.progress < 100 ? '2px solid #0EA5E9' : '1px solid #E2E8F0',
                    boxShadow: i === 0 && step.progress < 100 ? '0 0 0 3px rgba(14,165,233,0.1)' : 'none',
                    transition: 'all 0.4s ease',
                  }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 4,
                      background: step.progress === 100 || i < 2 ? '#10B981' : '#E2E8F0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: '#fff', transition: 'all 0.4s ease',
                    }}>
                      {(step.progress === 100 || i < 2) ? '✓' : ''}
                    </div>
                    <span style={{ fontSize: 13, color: '#334155' }}>{field}</span>
                  </div>
                ))}
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
              <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5, fontStyle: 'italic' }}>
                {step.bubble}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison callout */}
      <div style={{
        display: 'flex', gap: 16, marginTop: 20, justifyContent: 'center',
      }}>
        <div style={{
          padding: '10px 20px', borderRadius: 12, background: '#FEE2E2',
          border: '1px solid #FECACA', fontSize: 13, color: '#991B1B',
        }}>
          <span style={{ fontWeight: 700 }}>Without Hoponai:</span> 2-3 weeks to full productivity
        </div>
        <div style={{
          padding: '10px 20px', borderRadius: 12, background: '#DCFCE7',
          border: '1px solid #BBF7D0', fontSize: 13, color: '#166534',
        }}>
          <span style={{ fontWeight: 700 }}>With Hoponai:</span> Productive from day one
        </div>
      </div>
    </div>
  );
}
