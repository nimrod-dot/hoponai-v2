'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const STEPS = [
  {
    id: 'use_case',
    question: 'What will you use Hoponai for?',
    subtitle: 'Select all that apply',
    type: 'multi',
    options: [
      { value: 'onboarding', label: 'Employee Onboarding', icon: '🚀', desc: 'Get new hires productive faster' },
      { value: 'training', label: 'Continuous Training', icon: '📈', desc: 'Train teams on new tools & processes' },
      { value: 'sops', label: 'SOPs & Compliance', icon: '📋', desc: 'Ensure procedures are followed' },
      { value: 'customers', label: 'Customer Training', icon: '🤝', desc: 'Help customers use your product' },
    ],
  },
  {
    id: 'systems',
    question: 'Which systems does your team use?',
    subtitle: 'We\'ll prioritize these in your training',
    type: 'multi',
    options: [
      { value: 'salesforce', label: 'Salesforce' },
      { value: 'hubspot', label: 'HubSpot' },
      { value: 'jira', label: 'Jira' },
      { value: 'slack', label: 'Slack' },
      { value: 'notion', label: 'Notion' },
      { value: 'monday', label: 'Monday.com' },
      { value: 'sap', label: 'SAP' },
      { value: 'workday', label: 'Workday' },
      { value: 'custom', label: 'Custom / Internal Tools' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 'team_size',
    question: 'How large is your team?',
    subtitle: 'This helps us recommend the right plan',
    type: 'single',
    options: [
      { value: '1-10', label: '1-10 people' },
      { value: '11-50', label: '11-50 people' },
      { value: '51-200', label: '51-200 people' },
      { value: '201-1000', label: '201-1,000 people' },
      { value: '1000+', label: '1,000+ people' },
    ],
  },
  {
    id: 'pain',
    question: 'What\'s your biggest training challenge?',
    subtitle: 'Pick the one that hurts most',
    type: 'single',
    options: [
      { value: 'time', label: 'Training takes too long' },
      { value: 'adoption', label: 'People don\'t complete training' },
      { value: 'outdated', label: 'Training materials are always outdated' },
      { value: 'scale', label: 'Can\'t train everyone fast enough' },
      { value: 'compliance', label: 'Compliance / audit readiness' },
      { value: 'cost', label: 'Training costs too much' },
    ],
  },
];

export default function OnboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(false);

  const current = STEPS[step];

  const handleSelect = (value: string) => {
    if (current.type === 'multi') {
      const prev = (answers[current.id] as string[]) || [];
      if (prev.includes(value)) {
        setAnswers({ ...answers, [current.id]: prev.filter((v) => v !== value) });
      } else {
        setAnswers({ ...answers, [current.id]: [...prev, value] });
      }
    } else {
      setAnswers({ ...answers, [current.id]: value });
    }
  };

  const isSelected = (value: string) => {
    const answer = answers[current.id];
    if (Array.isArray(answer)) return answer.includes(value);
    return answer === value;
  };

  const canProceed = () => {
    const answer = answers[current.id];
    if (!answer) return false;
    if (Array.isArray(answer)) return answer.length > 0;
    return true;
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      // Submit
      setLoading(true);
      try {
        await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            primary_use_case: answers.use_case,
            systems_used: answers.systems,
            team_size: answers.team_size,
            biggest_pain: answers.pain,
          }),
        });
        router.push('/dashboard');
      } catch (err) {
        console.error('Onboarding error:', err);
        setLoading(false);
      }
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FAFBFD',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 40 }}>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: '#1A1D26' }}>hopon</span>
        <span style={{ fontFamily: 'Georgia, serif', fontSize: 28, color: '#0EA5E9' }}>ai</span>
      </div>

      {/* Progress bar */}
      <div style={{
        width: '100%', maxWidth: 480, height: 4,
        background: '#E8ECF2', borderRadius: 2, marginBottom: 48,
      }}>
        <div style={{
          width: `${progress}%`, height: '100%',
          background: '#0EA5E9', borderRadius: 2,
          transition: 'width 0.3s ease',
        }} />
      </div>

      {/* Question */}
      <div style={{ width: '100%', maxWidth: 560, textAlign: 'center' }}>
        <h1 style={{
          fontSize: 28, fontWeight: 700, color: '#1A1D26',
          fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 8,
        }}>
          {current.question}
        </h1>
        <p style={{ fontSize: 16, color: '#8B92A5', marginBottom: 32 }}>
          {current.subtitle}
        </p>

        {/* Options */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: current.options.length > 4 ? '1fr 1fr' : '1fr',
          gap: 12,
          marginBottom: 40,
        }}>
          {current.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              style={{
                padding: '16px 20px',
                borderRadius: 12,
                border: `2px solid ${isSelected(opt.value) ? '#0EA5E9' : '#E8ECF2'}`,
                background: isSelected(opt.value) ? 'rgba(14,165,233,0.05)' : '#fff',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {'icon' in opt && (
                  <span style={{ fontSize: 24 }}>{(opt as any).icon}</span>
                )}
                <div>
                  <div style={{
                    fontSize: 15, fontWeight: 600,
                    color: isSelected(opt.value) ? '#0EA5E9' : '#1A1D26',
                  }}>
                    {opt.label}
                  </div>
                  {'desc' in opt && (
                    <div style={{ fontSize: 13, color: '#8B92A5', marginTop: 2 }}>
                      {(opt as any).desc}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => step > 0 && setStep(step - 1)}
            style={{
              padding: '10px 20px', borderRadius: 8,
              border: 'none', background: 'transparent',
              color: step > 0 ? '#8B92A5' : 'transparent',
              cursor: step > 0 ? 'pointer' : 'default',
              fontSize: 14, fontWeight: 500,
            }}
          >
            Back
          </button>

          <span style={{ fontSize: 14, color: '#8B92A5' }}>
            {step + 1} of {STEPS.length}
          </span>

          <button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            style={{
              padding: '12px 32px', borderRadius: 8,
              border: 'none',
              background: canProceed() ? '#0EA5E9' : '#E8ECF2',
              color: canProceed() ? '#fff' : '#8B92A5',
              cursor: canProceed() ? 'pointer' : 'not-allowed',
              fontSize: 15, fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            {loading ? 'Setting up...' : step === STEPS.length - 1 ? 'Get Started' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}