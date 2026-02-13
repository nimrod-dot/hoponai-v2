'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactSalesPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    companySize: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contact-sales', {
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
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
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
              {/* Name */}
              <div>
                <label style={{
                  display: 'block', fontSize: 14, fontWeight: 600,
                  color: 'var(--heading)', marginBottom: 6,
                }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: '1px solid var(--border)', fontSize: 14,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                  placeholder="John Doe"
                />
              </div>

              {/* Email */}
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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: '1px solid var(--border)', fontSize: 14,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                  placeholder="john@company.com"
                />
              </div>

              {/* Company */}
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
                  Company Size *
                </label>
                <select
                  required
                  value={formData.companySize}
                  onChange={(e) => setFormData({ ...formData, companySize: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: '1px solid var(--border)', fontSize: 14,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    background: 'var(--white)',
                  }}
                >
                  <option value="">Select company size</option>
                  <option value="1-50">1-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-1000">201-1,000 employees</option>
                  <option value="1000+">1,000+ employees</option>
                </select>
              </div>

              {/* Phone */}
              <div>
                <label style={{
                  display: 'block', fontSize: 14, fontWeight: 600,
                  color: 'var(--heading)', marginBottom: 6,
                }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: '1px solid var(--border)', fontSize: 14,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                  placeholder="+1 (555) 123-4567"
                />
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
                  rows={4}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 8,
                    border: '1px solid var(--border)', fontSize: 14,
                    fontFamily: "'Plus Jakarta Sans', sans-serif", resize: 'vertical',
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
                {loading ? 'Sending...' : 'Request Demo'}
              </button>
            </div>
          </form>

          {/* Trust badges */}
          <div style={{
            marginTop: 32, padding: 24, background: 'var(--white)',
            borderRadius: 12, border: '1px solid var(--border)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12 }}>
              Trusted by enterprise teams at
            </div>
            <div style={{ fontSize: 14, color: 'var(--heading)', fontWeight: 600 }}>
              Companies with 200+ employees
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}