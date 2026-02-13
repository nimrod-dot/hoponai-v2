'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PLANS = [
  {
    name: 'Trial',
    price: '$0',
    period: '14 days',
    description: 'Try the full platform risk-free',
    features: [
      'Full feature access',
      'Up to 5 users',
      '2 walkthroughs',
      '5 AI training runs',
      'Basic analytics',
      'Community support',
    ],
    cta: 'Start Free Trial',
    href: '/sign-up',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: 'per seat/month',
    description: 'For growing teams that need AI-powered training',
    features: [
      'Up to 100 users',
      'Unlimited walkthroughs',
      '100 AI training runs/month',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
      'SSO/SAML (add-on)',
    ],
    cta: 'Start Pro Trial',
    href: '/sign-up?plan=pro',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact sales',
    description: 'For organizations that need dedicated support',
    features: [
      'Unlimited users',
      'Unlimited walkthroughs',
      'Unlimited AI training runs',
      'Custom analytics & reporting',
      'Dedicated customer success manager',
      'White-label branding',
      'SSO/SAML included',
      'Custom integrations',
      'SLA guarantee',
    ],
    cta: 'Contact Sales',
    href: '/contact-sales',
    highlight: false,
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      <Navbar />
      
      <section style={{
        minHeight: '100vh', background: 'var(--bg)', padding: '140px 2rem 80px',
      }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h1 style={{
              fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 48,
              color: 'var(--heading)', marginBottom: 12, fontWeight: 400,
            }}>
              Simple, transparent pricing
            </h1>
            <p style={{ fontSize: 18, color: 'var(--text)', marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
              Start with a free trial. Scale as you grow. Enterprise-ready from day one.
            </p>

            {/* Billing toggle */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 12,
              padding: 4, background: 'var(--white)', borderRadius: 8,
              border: '1px solid var(--border)',
            }}>
              <button
                onClick={() => setAnnual(false)}
                style={{
                  padding: '8px 20px', borderRadius: 6, border: 'none',
                  background: !annual ? 'var(--blue)' : 'transparent',
                  color: !annual ? 'var(--white)' : 'var(--text)',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s', fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setAnnual(true)}
                style={{
                  padding: '8px 20px', borderRadius: 6, border: 'none',
                  background: annual ? 'var(--blue)' : 'transparent',
                  color: annual ? 'var(--white)' : 'var(--text)',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s', fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Annual <span style={{ fontSize: 12, opacity: 0.8 }}>(save 20%)</span>
              </button>
            </div>
          </div>

          {/* Plans */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 24,
            marginBottom: 64,
          }}>
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                style={{
                  background: 'var(--white)',
                  border: plan.highlight ? '2px solid var(--blue)' : '1px solid var(--border)',
                  borderRadius: 16,
                  padding: 32,
                  position: 'relative',
                  transition: 'all 0.3s',
                  boxShadow: plan.highlight ? '0 8px 32px rgba(14,165,233,0.15)' : 'none',
                }}
              >
                {plan.highlight && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--blue)', color: 'var(--white)',
                    padding: '4px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                  }}>
                    Most Popular
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <h3 style={{
                    fontSize: 20, fontWeight: 700, color: 'var(--heading)',
                    marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>
                    {plan.name}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 16 }}>
                    {plan.description}
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 40, fontWeight: 700, color: 'var(--heading)',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}>
                      {plan.price === '$0' || plan.price === 'Custom' ? plan.price : 
                        annual && plan.price !== 'Custom' ? 
                        `$${Math.round(parseInt(plan.price.slice(1)) * 0.8)}` : 
                        plan.price}
                    </span>
                    {plan.period && (
                      <span style={{ fontSize: 14, color: 'var(--muted)' }}>
                        /{plan.period}
                      </span>
                    )}
                  </div>
                </div>

                <ul style={{
                  listStyle: 'none', padding: 0, margin: '0 0 28px',
                  display: 'flex', flexDirection: 'column', gap: 12,
                }}>
                  {plan.features.map((feature) => (
                    <li key={feature} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: 2 }}>
                        <circle cx="10" cy="10" r="10" fill="rgba(14,165,233,0.1)" />
                        <path d="M6 10L9 13L14 7" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span style={{ fontSize: 14, color: 'var(--text)' }}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  style={{
                    display: 'block', width: '100%', textAlign: 'center',
                    padding: '12px 24px', borderRadius: 8,
                    background: plan.highlight ? 'var(--blue)' : 'var(--white)',
                    color: plan.highlight ? 'var(--white)' : 'var(--blue)',
                    border: plan.highlight ? 'none' : '2px solid var(--blue)',
                    fontSize: 15, fontWeight: 600, textDecoration: 'none',
                    transition: 'all 0.2s', fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                  onMouseEnter={(e) => {
                    if (plan.highlight) {
                      (e.target as HTMLElement).style.background = 'var(--blue-dark)';
                    } else {
                      (e.target as HTMLElement).style.background = 'var(--blue)';
                      (e.target as HTMLElement).style.color = 'var(--white)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (plan.highlight) {
                      (e.target as HTMLElement).style.background = 'var(--blue)';
                    } else {
                      (e.target as HTMLElement).style.background = 'var(--white)';
                      (e.target as HTMLElement).style.color = 'var(--blue)';
                    }
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div style={{ maxWidth: 720, margin: '0 auto', paddingTop: 40, borderTop: '1px solid var(--border)' }}>
            <h2 style={{
              fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 32,
              color: 'var(--heading)', textAlign: 'center', marginBottom: 32,
            }}>
              Frequently asked questions
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {[
                {
                  q: 'What happens after my trial ends?',
                  a: 'After 14 days, you\'ll need to select a paid plan to continue. Your data is preserved for 30 days if you need more time to decide.',
                },
                {
                  q: 'Can I change plans later?',
                  a: 'Yes. Upgrade or downgrade anytime. Changes take effect immediately, with prorated billing.',
                },
                {
                  q: 'What counts as an AI training run?',
                  a: 'Each time an employee completes an interactive AI-guided training session. Paused or incomplete sessions don\'t count.',
                },
                {
                  q: 'Do you offer discounts for nonprofits or education?',
                  a: 'Yes. Contact sales for custom pricing for qualified organizations.',
                },
                {
                  q: 'What if I need more than 100 AI runs per month on Pro?',
                  a: 'Upgrade to Enterprise for unlimited runs, or purchase additional run packs at $0.10/run.',
                },
              ].map((faq, i) => (
                <div key={i} style={{
                  padding: 20, background: 'var(--white)', borderRadius: 12,
                  border: '1px solid var(--border)',
                }}>
                  <h3 style={{
                    fontSize: 16, fontWeight: 600, color: 'var(--heading)',
                    marginBottom: 8, fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>
                    {faq.q}
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}