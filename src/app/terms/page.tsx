import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = { title: 'Terms of Service - Hoponai', description: 'Terms and conditions for using Hoponai.' };

export default function TermsPage() {
  const s = { fontSize: 14, color: 'var(--text)', lineHeight: 1.7, margin: '0 0 16px' };
  const h = { fontSize: 18, fontWeight: 700 as const, color: 'var(--heading)', margin: '32px 0 12px' };

  return (
    <>
      <Navbar />
      <section style={{ background: 'var(--bg)', padding: '140px 1.5rem 80px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 40, color: 'var(--heading)', margin: '0 0 8px' }}>Terms of Service</h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 32 }}>Last updated: February 15, 2026</p>

          <p style={s}>By using Hoponai, you agree to these terms. If you&apos;re using Hoponai on behalf of an organization, you represent that you have authority to bind that organization.</p>

          <h3 style={h}>Service Description</h3>
          <p style={s}>Hoponai provides an AI-powered interactive training platform, including a web dashboard, Chrome extension, and AI assistant (&quot;Sarah&quot;), that enables organizations to create and deliver guided software walkthroughs to their employees and customers.</p>

          <h3 style={h}>Accounts & Access</h3>
          <p style={s}>You are responsible for maintaining the security of your account credentials. Each seat/license is for a single user and may not be shared. You must be 18 or older to use the service.</p>

          <h3 style={h}>Acceptable Use</h3>
          <p style={s}>You may not use Hoponai to: violate any laws, infringe on intellectual property, distribute malware, attempt to gain unauthorized access to our systems, or use the service to create training content that is harmful, discriminatory, or misleading.</p>

          <h3 style={h}>Your Content</h3>
          <p style={s}>You retain ownership of all content you upload or create through Hoponai (walkthroughs, documentation, recordings). We do not claim ownership of your content. We use your content solely to provide the service to your organization.</p>

          <h3 style={h}>Payment & Billing</h3>
          <p style={s}>Paid plans are billed monthly or annually as selected. Prices are in USD. You may cancel at any time; access continues until the end of the current billing period. Refunds are not provided for partial billing periods.</p>

          <h3 style={h}>Service Availability</h3>
          <p style={s}>We target 99.9% uptime for paid plans. Enterprise customers receive SLA guarantees as specified in their contract. We do not guarantee uninterrupted service and are not liable for downtime.</p>

          <h3 style={h}>Limitation of Liability</h3>
          <p style={s}>Hoponai is provided &quot;as is&quot;. Our liability is limited to the amount you have paid us in the 12 months preceding any claim. We are not liable for indirect, incidental, or consequential damages.</p>

          <h3 style={h}>Termination</h3>
          <p style={s}>Either party may terminate at any time. Upon termination, we will retain your data for 30 days to allow export. After 30 days, all data is permanently deleted.</p>

          <h3 style={h}>Contact</h3>
          <p style={s}>Questions about these terms? Contact <a href="mailto:contact@hoponai.com" style={{ color: 'var(--blue)' }}>contact@hoponai.com</a>.</p>
        </div>
      </section>
      <Footer />
    </>
  );
}
