'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Reveal from '@/components/Reveal';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

function Hero() {
  return (
    <section style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: '120px 2rem 80px', position: 'relative',
    }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.3, backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 760, margin: '0 auto' }}>
        <Reveal>
          <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 20, background: 'var(--blue-bg)', border: '1px solid var(--blue-light)', marginBottom: 24 }}>
            <span style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600 }}>AI-Powered Interactive Training</span>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h1 style={{
            fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 56, fontWeight: 400,
            color: 'var(--heading)', margin: '0 0 16px', lineHeight: 1.12,
          }}>
            The AI that knows how<br />your company works.
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p style={{ fontSize: 19, color: 'var(--text)', margin: '0 auto 36px', maxWidth: 520, lineHeight: 1.6 }}>
            Interactive training that adapts to every employee. Onboard faster, train smarter, and keep your entire organization aligned.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="#cta" style={{
              background: 'var(--blue)', color: 'var(--white)', padding: '14px 32px', borderRadius: 10,
              fontWeight: 600, fontSize: 16, display: 'inline-block', boxShadow: '0 2px 8px rgba(14,165,233,0.2)',
              transition: 'all 0.2s',
            }}>Get a Demo</Link>
            <button style={{
              background: 'var(--white)', color: 'var(--heading)', border: '1px solid var(--border)',
              padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.color = 'var(--blue)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--heading)'; }}
            >Watch Video ▶</button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <section style={{ background: 'var(--white)', padding: '88px 2rem', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <Reveal>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 38, color: 'var(--heading)', textAlign: 'center', margin: '0 0 8px' }}>
            Corporate training hasn't changed in 20 years.
          </h2>
          <p style={{ fontSize: 15, color: 'var(--muted)', textAlign: 'center', margin: '0 0 44px', maxWidth: 560, marginLeft: 'auto', marginRight: 'auto' }}>
            Videos, PDFs, tooltips, and slide decks. None of them actually teach. Hoponai does.
          </p>
        </Reveal>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { num: '$444B', label: 'Global training spend — growing every year', sub: 'Yet outcomes haven\'t improved.' },
            { num: '70%', label: 'of training content forgotten in one week', sub: 'Passive learning doesn\'t stick.' },
            { num: '52%', label: 'of employees say onboarding is just busywork', sub: 'They need hands-on guidance.' },
          ].map((s, i) => (
            <Reveal key={i} delay={i * 0.12} style={{ flex: '1 1 260px', maxWidth: 300 }}>
              <div style={{
                background: 'var(--bg)', borderRadius: 12, padding: '28px 20px', textAlign: 'center',
                border: '1px solid var(--border)', transition: 'all 0.3s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}
              >
                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 40, color: 'var(--blue)', marginBottom: 6 }}>{s.num}</div>
                <div style={{ fontSize: 14, color: 'var(--heading)', marginBottom: 6, lineHeight: 1.4 }}>{s.label}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>{s.sub}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhatWeDoSection() {
  const caps = [
    { icon: '🧠', title: 'Learns your company', desc: 'Hoponai ingests your documentation, workflows, and processes. It understands how YOUR org operates — not generic instructions.' },
    { icon: '💬', title: 'Converses naturally', desc: 'Employees interact via real-time voice and video. They ask questions, get explanations, and work through tasks conversationally.' },
    { icon: '🖥️', title: 'Demonstrates live', desc: 'Hoponai navigates your actual software in real-time, showing each step in context — not a pre-recorded video.' },
    { icon: '⚡', title: 'Works alongside employees', desc: 'It clicks, fills forms, and operates software WITH your people. Hands-on guided learning, not passive watching.' },
  ];

  return (
    <section style={{ background: 'var(--bg)', padding: '88px 2rem' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <Reveal>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 38, color: 'var(--heading)', textAlign: 'center', margin: '0 0 8px' }}>
            AI that teaches by doing. Not by showing.
          </h2>
          <p style={{ fontSize: 15, color: 'var(--muted)', textAlign: 'center', margin: '0 0 44px' }}>
            The first AI training platform that actually works alongside your employees.
          </p>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {caps.map((c, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div style={{
                background: 'var(--white)', borderRadius: 12, padding: '24px 20px',
                border: '1px solid var(--border)', transition: 'all 0.3s', height: '100%',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px var(--blue-glow)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--heading)', marginBottom: 6 }}>{c.title}</div>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Solutions() {
  const solutions = [
    { href: '/solutions/onboarding', title: 'Employee Onboarding', desc: 'Get every new hire productive from day one. No more 3-week ramp-ups, forgotten logins, or IT tickets.', icon: '🚀', color: 'var(--blue)' },
    { href: '/solutions/training', title: 'Continuous Training', desc: 'New system rollout? Policy change? Retrain your entire organization in days, not months.', icon: '📈', color: 'var(--indigo)' },
    { href: '/solutions/customers', title: 'Customer Training', desc: 'Your customers struggle with your product too. Onboard and educate them interactively.', icon: '🤝', color: 'var(--emerald)' },
    { href: '/solutions/sops', title: 'SOPs & Compliance', desc: 'Walk employees through every required procedure step by step. Verify understanding. Track completion.', icon: '📋', color: 'var(--amber)' },
  ];

  return (
    <section style={{ background: 'var(--white)', padding: '88px 2rem', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <Reveal>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 38, color: 'var(--heading)', textAlign: 'center', margin: '0 0 8px' }}>
            One platform. Every training need.
          </h2>
          <p style={{ fontSize: 15, color: 'var(--muted)', textAlign: 'center', margin: '0 0 44px' }}>
            From day-one onboarding to ongoing compliance — Hoponai adapts.
          </p>
        </Reveal>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {solutions.map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <Link href={s.href} style={{ display: 'block', height: '100%' }}>
                <div style={{
                  background: 'var(--bg)', borderRadius: 12, padding: '24px 20px',
                  border: '1px solid var(--border)', transition: 'all 0.3s', height: '100%',
                  cursor: 'pointer',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 20px var(--blue-glow)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                >
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--heading)', marginBottom: 6 }}>{s.title}</div>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: '0 0 12px' }}>{s.desc}</p>
                  <span style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600 }}>Learn more →</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Credibility() {
  return (
    <section style={{ background: 'var(--bg)', padding: '80px 2rem' }}>
      <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <Reveal>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: 'var(--heading)', margin: '0 0 16px' }}>
            Built by people who lived the problem.
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.7, margin: '0 0 24px' }}>
            25 years of managing projects across enterprise, pharma, biotech, and tech companies taught us one thing: training is broken everywhere, the same way, for the same reasons. Hoponai exists to fix it.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Real-time AI', 'Voice & video', 'Live screen sharing', 'Company-specific knowledge'].map((feat) => (
              <div key={feat} style={{
                padding: '6px 14px', borderRadius: 20, background: 'var(--blue-bg)',
                border: '1px solid var(--blue-light)', fontSize: 13, color: 'var(--blue)', fontWeight: 500,
              }}>{feat}</div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <Problem />
      <WhatWeDoSection />
      <Solutions />
      <Credibility />
      <CTASection />
      <Footer />
    </>
  );
}
