'use client';

import { useState } from 'react';

export default function ShareButton({ walkthroughId }: { walkthroughId: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'copied' | 'error'>('idle');

  async function handleShare() {
    setStatus('loading');
    try {
      const res = await fetch(`/api/walkthroughs/${walkthroughId}/share`, {
        method: 'POST',
      });
      if (!res.ok) {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 2500);
        return;
      }
      const { shareUrl } = await res.json();
      await navigator.clipboard.writeText(shareUrl);
      setStatus('copied');
      setTimeout(() => setStatus('idle'), 2500);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2500);
    }
  }

  const label =
    status === 'loading' ? 'Generating…'
    : status === 'copied' ? '✓ Link copied!'
    : status === 'error'  ? 'Error — try again'
    : 'Share';

  const bg =
    status === 'copied' ? '#16A34A'
    : status === 'error' ? '#EF4444'
    : '#1A1D26';

  return (
    <button
      onClick={handleShare}
      disabled={status === 'loading'}
      style={{
        padding: '10px 20px', borderRadius: 8, border: 'none',
        background: bg, color: '#fff', fontSize: 14, fontWeight: 600,
        cursor: status === 'loading' ? 'wait' : 'pointer',
        transition: 'background 0.2s', display: 'flex', alignItems: 'center', gap: 6,
        opacity: status === 'loading' ? 0.7 : 1,
      }}
    >
      {status === 'idle' && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      )}
      {label}
    </button>
  );
}
