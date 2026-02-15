import Navbar from '@/components/Navbar';
import Reveal from '@/components/Reveal';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

export const metadata = { title: 'About - Hoponai', description: 'The team and mission behind Hoponai.' };

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section style={{ background: 'var(--bg)', padding: '140px 1.5rem 80px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.3, backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
          <Reveal>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 400, color: 'var(--heading)', margin: '0 0 16px', lineHeight: 1.15 }}>
              We built Hoponai because we lived the problem.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p style={{ fontSize: 18, color: 'var(--text)', margin: '0 auto', maxWidth: 560, lineHeight: 1.7 }}>
              25 years across enterprise, pharma, biotech, and tech taught us one thing: every company trains the same broken way. Static docs, outdated videos, and sink-or-swim onboarding. We decided to fix it.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Mission */}
      <section style={{ background: 'var(--white)', padding: '80px 1.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(26px, 4vw, 34px)', color: 'var(--heading)', margin: '0 0 20px' }}>
              Our mission
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text)', lineHeight: 1.7, margin: '0 0 16px' }}>
              Every employee deserves a patient, knowledgeable guide who walks them through their tools and processes - not a PDF they&apos;ll never read. Hoponai is that guide.
            </p>
            <p style={{ fontSize: 16, color: 'var(--text)', lineHeight: 1.7 }}>
              We&apos;re building the first AI training platform that works alongside employees in their actual software - demonstrating, explaining, and verifying understanding in real-time. Not another LMS. Not another screen recorder. A fundamentally new approach to how organizations transfer knowledge.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Team */}
      <section style={{ background: 'var(--bg)', padding: '80px 1.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(26px, 4vw, 34px)', color: 'var(--heading)', margin: '0 0 32px' }}>
              The team
            </h2>
          </Reveal>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Reveal delay={0.1}>
              <div style={{ background: 'var(--white)', borderRadius: 12, padding: '28px 24px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--heading)', marginBottom: 4 }}>Nimrod - Founder & CEO</div>
                <div style={{ fontSize: 13, color: 'var(--blue)', marginBottom: 12 }}>Product, Strategy & Growth</div>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>
                  25 years leading projects across Teva, biotech, and enterprise tech. Managed training rollouts for organizations with thousands of employees and saw firsthand how broken the process is. Built Hoponai to solve the problem he spent decades working around.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div style={{ background: 'var(--white)', borderRadius: 12, padding: '28px 24px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--heading)', marginBottom: 4 }}>Arik - Co-Founder & CTO</div>
                <div style={{ fontSize: 13, color: 'var(--blue)', marginBottom: 12 }}>Engineering & Architecture</div>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>
                  Full-stack engineer specializing in browser extensions, real-time AI systems, and Chrome-based automation. Building the core engine that powers Sarah&apos;s ability to navigate and guide users through any web application.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ background: 'var(--white)', padding: '80px 1.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(26px, 4vw, 34px)', color: 'var(--heading)', margin: '0 0 32px' }}>
              What we believe
            </h2>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { title: 'Learning by doing beats learning by watching', desc: 'People retain 10% of what they read and 90% of what they practice. We built the product around this.' },
              { title: 'AI should amplify people, not replace them', desc: 'Sarah doesn\'t replace your L&D team. She makes them 100x more effective by delivering their expertise at scale.' },
              { title: 'Your data is yours', desc: 'We never train on your company data. We never share it. Period.' },
              { title: 'Enterprise-grade from day one', desc: 'Security, compliance, and reliability aren\'t afterthoughts. They\'re built into the foundation.' },
            ].map((v, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div style={{ padding: '20px 0', borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--heading)', marginBottom: 6 }}>{v.title}</div>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </>
  );
}
