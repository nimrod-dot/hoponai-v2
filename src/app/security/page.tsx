import Navbar from '@/components/Navbar';
import Reveal from '@/components/Reveal';
import Footer from '@/components/Footer';
import Link from 'next/link';

export const metadata = { title: 'Security - Hoponai', description: 'How Hoponai protects your organization\'s data.' };

export default function SecurityPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section style={{ background: 'var(--bg)', padding: '140px 1.5rem 80px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.3, backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          <Reveal>
            <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 20, background: 'var(--blue-bg)', border: '1px solid var(--blue-light)', marginBottom: 20 }}>
              <span style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600 }}>Security & Compliance</span>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 400, color: 'var(--heading)', margin: '0 0 16px', lineHeight: 1.15 }}>
              Enterprise-grade security. By default.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ fontSize: 18, color: 'var(--text)', margin: '0 auto', maxWidth: 520, lineHeight: 1.6 }}>
              Your company data is sensitive. We treat it that way. Hoponai is built on battle-tested infrastructure with security at every layer.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Trust badges */}
      <section style={{ background: 'var(--white)', padding: '56px 1.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
          {[
            { label: 'SOC 2 Type II', sub: 'In progress', icon: '🔒' },
            { label: 'GDPR Compliant', sub: 'EU data handling', icon: '🇪🇺' },
            { label: '256-bit Encryption', sub: 'Data at rest & in transit', icon: '🛡️' },
            { label: '99.9% Uptime', sub: 'SLA guaranteed', icon: '⚡' },
          ].map((b, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div style={{ textAlign: 'center', minWidth: 140 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{b.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--heading)' }}>{b.label}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{b.sub}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Infrastructure */}
      <section style={{ background: 'var(--bg)', padding: '80px 1.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(26px, 4vw, 34px)', color: 'var(--heading)', textAlign: 'center', margin: '0 0 40px' }}>
              Infrastructure & Data Handling
            </h2>
          </Reveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[
              {
                title: 'Hosting & Infrastructure',
                items: [
                  'Application hosted on Vercel (SOC 2 Type II certified, ISO 27001)',
                  'Database hosted on Supabase (SOC 2 Type II certified, built on AWS)',
                  'Authentication managed by Clerk (SOC 2 Type II certified)',
                  'All infrastructure runs on AWS with data centers in the US and EU',
                ],
              },
              {
                title: 'Data Encryption',
                items: [
                  'All data encrypted in transit using TLS 1.3',
                  'All data encrypted at rest using AES-256',
                  'Database connections use SSL certificates',
                  'API keys and secrets stored in encrypted environment variables',
                ],
              },
              {
                title: 'Access Control',
                items: [
                  'Role-based access control (RBAC) for all users',
                  'Organization-level data isolation - no cross-tenant access',
                  'SSO/SAML support available on Enterprise plans',
                  'Audit logging of all administrative actions',
                ],
              },
              {
                title: 'Data Privacy',
                items: [
                  'We never use your company data to train AI models',
                  'Your data is never shared with third parties',
                  'Data deletion available upon request or contract termination',
                  'GDPR-compliant data processing agreements available',
                ],
              },
              {
                title: 'Browser Extension Security',
                items: [
                  'Chrome extension operates with minimal required permissions',
                  'No data is stored locally on the user\'s machine',
                  'All recorded walkthrough data is transmitted over encrypted channels',
                  'Extension code is reviewed and published through Chrome Web Store',
                ],
              },
            ].map((section, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div style={{ background: 'var(--white)', borderRadius: 12, padding: '28px 24px', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--heading)', marginBottom: 14 }}>{section.title}</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {section.items.map((item, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>
                        <span style={{ color: 'var(--blue)', fontSize: 16, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--white)', padding: '64px 1.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 24, color: 'var(--heading)', margin: '0 0 12px' }}>
              Have security questions?
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text)', margin: '0 0 24px', lineHeight: 1.6 }}>
              We&apos;re happy to walk through our security practices, provide our SOC 2 report, or complete your vendor security questionnaire.
            </p>
            <Link href="/contact-sales" style={{
              background: 'var(--blue)', color: 'var(--white)', padding: '12px 28px', borderRadius: 10,
              fontWeight: 600, fontSize: 15, display: 'inline-block',
            }}>Contact Security Team</Link>
          </Reveal>
        </div>
      </section>

      <Footer />
    </>
  );
}
