import Link from 'next/link';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--white)', padding: '56px 1.5rem 32px', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32, marginBottom: 40 }}>
          {/* Brand */}
          <div>
            <Link href="/" style={{ display: 'flex', alignItems: 'baseline', marginBottom: 10 }}>
              <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: 'var(--heading)' }}>hopon</span>
              <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: 'var(--blue)' }}>ai</span>
            </Link>
            <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, maxWidth: 200 }}>
              The AI that knows how your company works.
            </p>
          </div>

          {/* Solutions */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--heading)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 14 }}>Solutions</div>
            {[
              { href: '/solutions/onboarding', label: 'Employee Onboarding' },
              { href: '/solutions/training', label: 'Continuous Training' },
              { href: '/solutions/customers', label: 'Customer Training' },
              { href: '/solutions/sops', label: 'SOPs & Compliance' },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={{ display: 'block', fontSize: 13, color: 'var(--text)', marginBottom: 8 }}>{l.label}</Link>
            ))}
          </div>

          {/* Company */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--heading)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 14 }}>Company</div>
            {[
              { href: '/about', label: 'About' },
              { href: '/pricing', label: 'Pricing' },
              { href: '/security', label: 'Security' },
              { href: '/contact-sales', label: 'Contact Sales' },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={{ display: 'block', fontSize: 13, color: 'var(--text)', marginBottom: 8 }}>{l.label}</Link>
            ))}
          </div>

          {/* Legal */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--heading)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 14 }}>Legal</div>
            {[
              { href: '/privacy', label: 'Privacy Policy' },
              { href: '/terms', label: 'Terms of Service' },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={{ display: 'block', fontSize: 13, color: 'var(--text)', marginBottom: 8 }}>{l.label}</Link>
            ))}
            <a href="mailto:contact@hoponai.com" style={{ display: 'block', fontSize: 13, color: 'var(--blue)', marginTop: 12 }}>contact@hoponai.com</a>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20, fontSize: 12, color: 'var(--muted)', textAlign: 'center' }}>
          © 2026 Hoponai. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
