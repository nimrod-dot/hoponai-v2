'use client';

import { useState } from 'react';

export default function ExtensionPage() {
  const [token, setToken]   = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  async function generateToken() {
    setLoading(true);
    setError('');
    setToken('');
    try {
      const res = await fetch('/api/extension/token', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to generate token.');
        return;
      }
      const data = await res.json();
      setToken(data.token);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function copyToken() {
    await navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1A1D26', marginBottom: 4 }}>
          Chrome Extension
        </h1>
        <p style={{ fontSize: 15, color: '#8B92A5' }}>
          Record and deliver interactive walkthroughs directly in your browser.
        </p>
      </div>

      <div style={{
        background: '#fff', borderRadius: 16, border: '1px solid #E8ECF2',
        padding: '40px', maxWidth: 580,
      }}>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
          {[
            { step: '1', title: 'Load the extension in Chrome', desc: 'Go to chrome://extensions → Enable Developer mode → Load unpacked → select the extension/ folder.' },
            { step: '2', title: 'Generate a connection token', desc: 'Click below to create a secure token, then paste it into the extension popup.' },
            { step: '3', title: 'Record a walkthrough', desc: 'Navigate to GanttPRO and click Start Recording in the extension.' },
          ].map((s) => (
            <div key={s.step} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: '#0EA5E9', color: '#fff', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 700,
              }}>
                {s.step}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1D26', marginBottom: 2 }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 14, color: '#8B92A5', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #E8ECF2', margin: '24px 0' }} />

        {/* Token generation */}
        <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1D26', marginBottom: 8 }}>
          Connection Token
        </div>
        <p style={{ fontSize: 14, color: '#8B92A5', marginBottom: 16, lineHeight: 1.5 }}>
          This token is valid for 30 days. Paste it into the extension popup to connect it to your account.
        </p>

        {!token ? (
          <>
            <button
              onClick={generateToken}
              disabled={loading}
              style={{
                background: '#0EA5E9', color: '#fff', padding: '10px 24px',
                borderRadius: 8, fontWeight: 600, fontSize: 14, border: 'none',
                cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Generating…' : 'Generate Connection Token'}
            </button>
            {error && (
              <p style={{ marginTop: 8, fontSize: 13, color: '#EF4444' }}>{error}</p>
            )}
          </>
        ) : (
          <div>
            <div style={{
              display: 'flex', gap: 8, alignItems: 'center',
              background: '#F8FAFC', border: '1px solid #E8ECF2',
              borderRadius: 8, padding: '10px 12px',
            }}>
              <code style={{
                flex: 1, fontSize: 12, color: '#4A5168',
                wordBreak: 'break-all', fontFamily: 'monospace',
              }}>
                {token}
              </code>
              <button
                onClick={copyToken}
                style={{
                  flexShrink: 0, background: copied ? '#10B981' : '#0EA5E9',
                  color: '#fff', border: 'none', borderRadius: 6,
                  padding: '6px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <button
              onClick={generateToken}
              style={{
                marginTop: 8, background: 'none', border: 'none',
                fontSize: 13, color: '#8B92A5', cursor: 'pointer', padding: 0,
              }}
            >
              Regenerate token
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
