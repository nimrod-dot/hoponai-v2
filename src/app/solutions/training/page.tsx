'use client';

import dynamic from 'next/dynamic';
import SolutionPage from '@/components/SolutionPage';

const TrainingInfographic = dynamic(() => import('@/components/TrainingInfographic'), { ssr: false });

export default function TrainingPage() {
  return (
    <SolutionPage
      badge="Continuous Training"
      headline="New tools. New processes. Everyone trained. Instantly."
      subline="When your company changes - new software, new policies, new workflows - Hoponai retrains your entire org interactively, in days instead of months."
      painSummary="Change happens fast. Training doesn't keep up."
      pains={[
        { stat: '6 months', label: 'Typical timeline to fully roll out a new enterprise system' },
        { stat: '43%', label: 'of employees say they don\'t receive adequate training on new tools' },
        { stat: '$11.7M', label: 'Average annual training spend per large enterprise' },
      ]}
      features={[
        { icon: '🔄', title: 'Instant retraining', desc: 'New CRM? Updated compliance policy? Hoponai learns the changes and walks every affected employee through them immediately.' },
        { icon: '🎯', title: 'Role-based delivery', desc: 'Sales gets trained on the sales-relevant changes. Operations gets their own track. No one sits through irrelevant content.' },
        { icon: '📈', title: 'Adoption tracking', desc: 'See who has completed training, who\'s struggling, and where the knowledge gaps are - in real time.' },
        { icon: '🔁', title: 'Always current', desc: 'Update a process? Hoponai automatically reflects the changes. No rerecording videos or rewriting docs.' },
      ]}
      howTitle="How continuous training works"
      howSteps={[
        { num: '01', title: 'Change happens', desc: 'Your company rolls out a new tool, updates a process, or changes a policy. You update Hoponai\'s knowledge base.' },
        { num: '02', title: 'Hoponai adapts', desc: 'Within hours, Hoponai creates interactive, role-specific training sessions for every affected team.' },
        { num: '03', title: 'Everyone is aligned', desc: 'Employees complete training at their own pace, guided interactively through the actual tools. Adoption measured in days.' },
      ]}
      ctaLine="What if your next software rollout took days instead of months?"
      infographic={<TrainingInfographic />}
    />
  );
}
