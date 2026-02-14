'use client';

import { useState, useEffect } from 'react';

const steps = [
  {
    title: 'SOP loaded',
    procedure: 'Patient Data Access Protocol',
    bubble: '"Let\'s walk through the HIPAA-compliant data access procedure. I\'ll guide each step..."',
    checks: [
      { label: 'Verify authorization level', status: 'active' },
      { label: 'Log access request', status: 'pending' },
      { label: 'Apply data minimization', status: 'pending' },
      { label: 'Document & sign off', status: 'pending' },
    ],
    auditStatus: 'In Progress',
  },
  {
    title: 'Step verification',
    procedure: 'Patient Data Access Protocol',
    bubble: '"Before proceeding - which authorization level is required for billing records? Let me check your understanding..."',
    checks: [
      { label: 'Verify authorization level', status: 'complete' },
      { label: 'Log access request', status: 'active' },
      { label: 'Apply data minimization', status: 'pending' },
      { label: 'Document & sign off', status: 'pending' },
    ],
    auditStatus: 'In Progress',
  },
  {
    title: 'Comprehension check',
    procedure: 'Patient Data Access Protocol',
    bubble: '"Correct! Level 2 authorization. Now let me show you where to log the access request in the system..."',
    checks: [
      { label: 'Verify authorization level', status: 'complete' },
      { label: 'Log access request', status: 'complete' },
      { label: 'Apply data minimization', status: 'active' },
      { label: 'Document & sign off', status: 'pending' },
    ],
    auditStatus: 'In Progress',
  },
  {
    title: 'Procedure complete',
    procedure: 'Patient Data Access Protocol',
    bubble: '"All steps verified. This completion is logged for your compliance record. Audit-ready."',
    checks: [
      { label: 'Verify authorization level', status: 'complete' },
      { label: 'Log access request', status: 'complete' },
      { label: 'Apply data minimization', status: 'complete' },
      { label: 'Document & sign off', status: 'complete' },
    ],
    auditStatus: 'Complete ✓',
  },
];

export default function SOPsInfographic() {
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
  const completedCount = step.checks.filter(c => c.status === 'complete').length;

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
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: step.auditStatus.includes('✓') ? '#DCFCE7' : '#FEF3C7',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
              transition: 'background 0.4s ease',
            }}>
              {step.auditStatus.includes('✓') ? '✅' : '📋'}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{step.procedure}</div>
              <div style={{ fontSize: 11, color: '#64748B' }}>HIPAA Compliance Training</div>
            </div>
          </div>
          <div style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
            background: step.auditStatus.includes('✓') ? '#DCFCE7' : '#FEF9C3',
            color: step.auditStatus.includes('✓') ? '#166534' : '#854D0E',
            border: step.auditStatus.includes('✓') ? '1px solid #BBF7D0' : '1px solid #FDE68A',
            transition: 'all 0.4s ease',
          }}>
            Audit Status: {step.auditStatus}
          </div>
        </div>

        <div style={{
          padding: 28, opacity: fading ? 0.3 : 1,
          transition: 'opacity 0.25s ease',
        }}>
          <div style={{ display: 'flex', gap: 24 }}>
            {/* Checklist */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Procedure Steps ({completedCount}/{step.checks.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {step.checks.map((check, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px', borderRadius: 10,
                    background: check.status === 'active' ? 'rgba(14,165,233,0.04)' : check.status === 'complete' ? 'rgba(16,185,129,0.04)' : '#FAFBFD',
                    border: check.status === 'active' ? '2px solid #0EA5E9' : check.status === 'complete' ? '1px solid #86EFAC' : '1px solid #E2E8F0',
                    transition: 'all 0.4s ease',
                  }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: check.status === 'complete' ? '#10B981' : check.status === 'active' ? '#0EA5E9' : '#E2E8F0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, color: '#fff', fontWeight: 700,
                      transition: 'all 0.4s ease',
                    }}>
                      {check.status === 'complete' ? '✓' : check.status === 'active' ? (i + 1) : (i + 1)}
                    </div>
                    <div>
                      <div style={{
                        fontSize: 14,
                        fontWeight: check.status === 'active' ? 600 : 500,
                        color: check.status === 'complete' ? '#059669' : check.status === 'active' ? '#0EA5E9' : '#64748B',
                        transition: 'color 0.4s ease',
                      }}>
                        {check.label}
                      </div>
                      {check.status === 'active' && (
                        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Sarah is guiding this step...</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel - compliance dashboard */}
            <div style={{ width: 220 }}>
              <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600, marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Compliance Dashboard
              </div>
              <div style={{
                background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0',
                padding: 16, display: 'flex', flexDirection: 'column', gap: 14,
              }}>
                <div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 2 }}>Team Completion</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#1E293B' }}>87%</div>
                  <div style={{ width: '100%', height: 4, borderRadius: 2, background: '#E2E8F0', marginTop: 4 }}>
                    <div style={{ width: '87%', height: '100%', borderRadius: 2, background: '#10B981' }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 2 }}>Avg. Score</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#1E293B' }}>94%</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 2 }}>Audit Status</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#10B981' }}>Ready for Review</div>
                </div>
                <div style={{
                  padding: '8px 12px', borderRadius: 8, background: '#ECFDF5',
                  border: '1px solid #BBF7D0', fontSize: 11, color: '#166534',
                  textAlign: 'center', fontWeight: 600,
                }}>
                  📥 Export Audit Report
                </div>
              </div>
            </div>
          </div>

          {/* Sarah bubble */}
          <div style={{
            background: '#fff', borderRadius: 14, padding: '12px 16px', marginTop: 20,
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
              <span style={{ fontSize: 10, color: '#94A3B8' }}>Compliance Mode</span>
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
