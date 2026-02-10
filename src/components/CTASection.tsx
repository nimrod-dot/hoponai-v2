'use client';

import { useState } from 'react';
import Reveal from './Reveal';

export default function CTASection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!email) return;
    // TODO: Connect to Supabase
    setSubmitted(true);
  };

  return (
    <section id="cta" style={{ background: 'var(--bg)', padding: '72px 2rem 88px', borderTop: '1px solid var(--border)' }}>
      <div style={{
        maxWidth: 600, margin: '0 auto', background: 'var(--white)', borderRadius: 16,
        padding: '44px 36px', textAlign: 'center', border: '1px solid var(--border)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.04)',
      }}>
        <Reveal>
          <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: 'var(--heading)', margin: '0 0 8px' }}>
            See Hoponai in action
          </h2>
          <p style={{ fontSize: 14, color: 'var(--muted)', margin: '0 0 24px' }}>
            Get a personalized demo for your organization. Limited early access spots available.
          </p>
          {!submitted ? (
            <div style={{ display: 'flex', gap: 8, maxWidth: 420, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="your@company.com"
                style={{
                  flex: '1 1 240px', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border)',
                  background: 'var(--bg)', color: 'var(--heading)', fontSize: 14,
                  fontFamily: "'Plus Jakarta Sans', sans-serif", outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--blue)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
              />
              <button onClick={handleSubmit} style={{
                background: 'var(--blue)', color: 'var(--white)', border: 'none', padding: '12px 24px',
                borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.background = 'var(--blue-dark)')}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.background = 'var(--blue)')}
              >Get a Demo</button>
            </div>
          ) : (
            <div style={{ fontSize: 15, color: 'var(--blue)', fontWeight: 600 }}>✓ We'll be in touch shortly.</div>
          )}
        </Reveal>
      </div>
    </section>
  );
}
