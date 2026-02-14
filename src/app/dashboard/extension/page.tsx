export default function ExtensionPage() {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1A1D26', marginBottom: 4 }}>
          Chrome Extension
        </h1>
        <p style={{ fontSize: 15, color: '#8B92A5' }}>
          Record and deliver interactive walkthroughs directly in your browser.
        </p>
      </div>

      <div style={{
        background: '#fff', borderRadius: 16, border: '1px solid #E8ECF2',
        padding: '48px 40px', textAlign: 'center', maxWidth: 560, margin: '24px auto',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
          background: 'linear-gradient(135deg, rgba(14,165,233,0.1), rgba(14,165,233,0.05))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36,
        }}>
          🧩
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1A1D26', marginBottom: 8 }}>
          Get started with Hoponai
        </h2>
        <p style={{ fontSize: 15, color: '#8B92A5', lineHeight: 1.7, marginBottom: 32, maxWidth: 400, margin: '0 auto 32px' }}>
          The Chrome extension lets trainers record walkthroughs by simply using your software. Each click, form entry, and navigation is captured automatically.
        </p>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left', marginBottom: 32 }}>
          {[
            { step: '1', title: 'Install the extension', desc: 'Add Hoponai to Chrome in one click.' },
            { step: '2', title: 'Record a walkthrough', desc: 'Navigate your software normally while we capture every step.' },
            { step: '3', title: 'Assign to your team', desc: 'Team members get interactive, guided training.' },
          ].map((s) => (
            <div key={s.step} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: '#0EA5E9', color: '#fff', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700,
              }}>
                {s.step}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1D26', marginBottom: 2 }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 14, color: '#8B92A5' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          padding: '16px 20px', borderRadius: 12,
          background: 'rgba(14,165,233,0.05)', border: '1px solid rgba(14,165,233,0.15)',
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0EA5E9', marginBottom: 4 }}>
            🚀 Coming very soon
          </div>
          <div style={{ fontSize: 14, color: '#4A5168', lineHeight: 1.5 }}>
            The Chrome extension is in final testing. We'll notify you the moment it's ready to install.
          </div>
        </div>

        <button
          disabled
          style={{
            display: 'inline-block', background: '#E8ECF2', color: '#8B92A5',
            padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16,
            border: 'none', cursor: 'not-allowed',
          }}
        >
          Extension Coming Soon
        </button>
      </div>
    </div>
  );
}