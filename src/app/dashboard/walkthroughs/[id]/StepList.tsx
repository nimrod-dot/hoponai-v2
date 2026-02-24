'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function StepList({ walkthroughId, steps: initialSteps }: { walkthroughId: string; steps: any[] }) {
  const [localSteps, setLocalSteps] = useState<any[]>(initialSteps);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function patchSteps(updatedSteps: any[]) {
    setSaving(true);
    try {
      const res = await fetch(`/api/walkthroughs/${walkthroughId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ steps: updatedSteps }),
      });
      if (res.ok) {
        setLocalSteps(updatedSteps);
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  function startEdit(i: number) {
    setEditingIndex(i);
    setEditText(localSteps[i].instruction || '');
  }

  async function saveEdit(i: number) {
    const updated = localSteps.map((s, idx) =>
      idx === i ? { ...s, instruction: editText } : s,
    );
    await patchSteps(updated);
    setEditingIndex(null);
  }

  async function deleteStep(i: number) {
    if (!window.confirm('Remove this step from the walkthrough?')) return;
    const updated = localSteps.filter((_, idx) => idx !== i);
    await patchSteps(updated);
  }

  if (localSteps.length === 0) {
    return (
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8ECF2', padding: '48px 32px', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
        <p style={{ color: '#8B92A5' }}>No steps were recorded for this walkthrough.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {localSteps.map((step: any, i: number) => {
        const isEditing = editingIndex === i;
        return (
          <div key={i} style={{ background: '#fff', borderRadius: 12, border: '1px solid #E8ECF2', overflow: 'hidden' }}>
            {/* Step header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px 20px', borderBottom: step.screenshot ? '1px solid #E8ECF2' : 'none' }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: '#0EA5E9', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, marginTop: 2,
              }}>
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                {isEditing ? (
                  <div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={3}
                      style={{
                        width: '100%', fontSize: 14, padding: '8px 10px',
                        border: '1.5px solid #0EA5E9', borderRadius: 8,
                        fontFamily: 'inherit', lineHeight: 1.5, resize: 'vertical',
                        boxSizing: 'border-box', outline: 'none',
                      }}
                    />
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <button
                        onClick={() => saveEdit(i)}
                        disabled={saving}
                        style={{
                          background: '#0EA5E9', color: '#fff', border: 'none',
                          borderRadius: 6, padding: '5px 14px', fontSize: 13, fontWeight: 600,
                          cursor: saving ? 'wait' : 'pointer',
                        }}
                      >
                        {saving ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditingIndex(null)}
                        disabled={saving}
                        style={{
                          background: '#F1F5F9', color: '#4A5168', border: 'none',
                          borderRadius: 6, padding: '5px 14px', fontSize: 13, fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* AI instruction */}
                    {step.instruction ? (
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1D26', marginBottom: 4, lineHeight: 1.5 }}>
                        {step.instruction}
                      </div>
                    ) : (
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1D26', textTransform: 'capitalize', marginBottom: 2 }}>
                        {step.type || 'action'}
                        {step.element?.text && <span style={{ fontWeight: 400, color: '#4A5168' }}> — {step.element.text.slice(0, 60)}</span>}
                      </div>
                    )}
                    <div style={{ fontSize: 12, color: '#8B92A5', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {step.url && (() => { try { return <span>{new URL(step.url).pathname}</span>; } catch { return <span>{step.url}</span>; } })()}
                      {step.elapsed_ms != null && <span>{(step.elapsed_ms / 1000).toFixed(1)}s</span>}
                      <span style={{
                        fontWeight: 600, padding: '0px 6px', borderRadius: 6,
                        background: step.type === 'click' ? '#EFF6FF' : step.type === 'input' ? '#F0FDF4' : '#F9FAFB',
                        color: step.type === 'click' ? '#1D4ED8' : step.type === 'input' ? '#16A34A' : '#6B7280',
                      }}>
                        {step.type}
                      </span>
                      {step.isFlexible && (
                        <span style={{ background: '#F0FDF4', color: '#16A34A', fontWeight: 600, padding: '0px 6px', borderRadius: 6 }}>
                          Your choice
                        </span>
                      )}
                    </div>
                    {step.isFlexible && step.flexibilityNote && (
                      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4, fontStyle: 'italic' }}>
                        {step.flexibilityNote}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Edit / Delete buttons */}
              {!isEditing && (
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button
                    title="Edit instruction"
                    onClick={() => startEdit(i)}
                    disabled={saving}
                    style={{
                      background: 'none', border: '1px solid #E8ECF2', borderRadius: 6,
                      width: 30, height: 30, cursor: 'pointer', fontSize: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#8B92A5',
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    title="Delete step"
                    onClick={() => deleteStep(i)}
                    disabled={saving}
                    style={{
                      background: 'none', border: '1px solid #FECACA', borderRadius: 6,
                      width: 30, height: 30, cursor: 'pointer', fontSize: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#EF4444',
                    }}
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>

            {/* Screenshot */}
            {step.screenshot && (
              <div style={{ background: '#F8FAFC', padding: 16 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={step.screenshot}
                  alt={`Step ${i + 1}`}
                  style={{ width: '100%', borderRadius: 8, border: '1px solid #E8ECF2', display: 'block' }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
