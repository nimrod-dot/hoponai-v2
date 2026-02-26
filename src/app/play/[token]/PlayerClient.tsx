'use client';

import { useState, useEffect, useRef } from 'react';

interface Step {
  instruction?: string;
  screenshot?: string;
  type?: string;
  url?: string;
  element?: { text?: string };
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  shareToken: string;
  title: string;
  description: string;
  steps: Step[];
}

export default function PlayerClient({ shareToken, title, description, steps }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [extDetected, setExtDetected] = useState<boolean | null>(null);
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);

  const totalSteps = steps.length;
  const currentStep = steps[stepIndex];
  const progress = totalSteps > 0 ? ((stepIndex + 1) / totalSteps) * 100 : 0;

  function scrollBottom() {
    setTimeout(() => {
      if (chatAreaRef.current) {
        chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
      }
    }, 50);
  }

  async function callSarah(
    msgs: ChatMessage[],
    stepIdx: number,
  ): Promise<string> {
    const step = steps[stepIdx];
    const res = await fetch('/api/sarah/play', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        shareToken,
        messages: msgs,
        context: {
          walkthroughTitle: title,
          stepIndex: stepIdx,
          totalSteps,
          stepInstruction: step?.instruction || '',
        },
      }),
    });
    if (!res.ok) throw new Error('Sarah unavailable');
    const data = await res.json();
    return data.reply as string;
  }

  // Detect extension
  useEffect(() => {
    const t = setTimeout(() => {
      setExtDetected(document.documentElement.hasAttribute('data-hoponai-ext'));
    }, 600);
    return () => clearTimeout(t);
  }, []);

  // Greet on mount
  useEffect(() => {
    if (hasMounted.current) return;
    hasMounted.current = true;

    const greetMsg = `I'm ready to start "${title}". Walk me through it!`;
    const initHistory: ChatMessage[] = [{ role: 'user', content: greetMsg }];
    setChatHistory(initHistory);
    setIsTyping(true);

    callSarah(initHistory, 0)
      .then((reply) => {
        setIsTyping(false);
        setChatHistory((prev) => [...prev, { role: 'assistant', content: reply }]);
        scrollBottom();
      })
      .catch(() => setIsTyping(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleNext() {
    const isLastStep = stepIndex + 1 >= totalSteps;
    const nextIdx = isLastStep ? stepIndex : stepIndex + 1;

    const userMsg = isLastStep
      ? `I completed the last step!`
      : `Got it! What do I do on step ${nextIdx + 1}?`;

    const updatedHistory: ChatMessage[] = [
      ...chatHistory,
      { role: 'user', content: userMsg },
    ];

    setChatHistory(updatedHistory);
    if (!isLastStep) setStepIndex(nextIdx);
    else setIsDone(true);
    setIsTyping(true);
    scrollBottom();

    try {
      const reply = await callSarah(updatedHistory, nextIdx);
      setIsTyping(false);
      setChatHistory((prev) => [...prev, { role: 'assistant', content: reply }]);
      scrollBottom();
    } catch {
      setIsTyping(false);
    }
  }

  async function sendUserMessage() {
    const text = chatInput.trim();
    if (!text || isTyping) return;
    setChatInput('');

    const updatedHistory: ChatMessage[] = [
      ...chatHistory,
      { role: 'user', content: text },
    ];
    setChatHistory(updatedHistory);
    setIsTyping(true);
    scrollBottom();

    try {
      const reply = await callSarah(updatedHistory, stepIndex);
      setIsTyping(false);
      setChatHistory((prev) => [...prev, { role: 'assistant', content: reply }]);
      scrollBottom();
    } catch {
      setIsTyping(false);
    }
  }

  function getStepPath(url?: string) {
    if (!url) return '';
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(1); opacity: 0.6; }
          40% { transform: scale(1.3); opacity: 1; }
        }
        .sarah-dot:nth-child(2) { animation-delay: 0.2s !important; }
        .sarah-dot:nth-child(3) { animation-delay: 0.4s !important; }
        .nav-btn:hover { opacity: 0.85; }
        .prev-btn:hover { background: #E8ECF2 !important; }
        @media (max-width: 768px) {
          .player-main { flex-direction: column !important; height: auto !important; }
          .player-step { border-right: none !important; border-bottom: 1px solid #E8ECF2; }
          .player-chat { flex: 0 0 400px !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', background: '#F8FAFC', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{
          background: '#fff', borderBottom: '1px solid #E8ECF2',
          padding: '12px 24px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#1A1D26' }}>
              hopon<span style={{ color: '#0EA5E9' }}>ai</span>
            </div>
            <div style={{ color: '#D1D5DB', fontSize: 18 }}>|</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1D26', maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {title}
            </div>
          </div>
          {!isDone && (
            <div style={{ fontSize: 13, color: '#8B92A5', fontWeight: 500, flexShrink: 0 }}>
              Step {stepIndex + 1} of {totalSteps}
            </div>
          )}
          {isDone && (
            <div style={{ fontSize: 13, color: '#22C55E', fontWeight: 600 }}>
              ✓ Complete
            </div>
          )}
          {extDetected === true && (
            <div style={{ fontSize: 12, color: '#22C55E', fontWeight: 600, flexShrink: 0 }}>
              ● Extension active
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: '#E8ECF2', flexShrink: 0 }}>
          <div style={{
            height: '100%', background: '#0EA5E9',
            width: `${isDone ? 100 : progress}%`,
            transition: 'width 0.4s ease',
          }} />
        </div>

        {/* Extension install banner */}
        {extDetected === false && (
          <div style={{
            background: '#EFF6FF', borderBottom: '1px solid #BFDBFE',
            padding: '12px 24px', display: 'flex', alignItems: 'center',
            gap: 16, flexShrink: 0,
          }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#1E40AF' }}>
                Get AI coaching directly inside the app
              </span>
              <span style={{ fontSize: 13, color: '#3B82F6', marginLeft: 8 }}>
                Install the Hoponai extension to have Sarah guide you in real-time.
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
              {process.env.NEXT_PUBLIC_CHROME_STORE_URL ? (
                <a
                  href={process.env.NEXT_PUBLIC_CHROME_STORE_URL}
                  target="_blank" rel="noreferrer"
                  style={{
                    background: '#1D4ED8', color: '#fff', padding: '8px 16px',
                    borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none',
                  }}
                >
                  Add to Chrome
                </a>
              ) : (
                <span style={{ fontSize: 13, color: '#6B7280', fontStyle: 'italic' }}>
                  Extension coming soon
                </span>
              )}
              <button
                onClick={() => window.location.reload()}
                style={{
                  background: '#fff', color: '#3B82F6', border: '1px solid #BFDBFE',
                  padding: '8px 12px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
                  fontWeight: 500,
                }}
                title="Click after installing to detect the extension"
              >
                ↻ Already installed
              </button>
            </div>
          </div>
        )}

        {/* Main two-panel layout */}
        <div
          className="player-main"
          style={{ display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100vh - 67px)' }}
        >

          {/* Left: Step viewer */}
          <div
            className="player-step"
            style={{ flex: '1 1 60%', overflowY: 'auto', padding: '28px 32px', borderRight: '1px solid #E8ECF2' }}
          >
            {isDone ? (
              <div style={{ textAlign: 'center', padding: '80px 32px' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
                <h2 style={{ fontSize: 26, fontWeight: 700, color: '#1A1D26', marginBottom: 8 }}>
                  Walkthrough complete!
                </h2>
                <p style={{ fontSize: 15, color: '#8B92A5', lineHeight: 1.6 }}>
                  You&apos;ve successfully completed all {totalSteps} step{totalSteps !== 1 ? 's' : ''} of<br />
                  <strong style={{ color: '#1A1D26' }}>{title}</strong>
                </p>
              </div>
            ) : (
              <>
                {/* Step header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: '#0EA5E9', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 17, fontWeight: 700,
                  }}>
                    {stepIndex + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1A1D26', lineHeight: 1.4, marginBottom: 4 }}>
                      {currentStep?.instruction || 'Follow the step shown below'}
                    </h2>
                    {currentStep?.url && (
                      <div style={{ fontSize: 12, color: '#8B92A5' }}>
                        {getStepPath(currentStep.url)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Screenshot */}
                {currentStep?.screenshot && (
                  <div style={{
                    borderRadius: 12, overflow: 'hidden',
                    border: '1px solid #E8ECF2', marginBottom: 28,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                  }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={currentStep.screenshot}
                      alt={`Step ${stepIndex + 1}`}
                      style={{ width: '100%', display: 'block' }}
                    />
                  </div>
                )}

                {/* Navigation */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    {stepIndex > 0 && (
                      <button
                        className="prev-btn"
                        onClick={() => setStepIndex((i) => i - 1)}
                        style={{
                          padding: '10px 20px', borderRadius: 8,
                          border: '1px solid #E8ECF2', background: '#fff',
                          color: '#4A5168', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}
                      >
                        ← Previous
                      </button>
                    )}
                  </div>
                  <button
                    className="nav-btn"
                    onClick={handleNext}
                    disabled={isTyping}
                    style={{
                      padding: '12px 28px', borderRadius: 8, border: 'none',
                      background: '#0EA5E9', color: '#fff', fontSize: 15,
                      fontWeight: 600, cursor: isTyping ? 'wait' : 'pointer',
                      opacity: isTyping ? 0.7 : 1, transition: 'opacity 0.15s',
                    }}
                  >
                    {stepIndex + 1 >= totalSteps ? "I'm done! ✓" : 'Got it, next step →'}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right: Sarah chat */}
          <div
            className="player-chat"
            style={{ flex: '0 0 360px', display: 'flex', flexDirection: 'column', background: '#fff' }}
          >
            {/* Sarah header */}
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid #E8ECF2',
              display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
                color: '#fff', fontSize: 15, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                S
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1D26' }}>Sarah</div>
                <div style={{ fontSize: 11, color: '#22C55E', fontWeight: 500 }}>● AI Training Guide</div>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={chatAreaRef}
              style={{
                flex: 1, overflowY: 'auto', padding: '16px',
                display: 'flex', flexDirection: 'column', gap: 12,
              }}
            >
              {chatHistory.map((msg, i) =>
                msg.role === 'assistant' ? (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
                      color: '#fff', fontSize: 11, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>S</div>
                    <div style={{
                      background: '#F8FAFC', border: '1px solid #E8ECF2',
                      borderRadius: '16px 16px 16px 4px',
                      padding: '10px 13px', fontSize: 13, color: '#1A1D26',
                      lineHeight: 1.6, maxWidth: 268,
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ) : (
                  <div key={i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{
                      background: '#0EA5E9', color: '#fff',
                      borderRadius: '16px 16px 4px 16px',
                      padding: '10px 13px', fontSize: 13, lineHeight: 1.6, maxWidth: 240,
                    }}>
                      {msg.content}
                    </div>
                  </div>
                ),
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
                    color: '#fff', fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>S</div>
                  <div style={{
                    background: '#F8FAFC', border: '1px solid #E8ECF2',
                    borderRadius: '16px 16px 16px 4px',
                    padding: '14px 16px', display: 'flex', gap: 4,
                  }}>
                    {[0, 1, 2].map((n) => (
                      <span
                        key={n}
                        className="sarah-dot"
                        style={{
                          width: 6, height: 6, borderRadius: '50%', background: '#CBD5E1',
                          animation: 'bounce 1.2s infinite',
                          display: 'inline-block',
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chat input */}
            <div style={{
              padding: '12px 16px', borderTop: '1px solid #E8ECF2',
              display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0,
            }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendUserMessage();
                  }
                }}
                placeholder="Ask Sarah anything…"
                style={{
                  flex: 1, padding: '9px 13px', border: '1px solid #E8ECF2',
                  borderRadius: 20, fontSize: 13, outline: 'none',
                  background: '#F8FAFC', color: '#1A1D26',
                }}
              />
              <button
                onClick={sendUserMessage}
                disabled={isTyping || !chatInput.trim()}
                style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#0EA5E9',
                  border: 'none', cursor: isTyping || !chatInput.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: isTyping || !chatInput.trim() ? 0.5 : 1, flexShrink: 0,
                  transition: 'opacity 0.15s',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M2 21L23 12 2 3v7l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
