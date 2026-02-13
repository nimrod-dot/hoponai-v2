'use client';

import Link from 'next/link';
import Reveal from './Reveal';

export default function CTASection() {
  return (
    <section id="cta" style={{ background: 'var(--bg)', padding: '72px 2rem 88px', borderTop: '1px solid var(--border)' }}>
      <div style={{
        maxWidth: 600, margin: '0 auto', background: 'var(--white)', borderRadius: 16,
        padding: '44px 36px', textAlign: 'center', border: '1px solid var(--border)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
      }}>
        <Reveal>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: 'var(--heading)', margin: '0 0 8px' }}>
            Ready to transform how your team learns?
          </h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', margin: '0 0 28px' }}>
            Start for free with up to 5 team members. No credit card required.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/sign-up" style={{
              background: 'var(--blue)', color: 'var(--white)', border: 'none', padding: '14px 32px',
              borderRadius: 10, fontWeight: 600, fontSize: 16, display: 'inline-block',
              fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.2s',
              boxShadow: '0 2px 8px rgba(14,165,233,0.2)',
            }}>
              Get Started - Free
            </Link>
            <Link href="/contact-sales" style={{
              background: 'var(--white)', color: 'var(--heading)', border: '1px solid var(--border)',
              padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16,
              display: 'inline-block', fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'all 0.2s', textDecoration: 'none',
            }}>
              Contact Sales
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}