import SolutionPage from '@/components/SolutionPage';

export const metadata = { title: 'SOPs & Compliance — Hoponai', description: 'Ensure every standard operating procedure is followed correctly with AI-guided training.' };

export default function SOPsPage() {
  return (
    <SolutionPage
      badge="SOPs & Compliance"
      headline="Every procedure. Followed correctly. Every time."
      subline="SOPs exist in PDFs no one reads. Compliance training is a checkbox exercise. Hoponai makes both interactive — walking employees through actual procedures in the actual systems."
      painSummary="Written SOPs don't guarantee correct execution."
      pains={[
        { stat: '60%', label: 'of employees admit they don\'t always follow documented SOPs' },
        { stat: '$14.8M', label: 'Average cost of non-compliance for companies (per Ponemon Institute)' },
        { stat: '34%', label: 'of compliance training fails to change behavior' },
      ]}
      features={[
        { icon: '📋', title: 'Interactive SOP walkthroughs', desc: 'Instead of reading a 40-page doc, employees walk through each procedure step-by-step with Hoponai in the actual system.' },
        { icon: '✅', title: 'Verify understanding', desc: 'Hoponai doesn\'t just present information — it checks comprehension, asks follow-up questions, and re-explains when needed.' },
        { icon: '📊', title: 'Completion tracking', desc: 'Real-time dashboards showing who has completed training, who\'s in progress, and who needs a nudge. Audit-ready.' },
        { icon: '🔒', title: 'Always up to date', desc: 'When a regulation changes, update the SOP once. Hoponai immediately retrains every affected employee on the new procedure.' },
      ]}
      howTitle="How SOP training works"
      howSteps={[
        { num: '01', title: 'Upload your SOPs', desc: 'Hoponai ingests your standard operating procedures, compliance requirements, and related system documentation.' },
        { num: '02', title: 'Employees practice', desc: 'Instead of reading, employees DO the procedure with Hoponai guiding them through each step in the actual software.' },
        { num: '03', title: 'Compliance verified', desc: 'Completion is tracked, understanding is verified, and you have an audit trail showing who was trained and when.' },
      ]}
      ctaLine="What if compliance training actually worked?"
    />
  );
}
