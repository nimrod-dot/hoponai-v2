'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Reveal from '@/components/Reveal';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

const SarahInfographic = dynamic(() => import('@/components/SarahInfographic'), { ssr: false });

function LogoBar() {
  return (
    <section style={{ background: 'var(--white)', padding: '36px 1.5rem', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: 20 }}>
          Trusted by teams at
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 48, flexWrap: 'wrap' }}>
          {['Teva', 'Monday.com', 'Blocks.diy', 'Biolojic'].map((name) => (
            <span key={name} style={{
              fontSize: 17, fontWeight: 700, color: 'var(--heading)', opacity: 0.35,
              fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.3px',
            }}>{name}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

function VideoPlaceholder() {
  return (
    <section style={{ background: 'var(--bg)', padding: '80px 1.5rem', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <Reveal>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(26px, 4vw, 36px)', color: 'var(--heading)', textAlign: 'center', margin: '0 0 8px' }}>
            See Hoponai in action
          </h2>
          <p style={{ fontSize: 15, color: 'var(--muted)', textAlign: 'center', margin: '0 auto 32px', maxWidth: 480 }}>
            Watch how Sarah guides employees through real software, step by step.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          {/* VIDEO PLACEHOLDER - Replace with: <iframe src="https://www.youtube.com/embed/YOUR_ID" .../> */}
          <div id="demo-video" style={{
            position: 'relative', width: '100%', paddingBottom: '56.25%',
            borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)',
            background: '#0F172A', boxShadow: '0 12px 48px rgba(0,0,0,0.1)',
          }}>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16,
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'rgba(14,165,233,0.9)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 24px rgba(14,165,233,0.3)',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white"><polygon points="8,5 20,12 8,19" /></svg>
              </div>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Product demo coming soon</span>
            </div>
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

      {/* Hero */}
      <section style={{ background: 'var(--bg)', padding: '140px 1.5rem 80px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.3, backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto' }}>
          <Reveal>
            <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 20, background: 'var(--blue-bg)', border: '1px solid var(--blue-light)', marginBottom: 24 }}>
              <span style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600 }}>AI-Powered Interactive Training</span>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 400, color: 'var(--heading)', margin: '0 0 16px', lineHeight: 1.12 }}>
              The AI that knows how your company works.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{ fontSize: 'clamp(16px, 2.5vw, 19px)', color: 'var(--text)', margin: '0 auto 36px', maxWidth: 520, lineHeight: 1.6 }}>
              Interactive training that adapts to every employee. Onboard faster, train smarter, and keep your entire organization aligned.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/sign-up" style={{
                background: 'var(--blue)', color: 'var(--white)', padding: '14px 32px', borderRadius: 10,
                fontWeight: 600, fontSize: 16, display: 'inline-block',
              }}>Get Started</Link>
              <Link href="/contact-sales" style={{
                background: 'var(--white)', color: 'var(--heading)', border: '1px solid var(--border)',
                padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, display: 'inline-block',
              }}>Contact Sales</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <LogoBar />

      {/* Problem */}
      <section style={{ background: 'var(--white)', padding: '80px 1.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(26px, 4vw, 36px)', color: 'var(--heading)', textAlign: 'center', margin: '0 0 8px' }}>
              Your team is struggling. The data proves it.
            </h2>
            <p style={{ fontSize: 15, color: 'var(--muted)', textAlign: 'center', margin: '0 auto 40px', maxWidth: 500 }}>
              Traditional training - videos, PDFs, slide decks - doesn&apos;t work. Hoponai does.
            </p>
          </Reveal>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              { num: '85%', label: "of employees don't fully understand their SOPs", sub: 'Compliance risk hiding in plain sight.' },
              { num: '70%', label: 'of training content is forgotten within a week', sub: "Passive learning doesn't stick." },
              { num: '3-6 mo', label: 'average time for a new hire to reach full productivity', sub: "That's months of lost output." },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.1} style={{ flex: '1 1 260px', maxWidth: 300 }}>
                <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '28px 20px', textAlign: 'center', border: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 40, color: 'var(--blue)', marginBottom: 6 }}>{s.num}</div>
                  <div style={{ fontSize: 14, color: 'var(--heading)', marginBottom: 6, lineHeight: 1.4 }}>{s.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>{s.sub}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <VideoPlaceholder />

      {/* Sarah infographic */}
      <section style={{ background: 'var(--white)', padding: '80px 1.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(26px, 4vw, 36px)', color: 'var(--heading)', textAlign: 'center', margin: '0 0 8px' }}>
              Meet Sarah, your AI training guide.
            </h2>
            <p style={{ fontSize: 15, color: 'var(--muted)', textAlign: 'center', margin: '0 auto 40px', maxWidth: 520 }}>
              Sarah lives inside your software and walks every employee through tasks in real-time.
            </p>
          </Reveal>
          <Reveal delay={0.15}><SarahInfographic /></Reveal>
        </div>
      </section>

      {/* Capabilities */}
      <section style={{ background: 'var(--bg)', padding: '80px 1.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(26px, 4vw, 36px)', color: 'var(--heading)', textAlign: 'center', margin: '0 0 40px' }}>
              AI that teaches by doing. Not by showing.
            </h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { icon: '🧠', title: 'Learns your company', desc: 'Ingests your documentation, workflows, and processes. Understands how YOUR org operates.' },
              { icon: '💬', title: 'Converses naturally', desc: 'Real-time voice and video. Employees ask questions and work through tasks conversationally.' },
              { icon: '🖥️', title: 'Demonstrates live', desc: 'Navigates your actual software in real-time, showing each step in context.' },
              { icon: '⚡', title: 'Works alongside employees', desc: 'Clicks, fills forms, and operates software WITH your people. Hands-on learning.' },
            ].map((c, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div style={{ background: 'var(--white)', borderRadius: 12, padding: '24px 20px', border: '1px solid var(--border)', height: '100%' }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{c.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--heading)', marginBottom: 6 }}>{c.title}</div>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{c.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section style={{ background: 'var(--white)', padding: '80px 1.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(26px, 4vw, 36px)', color: 'var(--heading)', textAlign: 'center', margin: '0 0 40px' }}>
              One platform. Every training need.
            </h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { href: '/solutions/onboarding', icon: '🚀', title: 'Employee Onboarding', desc: 'Get every new hire productive from day one.' },
              { href: '/solutions/training', icon: '📈', title: 'Continuous Training', desc: 'Retrain your entire organization in days, not months.' },
              { href: '/solutions/customers', icon: '🤝', title: 'Customer Training', desc: 'Onboard and educate customers interactively.' },
              { href: '/solutions/sops', icon: '📋', title: 'SOPs & Compliance', desc: 'Verify understanding. Track completion. Audit-ready.' },
            ].map((s, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <Link href={s.href} style={{ display: 'block', height: '100%' }}>
                  <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '24px 20px', border: '1px solid var(--border)', height: '100%' }}>
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

      {/* Credibility */}
      <section style={{ background: 'var(--bg)', padding: '72px 1.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(24px, 3.5vw, 30px)', color: 'var(--heading)', margin: '0 0 16px' }}>
              Built by people who lived the problem.
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.7, margin: '0 0 24px' }}>
              25 years of managing projects across enterprise, pharma, biotech, and tech companies taught us one thing: training is broken everywhere, the same way, for the same reasons. Hoponai exists to fix it.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['Real-time AI', 'Voice & video', 'Live screen sharing', 'Company-specific knowledge'].map((f) => (
                <div key={f} style={{ padding: '6px 14px', borderRadius: 20, background: 'var(--blue-bg)', border: '1px solid var(--blue-light)', fontSize: 13, color: 'var(--blue)', fontWeight: 500 }}>{f}</div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <CTASection />
      <Footer />
    </>
  );
}
