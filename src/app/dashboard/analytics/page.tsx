export default function AnalyticsPage() {
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

      <div style={{
        background: '#fff', borderRadius: 16, border: '1px solid #E8ECF2',
        padding: '64px 40px', textAlign: 'center', maxWidth: 520, margin: '40px auto',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1A1D26', marginBottom: 8 }}>
          Analytics coming soon
        </h2>
        <p style={{ fontSize: 15, color: '#8B92A5', lineHeight: 1.6, maxWidth: 360, margin: '0 auto' }}>
          Once your team starts completing walkthroughs, you'll see completion rates, time-to-proficiency, and engagement metrics here.
        </p>
      </div>
    </div>
  );
}