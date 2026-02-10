import SolutionPage from '@/components/SolutionPage';

export const metadata = { title: 'Employee Onboarding — Hoponai', description: 'Get every new hire productive from day one with AI-powered interactive onboarding.' };

export default function OnboardingPage() {
  return (
    <SolutionPage
      badge="Employee Onboarding"
      headline="Every new hire. Productive from day one."
      subline="No more 3-week ramp-ups, forgotten passwords, or death-by-slideshow. Hoponai walks every new employee through your systems, processes, and tools — interactively."
      painSummary="Onboarding today is slow, expensive, and forgettable."
      pains={[
        { stat: '3 weeks', label: 'Average time to basic productivity for a new hire' },
        { stat: '29%', label: 'of HR leaders rank attrition during onboarding as their #1 issue' },
        { stat: '$4,100', label: 'Average cost to onboard a single employee' },
      ]}
      features={[
        { icon: '🗺️', title: 'Guided system walkthroughs', desc: 'Hoponai opens your actual tools — Salesforce, HiBob, Workday — and walks the employee through every step, live.' },
        { icon: '💬', title: 'Ask anything, anytime', desc: 'New hire confused? They ask Hoponai directly. No searching docs, no pinging coworkers, no waiting for IT.' },
        { icon: '🔄', title: 'Adapts to each person', desc: 'A senior dev and a junior analyst don\'t get the same onboarding. Hoponai adjusts depth, pace, and content to the individual.' },
        { icon: '📊', title: 'Track readiness', desc: 'Know exactly where each new hire stands. Identify gaps before they become problems. Replace guesswork with data.' },
      ]}
      howTitle="How onboarding works with Hoponai"
      howSteps={[
        { num: '01', title: 'Connect your systems', desc: 'Hoponai integrates with your tools and ingests your onboarding documentation, policies, and workflows.' },
        { num: '02', title: 'New hire starts', desc: 'Day 1: the employee opens Hoponai and begins an interactive, conversational walkthrough of everything they need to know.' },
        { num: '03', title: 'Productive in days, not weeks', desc: 'By end of week one, they can navigate every system and follow every process — because they did it, not just watched it.' },
      ]}
      ctaLine="What if every new hire could be productive by Friday?"
    />
  );
}
