'use client';

import Link from 'next/link';
import Navbar from './Navbar';
import Reveal from './Reveal';
import CTASection from './CTASection';
import Footer from './Footer';

interface Feature {
  icon: string;
  title: string;
  desc: string;
}

interface Pain {
  stat: string;
  label: string;
}

interface SolutionPageProps {
  badge: string;
  headline: string;
  subline: string;
  pains: Pain[];
  painSummary: string;
  features: Feature[];
  howTitle: string;
  howSteps: { num: string; title: string; desc: string }[];
  ctaLine: string;
}

export default function SolutionPage({ badge, headline, subline, pains, painSummary, features, howTitle, howSteps, ctaLine }: SolutionPageProps) {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section style={{ background: 'var(--bg)', padding: '140px 2rem 80px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.3, backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          <Reveal>
            <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 20, background: 'var(--blue-bg)', border: '1px solid var(--blue-light)', marginBottom: 20 }}>
              <span style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600 }}>{badge}</span>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 48, fontWeight: 400, color: 'var(--heading)', margin: '0 0 16px', lineHeight: 1.15 }}>
              {headline}
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ fontSize: 18, color: 'var(--text)', margin: '0 auto 32px', maxWidth: 520, lineHeight: 1.6 }}>{subline}</p>
          </Reveal>
          <Reveal delay={0.3}>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="#cta" style={{
                background: 'var(--blue)', color: 'var(--white)', padding: '13px 28px', borderRadius: 10,
                fontWeight: 600, fontSize: 15, display: 'inline-block',
              }}>Get a Demo</Link>
              <button style={{
                background: 'var(--white)', color: 'var(--heading)', border: '1px solid var(--border)',
                padding: '13px 28px', borderRadius: 10, fontWeight: 600, fontSize: 15, cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.2s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.color = 'var(--blue)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--heading)'; }}
              >Watch Video ▶</button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pain points */}
      <section style={{ background: 'var(--white)', padding: '80px 2rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 34, color: 'var(--heading)', textAlign: 'center', margin: '0 0 40px' }}>
              {painSummary}
            </h2>
          </Reveal>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            {pains.map((p, i) => (
              <Reveal key={i} delay={i * 0.1} style={{ flex: '1 1 220px', maxWidth: 280 }}>
                <div style={{
                  background: 'var(--bg)', borderRadius: 12, padding: '24px 20px', textAlign: 'center',
                  border: '1px solid var(--border)', transition: 'all 0.3s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}
                >
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 36, color: 'var(--blue)', marginBottom: 6 }}>{p.stat}</div>
                  <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>{p.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ background: 'var(--bg)', padding: '80px 2rem' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 34, color: 'var(--heading)', textAlign: 'center', margin: '0 0 40px' }}>
              How Hoponai solves this
            </h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {features.map((f, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div style={{
                  background: 'var(--white)', borderRadius: 12, padding: '24px 20px',
                  border: '1px solid var(--border)', transition: 'all 0.3s', height: '100%',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px var(--blue-glow)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--heading)', marginBottom: 6 }}>{f.title}</div>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: 'var(--white)', padding: '80px 2rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 34, color: 'var(--heading)', textAlign: 'center', margin: '0 0 40px' }}>
              {howTitle}
            </h2>
          </Reveal>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            {howSteps.map((s, i) => (
              <Reveal key={i} delay={i * 0.12} style={{ flex: '1 1 260px', maxWidth: 300 }}>
                <div style={{
                  background: 'var(--bg)', borderRadius: 12, padding: '28px 24px',
                  border: '1px solid var(--border)', height: '100%', transition: 'all 0.3s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.06)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 36, color: 'var(--blue)', marginBottom: 8 }}>{s.num}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--heading)', marginBottom: 8 }}>{s.title}</div>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Inline CTA */}
      <section style={{ background: 'var(--bg)', padding: '48px 2rem' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <p style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 22, color: 'var(--heading)', lineHeight: 1.5, margin: '0 0 20px' }}>
              {ctaLine}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="#cta" style={{
                background: 'var(--blue)', color: 'var(--white)', padding: '12px 24px', borderRadius: 8,
                fontWeight: 600, fontSize: 14, display: 'inline-block',
              }}>Get a Demo</Link>
              <button style={{
                background: 'var(--white)', color: 'var(--heading)', border: '1px solid var(--border)',
                padding: '12px 24px', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>Watch Video ▶</button>
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection />
      <Footer />
    </>
  );
}
