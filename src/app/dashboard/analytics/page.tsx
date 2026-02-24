import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';

export default async function AnalyticsPage() {
  const { userId } = await auth();
  const supabase = createServerClient();

  const { data: user } = await supabase
    .from('users')
    .select('org_id')
    .eq('clerk_user_id', userId!)
    .single();

  const orgId = user?.org_id;

  const { data: events } = orgId
    ? await supabase
        .from('training_events')
        .select('walkthrough_id, event_type, step_index')
        .eq('org_id', orgId)
    : { data: [] };

  // Aggregate per walkthrough
  const statsMap: Record<string, {
    starts: number;
    completions: number;
    hints: number;
    questions: number;
    stepAdvances: Record<number, number>;
  }> = {};

  for (const e of events ?? []) {
    if (!statsMap[e.walkthrough_id]) {
      statsMap[e.walkthrough_id] = { starts: 0, completions: 0, hints: 0, questions: 0, stepAdvances: {} };
    }
    const s = statsMap[e.walkthrough_id];
    if (e.event_type === 'session_start')    s.starts++;
    if (e.event_type === 'session_complete') s.completions++;
    if (e.event_type === 'hint_shown')       s.hints++;
    if (e.event_type === 'question_asked')   s.questions++;
    if (e.event_type === 'step_advance' && e.step_index != null) {
      s.stepAdvances[e.step_index] = (s.stepAdvances[e.step_index] || 0) + 1;
    }
  }

  const ids = Object.keys(statsMap);

  const { data: walkthroughs } = ids.length > 0 && orgId
    ? await supabase
        .from('walkthroughs')
        .select('id, title')
        .eq('org_id', orgId)
        .in('id', ids)
    : { data: [] };

  const rows = (walkthroughs ?? []).map((w) => {
    const s = statsMap[w.id];
    const rate = s.starts > 0 ? Math.round((s.completions / s.starts) * 100) : 0;
    const hardestEntry = Object.entries(s.stepAdvances)
      .sort((a, b) => Number(b[1]) - Number(a[1]))[0];
    const hardestStep = hardestEntry ? `Step ${Number(hardestEntry[0]) + 1}` : '—';
    return {
      id: w.id,
      title: w.title || 'Untitled',
      starts: s.starts,
      completions: s.completions,
      rate,
      hints: s.hints,
      questions: s.questions,
      hardestStep,
    };
  });

  const hasData = rows.length > 0;

  const cellStyle = {
    padding: '12px 16px',
    borderBottom: '1px solid #E8ECF2',
    fontSize: 13,
    color: '#1A1D26',
  } as const;

  const headerCellStyle = {
    ...cellStyle,
    fontWeight: 600,
    color: '#8B92A5',
    fontSize: 11,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    background: '#F8FAFC',
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1A1D26', marginBottom: 4 }}>
          Analytics
        </h1>
        <p style={{ fontSize: 15, color: '#8B92A5' }}>
          Track training progress and team performance.
        </p>
      </div>

      {!hasData ? (
        <div style={{
          background: '#fff', borderRadius: 16, border: '1px solid #E8ECF2',
          padding: '64px 40px', textAlign: 'center', maxWidth: 520, margin: '40px auto',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1A1D26', marginBottom: 8 }}>
            No data yet
          </h2>
          <p style={{ fontSize: 15, color: '#8B92A5', lineHeight: 1.6, maxWidth: 360, margin: '0 auto' }}>
            No training sessions recorded yet. Share a walkthrough with your team — data will appear here as they complete it.
          </p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E8ECF2', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ ...headerCellStyle, textAlign: 'left' }}>Walkthrough</th>
                <th style={{ ...headerCellStyle, textAlign: 'center' }}>Sessions</th>
                <th style={{ ...headerCellStyle, textAlign: 'center' }}>Completions</th>
                <th style={{ ...headerCellStyle, textAlign: 'center' }}>Rate</th>
                <th style={{ ...headerCellStyle, textAlign: 'center' }}>Hints shown</th>
                <th style={{ ...headerCellStyle, textAlign: 'center' }}>Questions asked</th>
                <th style={{ ...headerCellStyle, textAlign: 'center' }}>Most-reached step</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td style={{ ...cellStyle, fontWeight: 500, maxWidth: 260 }}>
                    <a href={`/dashboard/walkthroughs/${row.id}`} style={{ color: '#0EA5E9', textDecoration: 'none' }}>
                      {row.title}
                    </a>
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>{row.starts}</td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>{row.completions}</td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: 10,
                      fontWeight: 600,
                      fontSize: 12,
                      background: row.rate >= 75 ? '#F0FDF4' : row.rate >= 40 ? '#FFF7ED' : '#FEF2F2',
                      color: row.rate >= 75 ? '#15803D' : row.rate >= 40 ? '#C2410C' : '#DC2626',
                    }}>
                      {row.rate}%
                    </span>
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'center', color: '#8B92A5' }}>{row.hints}</td>
                  <td style={{ ...cellStyle, textAlign: 'center', color: '#8B92A5' }}>{row.questions}</td>
                  <td style={{ ...cellStyle, textAlign: 'center', color: '#8B92A5' }}>{row.hardestStep}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
