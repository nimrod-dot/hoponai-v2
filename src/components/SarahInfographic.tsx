'use client';

import { useState, useEffect } from 'react';

const steps = [
  {
    label: 'Identifies the task',
    highlight: 'nav',
    bubble: '"Let me show you how to submit a monthly report..."',
    sarahAction: 'Analyzing your workflow',
  },
  {
    label: 'Navigates to the screen',
    highlight: 'screen',
    bubble: '"Click on Reports in the sidebar - I\'ll highlight it for you."',
    sarahAction: 'Guiding navigation',
  },
  {
    label: 'Guides each action',
    highlight: 'form',
    bubble: '"Now select the date range and click Generate."',
    sarahAction: 'Walking through steps',
  },
  {
    label: 'Confirms completion',
    highlight: 'done',
    bubble: '"Great job! Your report is ready to download."',
    sarahAction: 'Verifying completion',
  },
];

export default function SarahInfographic() {
  const [activeStep, setActiveStep] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setActiveStep((s) => (s + 1) % steps.length);
        setTransitioning(false);
      }, 300);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const step = steps[activeStep];

  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto' }}>
      {/* Main container */}
      <div style={{
        background: '#fff', borderRadius: 20, border: '1px solid #E8ECF2',
        overflow: 'hidden', boxShadow: '0 12px 48px rgba(0,0,0,0.07)',
      }}>
        {/* Browser chrome */}
        <div style={{
          background: '#F1F5F9', borderBottom: '1px solid #E2E8F0',
          padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FCA5A5' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FCD34D' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#86EFAC' }} />
          </div>
          <div style={{
            flex: 1, marginLeft: 8, background: '#fff', borderRadius: 6,
            padding: '5px 14px', fontSize: 12, color: '#94A3B8',
            border: '1px solid #E2E8F0',
            fontFamily: "'SF Mono', 'Fira Code', monospace",
          }}>
            app.yourcompany.com/dashboard
          </div>
          {/* Hoponai extension badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '4px 10px', borderRadius: 6,
            background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0EA5E9', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: '#0EA5E9' }}>Hoponai Active</span>
          </div>
        </div>

        {/* App content */}
        <div style={{ display: 'flex', minHeight: 360 }}>
          {/* App sidebar */}
          <div style={{
            width: 170, background: '#0F172A', padding: '16px 0',
            display: 'flex', flexDirection: 'column', gap: 1,
          }}>
            <div style={{ padding: '8px 16px', fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 16, letterSpacing: '-0.3px' }}>
              <span style={{ color: '#38BDF8' }}>●</span> YourApp
            </div>
            {['Dashboard', 'Reports', 'Team', 'Settings'].map((item, i) => {
              const isHighlighted = (step.highlight === 'nav' || step.highlight === 'screen' || step.highlight === 'form' || step.highlight === 'done') && i === 1;
              return (
                <div key={item} style={{
                  padding: '9px 16px', fontSize: 13,
                  color: isHighlighted ? '#38BDF8' : 'rgba(255,255,255,0.4)',
                  background: isHighlighted ? 'rgba(56,189,248,0.08)' : 'transparent',
                  borderLeft: isHighlighted ? '3px solid #38BDF8' : '3px solid transparent',
                  transition: 'all 0.4s ease',
                  fontWeight: isHighlighted ? 600 : 400,
                  position: 'relative',
                }}>
                  {item}
                  {step.highlight === 'nav' && i === 1 && (
                    <div style={{
                      position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                      width: 20, height: 20, borderRadius: '50%',
                      border: '2px solid #0EA5E9', opacity: 0.8,
                      animation: 'pingOnce 1.5s ease-out infinite',
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Main area */}
          <div style={{ flex: 1, padding: 24, position: 'relative', background: '#FAFBFD' }}>
            <div style={{
              opacity: transitioning ? 0.3 : 1, transition: 'opacity 0.3s ease',
            }}>
              {/* Page header */}
              <div style={{
                fontSize: 18, fontWeight: 700, color: '#1E293B', marginBottom: 20,
              }}>
                {step.highlight === 'nav' ? 'Dashboard Overview' : 'Generate Report'}
              </div>

              {/* Nav state - show placeholder content */}
              {step.highlight === 'nav' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[85, 65, 45].map((w, i) => (
                    <div key={i} style={{ height: 12, borderRadius: 6, background: '#E2E8F0', width: `${w}%` }} />
                  ))}
                  <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                    {[1, 2, 3].map((i) => (
                      <div key={i} style={{ flex: 1, height: 60, borderRadius: 8, background: '#E2E8F0' }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Form states */}
              {(step.highlight === 'screen' || step.highlight === 'form') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 500 }}>Date Range</div>
                    <div style={{
                      padding: '9px 14px', borderRadius: 8,
                      border: step.highlight === 'form' ? '2px solid #0EA5E9' : '1px solid #E2E8F0',
                      fontSize: 13, color: '#1E293B', background: '#fff',
                      transition: 'all 0.4s ease',
                      boxShadow: step.highlight === 'form' ? '0 0 0 3px rgba(14,165,233,0.12)' : 'none',
                    }}>
                      Jan 1 - Jan 31, 2026
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4, fontWeight: 500 }}>Report Type</div>
                    <div style={{
                      padding: '9px 14px', borderRadius: 8, border: '1px solid #E2E8F0',
                      fontSize: 13, color: '#1E293B', background: '#fff',
                    }}>
                      Monthly Summary
                    </div>
                  </div>
                  <button style={{
                    padding: '10px 24px', borderRadius: 8, border: 'none',
                    background: step.highlight === 'form' ? '#0EA5E9' : '#E2E8F0',
                    color: step.highlight === 'form' ? '#fff' : '#94A3B8',
                    fontSize: 14, fontWeight: 600, width: 'fit-content',
                    transition: 'all 0.4s ease', cursor: 'default',
                    position: 'relative',
                  }}>
                    Generate Report
                    {step.highlight === 'form' && (
                      <div style={{
                        position: 'absolute', inset: -4,
                        border: '2px solid rgba(14,165,233,0.4)', borderRadius: 12,
                        animation: 'pingOnce 1.5s ease-out infinite',
                      }} />
                    )}
                  </button>
                </div>
              )}

              {/* Done state */}
              {step.highlight === 'done' && (
                <div style={{
                  background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: 12, padding: 24, textAlign: 'center',
                }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#059669' }}>Report Generated!</div>
                  <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>monthly-report-jan-2026.pdf</div>
                </div>
              )}
            </div>

            {/* Sarah AI bubble */}
            <div style={{
              position: 'absolute', bottom: 16, right: 16, maxWidth: 260,
              opacity: transitioning ? 0 : 1, transition: 'opacity 0.3s ease',
              transform: transitioning ? 'translateY(8px)' : 'translateY(0)',
            }}>
              <div style={{
                background: '#fff', borderRadius: 14, padding: '12px 16px',
                boxShadow: '0 4px 20px rgba(14,165,233,0.18)',
                border: '1px solid rgba(14,165,233,0.15)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0EA5E9, #0369A1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: '#fff', fontWeight: 800,
                  }}>
                    S
                  </div>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0EA5E9' }}>Sarah</span>
                    <span style={{ fontSize: 9, color: '#94A3B8', marginLeft: 6 }}>{step.sarahAction}</span>
                  </div>
                </div>
                <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5, fontStyle: 'italic' }}>
                  {step.bubble}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => { setTransitioning(true); setTimeout(() => { setActiveStep(i); setTransitioning(false); }, 200); }}
            style={{
              padding: '7px 14px', borderRadius: 20,
              border: '1px solid', borderColor: i === activeStep ? '#0EA5E9' : '#E2E8F0',
              background: i === activeStep ? 'rgba(14,165,233,0.06)' : '#fff',
              color: i === activeStep ? '#0EA5E9' : '#94A3B8',
              fontSize: 12, fontWeight: i === activeStep ? 600 : 400,
              cursor: 'pointer', transition: 'all 0.3s ease',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes pingOnce { 0% { transform: translateY(-50%) scale(1); opacity: 0.8; } 100% { transform: translateY(-50%) scale(1.8); opacity: 0; } }
      `}</style>
    </div>
  );
}
