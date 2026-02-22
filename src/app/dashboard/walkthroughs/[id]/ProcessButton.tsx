'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProcessButton({ walkthroughId }: { walkthroughId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleProcess() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/walkthroughs/${walkthroughId}/process`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Processing failed.');
        return;
      }
      router.refresh();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleProcess}
        disabled={loading}
        style={{
          background: loading ? '#E8ECF2' : '#0EA5E9',
          color: loading ? '#8B92A5' : '#fff',
          border: 'none', borderRadius: 8,
          padding: '10px 20px', fontSize: 14, fontWeight: 600,
          cursor: loading ? 'wait' : 'pointer',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        {loading ? (
          <>
            <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #8B92A5', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            Processing…
          </>
        ) : '✨ Process with AI'}
      </button>
      {loading && (
        <p style={{ fontSize: 13, color: '#8B92A5', marginTop: 8 }}>
          Generating instructions for each step — this takes ~15–30 seconds.
        </p>
      )}
      {error && <p style={{ fontSize: 13, color: '#EF4444', marginTop: 8 }}>{error}</p>}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
