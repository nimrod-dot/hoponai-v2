export default function ExtensionPage() {
  return (
    <div>
      <h1 style={{
        fontSize: 28, fontWeight: 700, color: '#1A1D26',
        fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 8,
      }}>
        Chrome Extension
      </h1>
      <p style={{ fontSize: 16, color: '#8B92A5', marginBottom: 40 }}>
        Install the Hoponai extension to start recording walkthroughs.
      </p>

      <div style={{
        background: '#fff', borderRadius: 16, padding: '48px',
        border: '1px solid #E8ECF2', textAlign: 'center',
        maxWidth: 560,
      }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>🧩</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1A1D26', marginBottom: 12 }}>
          Hoponai for Chrome
        </h2>
        <p style={{ fontSize: 15, color: '#8B92A5', marginBottom: 32, lineHeight: 1.6 }}>
          Record walkthroughs of any web application. The AI learns how your
          software works and creates interactive training automatically.
        </p>
        <a
          href="#" /* Replace with Chrome Web Store link when published */
          style={{
            display: 'inline-block', padding: '14px 36px',
            borderRadius: 10, background: '#0EA5E9', color: '#fff',
            fontSize: 16, fontWeight: 600, textDecoration: 'none',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          Download Extension
        </a>
        <p style={{ fontSize: 13, color: '#8B92A5', marginTop: 16 }}>
          Requires Google Chrome or Chromium-based browser
        </p>
      </div>

      {/* How it works */}
      <div style={{ marginTop: 48, maxWidth: 560 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1A1D26', marginBottom: 24 }}>
          How It Works
        </h2>
        {[
          { step: '1', title: 'Install the extension', desc: 'Add Hoponai to Chrome and sign in with your account.' },
          { step: '2', title: 'Record a walkthrough', desc: 'Click Record and walk through any process in your software. The AI watches every click and keystroke.' },
          { step: '3', title: 'AI learns your software', desc: 'The AI analyzes the DOM, understands the UI, and creates interactive training modules automatically.' },
          { step: '4', title: 'Assign to your team', desc: 'Team members get guided, hands-on training directly in the real software - not a video.' },
        ].map((item) => (
          <div key={item.step} style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#0EA5E9', color: '#fff', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, flexShrink: 0,
            }}>
              {item.step}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1D26', marginBottom: 4 }}>
                {item.title}
              </div>
              <div style={{ fontSize: 14, color: '#8B92A5', lineHeight: 1.5 }}>
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}