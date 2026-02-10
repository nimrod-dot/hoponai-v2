import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--white)', padding: '48px 2rem 32px', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 40, marginBottom: 32 }}>
          <div>
            <Link href="/" style={{ display: 'flex', alignItems: 'baseline', marginBottom: 8 }}>
              <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: 'var(--heading)' }}>hopon</span>
              <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: 'var(--blue)' }}>ai</span>
            </Link>
            <p style={{ fontSize: 13, color: 'var(--muted)', maxWidth: 260, lineHeight: 1.5 }}>
              The AI that knows how your company works. Interactive training for every employee.
            </p>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--heading)', letterSpacing: 1, marginBottom: 12 }}>SOLUTIONS</div>
            {[
              { href: '/solutions/onboarding', label: 'Employee Onboarding' },
              { href: '/solutions/training', label: 'Continuous Training' },
              { href: '/solutions/customers', label: 'Customer Training' },
              { href: '/solutions/sops', label: 'SOPs & Compliance' },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={{ display: 'block', fontSize: 13, color: 'var(--text)', marginBottom: 8, transition: 'color 0.2s' }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = 'var(--blue)')}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--text)')}
              >{l.label}</Link>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--heading)', letterSpacing: 1, marginBottom: 12 }}>CONTACT</div>
            <a href="mailto:nimrod@hoponai.com" style={{ display: 'block', fontSize: 13, color: 'var(--blue)', marginBottom: 8 }}>nimrod@hoponai.com</a>
            <p style={{ fontSize: 13, color: 'var(--muted)' }}>hoponai.com</p>
          </div>
        </div>
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
          © 2026 Hoponai. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
