import SolutionPage from '@/components/SolutionPage';

export const metadata = { title: 'Customer Training — Hoponai', description: 'Onboard and educate your customers interactively with AI.' };

export default function CustomersPage() {
  return (
    <SolutionPage
      badge="Customer Training"
      headline="Your customers struggle with your product too."
      subline="If your employees need interactive training on complex software, so do your customers. Hoponai onboards and educates them the same way — hands-on, patient, and personalized."
      painSummary="Poor customer onboarding kills retention."
      pains={[
        { stat: '67%', label: 'of customer churn is due to poor onboarding and adoption' },
        { stat: '86%', label: 'of customers say they\'d stay loyal if onboarding is excellent' },
        { stat: '5-25x', label: 'It costs 5-25x more to acquire a new customer than keep one' },
      ]}
      features={[
        { icon: '🤝', title: 'Interactive product walkthroughs', desc: 'Hoponai guides your customers through your product step-by-step, answering questions and demonstrating features in real-time.' },
        { icon: '🌍', title: 'Scales to every customer', desc: 'Whether you have 100 or 100,000 customers, Hoponai provides the same quality of personalized guidance to each one.' },
        { icon: '⏰', title: 'Available 24/7', desc: 'Customers don\'t wait for business hours. Hoponai is always available to help them learn your product.' },
        { icon: '📉', title: 'Reduce support tickets', desc: 'When customers actually understand your product, support volume drops. Train once, answer fewer tickets forever.' },
      ]}
      howTitle="How customer training works"
      howSteps={[
        { num: '01', title: 'Integrate your product', desc: 'Hoponai learns your product\'s interface, features, and common customer workflows.' },
        { num: '02', title: 'Customer signs up', desc: 'New customer starts an interactive session with Hoponai. They\'re guided through setup, key features, and best practices.' },
        { num: '03', title: 'Higher adoption, lower churn', desc: 'Customers who truly understand your product stay longer, expand faster, and create fewer support tickets.' },
      ]}
      ctaLine="What if every customer had a dedicated product expert?"
    />
  );
}
