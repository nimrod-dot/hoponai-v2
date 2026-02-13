'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const BLOCKED_DOMAINS = [
  'gmail.com', 'yahoo.com', 'yahoo.co.il', 'hotmail.com', 'outlook.com',
  'aol.com', 'icloud.com', 'mail.com', 'protonmail.com', 'proton.me',
  'zoho.com', 'yandex.com', 'gmx.com', 'live.com', 'me.com',
  'msn.com', 'inbox.com', 'walla.co.il', 'walla.com',
];

function isBusinessEmail(email: string): boolean {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return false;
  return !BLOCKED_DOMAINS.includes(domain);
}

export default function ContactSalesPage() {
  const [formData, setFormData] = useState({
    email: '',
    company: '',
    companySize: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleEmailChange = (value: string) => {
    setFormData({ ...formData, email: value });
    if (emailError) setEmailError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isBusinessEmail(formData.email)) {
      setEmailError('Please use your work email (no personal email addresses like Gmail or Yahoo).');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/sales-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Contact sales error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Navbar />
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: 'var(--bg)', padding: '120px 2rem',
        }}>
          <div style={{
            textAlign: 'center', maxWidth: 500,
            background: 'var(--white)', padding: 48, borderRadius: 16,
            border: '1px solid var(--border)',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(14,165,233,0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M9 16L14 21L23 11" stroke="var(--blue)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 28, color: 'var(--heading)', marginBottom: 12,
            }}>
              Thanks for reaching out!
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.7 }}>
              Our sales team will contact you within 24 hours to discuss your needs and set up a personalized demo.
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <section style={{
        minHeight: '100vh', background: 'var(--bg)', padding: '140px 2rem 80px',
      }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{
              fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 40,
              color: 'var(--heading)', marginBottom: 12, fontWeight: 400,
            }}>
              Talk to our sales team
            </h1>
            <p style={{ fontSize: 16, color: 'var(--text)', lineHeight: 1.6 }}>
              Get a personalized demo and learn how Hoponai can transform training at your organization.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              background: 'var(--white)', padding: 40, borderRadius: 16,
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Work Email */}
              <div>
                <label style={{
                  display: 'block', fontSize: 14, fontWeight: 600,
                  color: 'var(--heading)', marginBottom: 6,
                }}>
                  Work Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: `1px solid ${emailError ? '#ef4444' : 'var(--border)'}`, fontSize: 14,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    boxSizing: 'border-box',
                  }}
                  placeholder="you@company.com"
                />
                {emailError && (
                  <p style={{ fontSize: 13, color: '#ef4444', margin: '6px 0 0', lineHeight: 1.4 }}>
                    {emailError}
                  </p>
                )}
              </div>

              {/* Company Name */}
              <div>
                <label style={{
                  display: 'block', fontSize: 14, fontWeight: 600,
                  color: 'var(--heading)', marginBottom: 6,
                }}>
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: '1px solid var(--border)', fontSize: 14,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    boxSizing: 'border-box',
                  }}
                  placeholder="Acme Corp"
                />
              </div>

              {/* Company Size */}
              <div>
                <label style={{
                  display: 'block', fontSize: 14, fontWeight: 600,
                  color: 'var(--heading)', marginBottom: 6,
                }}>
                  Company Size
                </label>
                <select
                  value={formData.companySize}
                  onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: '1px solid var(--border)', fontSize: 14,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    background: 'var(--white)',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">Select company size</option>
                  <option value="1-50">1-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-1000">201-1,000 employees</option>
                  <option value="1000+">1,000+ employees</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label style={{
                  display: 'block', fontSize: 14, fontWeight: 600,
                  color: 'var(--heading)', marginBottom: 6,
                }}>
                  What are you looking to solve?
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: '1px solid var(--border)', fontSize: 14,
                    fontFamily: "'Plus Jakarta Sans', sans-serif", resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                  placeholder="Tell us about your training challenges..."
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '14px 32px', borderRadius: 8, border: 'none',
                  background: 'var(--blue)', color: 'var(--white)',
                  fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'all 0.2s', marginTop: 8,
                }}
              >
                {loading ? 'Sending...' : 'Get in Touch'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
}