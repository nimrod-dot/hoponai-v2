import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = { title: 'Privacy Policy - Hoponai', description: 'How Hoponai collects, uses, and protects your data.' };

export default function PrivacyPage() {
  const s = { fontSize: 14, color: 'var(--text)', lineHeight: 1.7, margin: '0 0 16px' };
  const h = { fontSize: 18, fontWeight: 700 as const, color: 'var(--heading)', margin: '32px 0 12px' };

  return (
    <>
      <Navbar />
      <section style={{ background: 'var(--bg)', padding: '140px 1.5rem 80px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 40, color: 'var(--heading)', margin: '0 0 8px' }}>Privacy Policy</h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>Last updated: February 15, 2026</p>

          <p style={s}>Hoponai (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is committed to protecting your privacy. This policy explains how we collect, use, and protect information when you use our platform.</p>

          <h3 style={h}>Information We Collect</h3>
          <p style={s}>Account information (name, email, company), usage data (walkthrough completions, feature usage), and technical data (browser type, device info) necessary to provide and improve the service.</p>

          <h3 style={h}>How We Use Your Information</h3>
          <p style={s}>To provide and maintain the service, authenticate users, send transactional communications, analyze usage patterns to improve the product, and comply with legal obligations. We never sell your personal information.</p>

          <h3 style={h}>Data Storage & Security</h3>
          <p style={s}>Your data is stored on SOC 2 certified infrastructure (Supabase/AWS). All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We implement role-based access controls and regular security audits.</p>

          <h3 style={h}>Third-Party Services</h3>
          <p style={s}>We use Clerk (authentication), Supabase (database), Vercel (hosting), and Stripe (payments). Each is SOC 2 certified. We do not share your data with any other third parties.</p>

          <h3 style={h}>Your Rights</h3>
          <p style={s}>You may request access, correction, or deletion of your personal data at any time by contacting contact@hoponai.com. For EU users, we comply with GDPR data subject rights.</p>

          <h3 style={h}>Data Retention</h3>
          <p style={s}>We retain your data for the duration of your account. Upon account deletion or contract termination, all data is deleted within 30 days. Backup copies are purged within 90 days.</p>

          <h3 style={h}>AI & Your Company Data</h3>
          <p style={s}>Hoponai processes your company&apos;s documentation and workflows to provide AI-guided training. We never use your company data to train our AI models. Your data is isolated to your organization and never shared across tenants.</p>

          <h3 style={h}>Contact</h3>
          <p style={s}>For privacy questions, contact us at <a href="mailto:contact@hoponai.com" style={{ color: 'var(--blue)' }}>contact@hoponai.com</a>.</p>
        </div>
      </section>
      <Footer />
    </>
  );
}
