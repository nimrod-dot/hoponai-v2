import { auth } from '@clerk/nextjs/server';
import { createServerClient } from '@/lib/supabase';

export default async function DashboardPage() {
  const { userId } = await auth();
  const supabase = createServerClient();

  const { data: user } = await supabase
    .from('users')
    .select('*, organizations(*)')
    .eq('clerk_user_id', userId)
    .single();

  const orgId = user?.org_id;

  // Get stats
  const { count: walkthroughCount } = await supabase
    .from('walkthroughs')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId);

  const { count: teamCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId);

  const { count: completedCount } = await supabase
    .from('walkthrough_assignments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'completed');

  return (
    <div>
      <h1 style={{
        fontSize: 28, fontWeight: 700, color: '#1A1D26',
        fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 8,
      }}>
        Welcome back, {user?.full_name?.split(' ')[0] || 'there'}
      </h1>
      <p style={{ fontSize: 16, color: '#8B92A5', marginBottom: 32 }}>
        Here's what's happening with your training.
      </p>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
        {[
          { label: 'Walkthroughs', value: walkthroughCount || 0, color: '#0EA5E9' },
          { label: 'Team Members', value: teamCount || 0, color: '#10B981' },
          { label: 'Completed Trainings', value: completedCount || 0, color: '#8B5CF6' },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: '#fff', borderRadius: 12, padding: '24px',
            border: '1px solid #E8ECF2',
          }}>
            <div style={{ fontSize: 14, color: '#8B92A5', marginBottom: 8 }}>{stat.label}</div>
            <div style={{ fontSize: 36, fontWeight: 700, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1A1D26', marginBottom: 16 }}>
        Quick Actions
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        <ActionCard
          title="Record a Walkthrough"
          desc="Teach the AI how your software works"
          href="/dashboard/extension"
          icon="🎬"
        />
        <ActionCard
          title="Invite Team Members"
          desc="Add trainers and learners to your team"
          href="/dashboard/team"
          icon="👥"
        />
      </div>
    </div>
  );
}

function ActionCard({ title, desc, href, icon }: {
  title: string; desc: string; href: string; icon: string;
}) {
  return (
    <a href={href} style={{
      display: 'block', background: '#fff', borderRadius: 12,
      padding: '24px', border: '1px solid #E8ECF2',
      textDecoration: 'none', transition: 'all 0.15s',
      cursor: 'pointer',
    }}>
      <span style={{ fontSize: 32, marginBottom: 12, display: 'block' }}>{icon}</span>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1D26', marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 14, color: '#8B92A5' }}>{desc}</div>
    </a>
  );
}