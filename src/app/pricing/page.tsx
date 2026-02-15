'use client';

import Link from 'next/link';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Reveal from '@/components/Reveal';
import Footer from '@/components/Footer';

const plans = [
  {
    name: 'Free Trial',
    price: '$0',
    period: '14 days',
    desc: 'Try Hoponai with your team. No credit card required.',
    cta: 'Start Free Trial',
    ctaHref: '/sign-up',
    highlight: false,
    features: [
      'Up to 5 team members',
      '3 walkthroughs',
      'Sarah AI assistant',
      'Chrome extension',
      'Basic analytics',
      'Email support',
    ],
    missing: [
      'Custom branding',
      'SSO / SAML',
      'API access',
      'Dedicated CSM',
    ],
  },
  {
    name: 'Pro',
    price: '$12',
    period: 'per seat / month',
    desc: 'For teams ready to scale interactive training across the org.',
    cta: 'Get Started',
    ctaHref: '/sign-up',
    highlight: true,
    features: [
      'Unlimited team members',
      'Unlimited walkthroughs',
      'Sarah AI assistant',
      'Chrome extension',
      'Advanced analytics',
      'Priority email support',
      'Team management',
      'Custom branding',
      'Walkthrough templates',
      'Completion certificates',
    ],
    missing: [
      'SSO / SAML',
      'API access',
      'Dedicated CSM',
    ],
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'annual contract',
    desc: 'For organizations that need security, compliance, and scale.',
    cta: 'Contact Sales',
    ctaHref: '/contact-sales',
    highlight: false,
    features: [
      'Everything in Pro',
      'SSO / SAML authentication',
      'API access & webhooks',
      'Dedicated Customer Success Manager',
      'Custom integrations',
      'SLA guarantee (99.9% uptime)',
      'Audit logs & compliance reports',
      'Advanced role-based access control',
      'Onboarding & implementation support',
      'Volume pricing',
    ],
    missing: [],
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const proPrice = annual ? '$10' : '$12';
  const proSuffix = annual ? 'per seat / month, billed annually' : 'per seat / month';

  return (
    <>
      <Navbar />

      <section style={{ background: 'var(--bg)', padding: '140px 1.5rem 80px', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.3, backgroundImage: 'radial-gradient(var(--border) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
          <Reveal>
            <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 400, color: 'var(--heading)', margin: '0 0 12px', lineHeight: 1.15 }}>
              Simple, transparent pricing.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p style={{ fontSize: 17, color: 'var(--text)', margin: '0 auto 28px', maxWidth: 420 }}>
              Start free. Scale when you&apos;re ready. Every learner gets a personal AI trainer.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div style={{ display: 'inline-flex', background: 'var(--white)', borderRadius: 10, border: '1px solid var(--border)', padding: 4 }}>
              <button onClick={() => setAnnual(false)} style={{
                padding: '8px 20px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                background: !annual ? 'var(--blue)' : 'transparent', color: !annual ? '#fff' : 'var(--text)',
                fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.2s',
              }}>Monthly</button>
              <button onClick={() => setAnnual(true)} style={{
                padding: '8px 20px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                background: annual ? 'var(--blue)' : 'transparent', color: annual ? '#fff' : 'var(--text)',
                fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.2s',
              }}>Annual <span style={{ fontSize: 11, opacity: 0.8 }}>Save 17%</span></button>
            </div>
          </Reveal>
        </div>
      </section>

      <section style={{ background: 'var(--white)', padding: '0 1.5rem 80px', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1060, margin: '-40px auto 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {plans.map((plan, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div style={{
                background: 'var(--white)', borderRadius: 16, padding: '32px 24px',
                border: plan.highlight ? '2px solid var(--blue)' : '1px solid var(--border)',
                position: 'relative', height: '100%', display: 'flex', flexDirection: 'column',
                boxShadow: plan.highlight ? '0 8px 32px rgba(14,165,233,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                {plan.highlight && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--blue)', color: '#fff', padding: '4px 16px', borderRadius: 20,
                    fontSize: 12, fontWeight: 700,
                  }}>Most Popular</div>
                )}

                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--blue)', marginBottom: 4 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 44, color: 'var(--heading)' }}>
                    {plan.name === 'Pro' ? proPrice : plan.price}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8 }}>
                  {plan.name === 'Pro' ? proSuffix : plan.period}
                </div>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5, marginBottom: 24 }}>{plan.desc}</p>

                <Link href={plan.ctaHref} style={{
                  display: 'block', textAlign: 'center', padding: '12px 24px', borderRadius: 10,
                  fontWeight: 600, fontSize: 15, marginBottom: 24,
                  background: plan.highlight ? 'var(--blue)' : 'var(--bg)',
                  color: plan.highlight ? '#fff' : 'var(--heading)',
                  border: plan.highlight ? 'none' : '1px solid var(--border)',
                }}>{plan.cta}</Link>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: 'var(--text)' }}>
                      <span style={{ color: 'var(--blue)', fontSize: 15, flexShrink: 0, marginTop: 1 }}>✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                  {plan.missing.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 14, color: 'var(--muted)' }}>
                      <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>—</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ background: 'var(--bg)', padding: '80px 1.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <Reveal>
            <h2 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 30, color: 'var(--heading)', textAlign: 'center', margin: '0 0 40px' }}>
              Common questions
            </h2>
          </Reveal>
          {[
            { q: 'What counts as a seat?', a: 'Every person who completes a walkthrough (learner) requires a seat. Admins who only create walkthroughs are included free.' },
            { q: 'Can I switch plans later?', a: 'Yes. You can upgrade or downgrade at any time. Changes take effect on your next billing cycle.' },
            { q: 'What happens after the free trial?', a: 'After 14 days, you can choose a paid plan or your account pauses. No data is deleted for 30 days.' },
            { q: 'Do you offer volume discounts?', a: 'Yes. Organizations with 100+ seats qualify for volume pricing. Contact sales for a custom quote.' },
            { q: 'What payment methods do you accept?', a: 'We accept all major credit cards. Enterprise customers can pay via invoice with net-30 terms.' },
          ].map((faq, i) => (
            <Reveal key={i} delay={i * 0.05}>
              <div style={{ background: 'var(--white)', borderRadius: 12, padding: '20px 24px', border: '1px solid var(--border)', marginBottom: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--heading)', marginBottom: 6 }}>{faq.q}</div>
                <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{faq.a}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}
