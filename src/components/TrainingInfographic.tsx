'use client';

import { useState, useEffect } from 'react';

const departments = [
  { name: 'Sales', members: 24, completed: 0, icon: '💼' },
  { name: 'Support', members: 18, completed: 0, icon: '🎧' },
  { name: 'Marketing', members: 12, completed: 0, icon: '📣' },
  { name: 'Operations', members: 8, completed: 0, icon: '⚙️' },
];

const phases = [
  {
    title: 'New CRM rollout announced',
    subtitle: 'Monday 9:00 AM',
    bubble: '"I\'ve learned the new CRM. Let me create personalized training for each team..."',
    depts: [{ completed: 0, training: false }, { completed: 0, training: false }, { completed: 0, training: false }, { completed: 0, training: false }],
    status: 'preparing',
  },
  {
    title: 'Sales team starts training',
    subtitle: 'Monday 10:00 AM',
    bubble: '"Sales team - I\'ll show you the new pipeline view. It replaces the old forecast tab..."',
    depts: [{ completed: 8, training: true }, { completed: 0, training: false }, { completed: 0, training: false }, { completed: 0, training: false }],
    status: 'active',
  },
  {
    title: 'All teams training in parallel',
    subtitle: 'Tuesday',
    bubble: '"Each team gets their own track. Support sees ticket integration, Marketing sees campaign tools..."',
    depts: [{ completed: 18, training: true }, { completed: 12, training: true }, { completed: 6, training: true }, { completed: 4, training: true }],
    status: 'active',
  },
  {
    title: 'Organization fully trained',
    subtitle: 'Thursday',
    bubble: '"62 people trained in 4 days. Traditional approach would have taken 6-8 weeks."',
    depts: [{ completed: 24, training: false }, { completed: 18, training: false }, { completed: 12, training: false }, { completed: 8, training: false }],
    status: 'complete',
  },
];

export default function TrainingInfographic() {
  const [active, setActive] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActive((s) => (s + 1) % phases.length);
        setFading(false);
      }, 250);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const phase = phases[active];
  const totalCompleted = phase.depts.reduce((sum, d, i) => sum + d.completed, 0);
  const totalMembers = departments.reduce((sum, d) => sum + d.members, 0);

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
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>CRM Migration Training</div>
            <div style={{ fontSize: 11, color: '#64748B' }}>{phase.subtitle} - {phase.title}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#64748B' }}>{totalCompleted}/{totalMembers} trained</span>
            <div style={{ width: 100, height: 6, borderRadius: 3, background: '#E2E8F0', overflow: 'hidden' }}>
              <div style={{
                width: `${(totalCompleted / totalMembers) * 100}%`, height: '100%', borderRadius: 3,
                background: phase.status === 'complete' ? '#10B981' : '#0EA5E9',
                transition: 'width 0.8s ease',
              }} />
            </div>
          </div>
        </div>

        <div style={{
          padding: 28, opacity: fading ? 0.3 : 1,
          transition: 'opacity 0.25s ease',
        }}>
          {/* Department grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginBottom: 20 }}>
            {departments.map((dept, i) => {
              const d = phase.depts[i];
              const pct = Math.round((d.completed / dept.members) * 100);
              return (
                <div key={dept.name} style={{
                  padding: '16px', borderRadius: 12,
                  border: d.training ? '2px solid #0EA5E9' : d.completed === dept.members ? '1px solid #86EFAC' : '1px solid #E2E8F0',
                  background: d.completed === dept.members ? 'rgba(16,185,129,0.03)' : d.training ? 'rgba(14,165,233,0.02)' : '#fff',
                  transition: 'all 0.5s ease',
                  position: 'relative', overflow: 'hidden',
                }}>
                  {d.training && (
                    <div style={{
                      position: 'absolute', top: 8, right: 8,
                      padding: '2px 8px', borderRadius: 10,
                      background: '#0EA5E9', fontSize: 9, color: '#fff', fontWeight: 600,
                    }}>
                      TRAINING
                    </div>
                  )}
                  {d.completed === dept.members && (
                    <div style={{
                      position: 'absolute', top: 8, right: 8,
                      padding: '2px 8px', borderRadius: 10,
                      background: '#10B981', fontSize: 9, color: '#fff', fontWeight: 600,
                    }}>
                      COMPLETE
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 20 }}>{dept.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1E293B' }}>{dept.name}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>{d.completed}/{dept.members} members</div>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: 4, borderRadius: 2, background: '#E2E8F0', overflow: 'hidden' }}>
                    <div style={{
                      width: `${pct}%`, height: '100%', borderRadius: 2,
                      background: d.completed === dept.members ? '#10B981' : '#0EA5E9',
                      transition: 'width 0.8s ease',
                    }} />
                  </div>
                </div>
              );
            })}
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
              {phase.bubble}
            </div>
          </div>
        </div>
      </div>

      {/* Phase indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
        {phases.map((p, i) => (
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
          >
            {p.subtitle}
          </button>
        ))}
      </div>
    </div>
  );
}
