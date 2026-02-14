import React, { useState, useEffect } from "react";

const steps = [
  { label: "Sarah identifies the task", highlight: "nav", bubble: "Let me show you how to submit a report..." },
  { label: "Navigates to the right screen", highlight: "screen", bubble: "First, click on Reports in the sidebar." },
  { label: "Guides each action step-by-step", highlight: "form", bubble: "Now fill in the date range and click Generate." },
  { label: "Confirms completion", highlight: "done", bubble: "You did it! The report is ready to download." },
];

export default function SarahInfographic() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((s) => (s + 1) % steps.length);
    }, 3200);
    return () => clearInterval(timer);
  }, []);

  const step = steps[activeStep];

  return (
    <div style={{ width: "100%", maxWidth: 860, margin: "0 auto", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* Main container */}
      <div style={{
        background: "#fff",
        borderRadius: 20,
        border: "1px solid #E8ECF2",
        overflow: "hidden",
        boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
      }}>
        {/* Browser chrome */}
        <div style={{
          background: "#F8FAFC",
          borderBottom: "1px solid #E8ECF2",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FCA5A5" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#FCD34D" }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#6EE7B7" }} />
          <div style={{
            flex: 1, marginLeft: 12, background: "#fff", borderRadius: 8,
            padding: "6px 16px", fontSize: 12, color: "#8B92A5",
            border: "1px solid #E8ECF2",
          }}>
            app.yourcompany.com/dashboard
          </div>
        </div>

        {/* App content */}
        <div style={{ display: "flex", minHeight: 340 }}>
          {/* Sidebar */}
          <div style={{
            width: 180, background: "#1A1D26", padding: "20px 0",
            display: "flex", flexDirection: "column", gap: 2,
          }}>
            <div style={{ padding: "8px 20px", fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
              YourApp
            </div>
            {["Dashboard", "Reports", "Team", "Settings"].map((item, i) => (
              <div
                key={item}
                style={{
                  padding: "10px 20px",
                  fontSize: 13,
                  color: (step.highlight === "nav" || step.highlight === "screen") && i === 1 ? "#0EA5E9" : "rgba(255,255,255,0.5)",
                  background: (step.highlight === "nav" || step.highlight === "screen") && i === 1 ? "rgba(14,165,233,0.1)" : "transparent",
                  borderLeft: (step.highlight === "nav" || step.highlight === "screen") && i === 1 ? "3px solid #0EA5E9" : "3px solid transparent",
                  transition: "all 0.4s ease",
                  fontWeight: (step.highlight === "nav" || step.highlight === "screen") && i === 1 ? 600 : 400,
                }}
              >
                {item}
              </div>
            ))}
          </div>

          {/* Main area */}
          <div style={{ flex: 1, padding: 28, position: "relative" }}>
            {/* Fake app content */}
            <div style={{
              opacity: step.highlight === "nav" ? 0.4 : 1,
              transition: "opacity 0.4s ease",
            }}>
              <div style={{
                fontSize: 18, fontWeight: 700, color: "#1A1D26", marginBottom: 16,
              }}>
                {step.highlight === "screen" || step.highlight === "form" || step.highlight === "done" ? "Generate Report" : "Dashboard Overview"}
              </div>

              {(step.highlight === "form" || step.highlight === "screen") && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#8B92A5", marginBottom: 4 }}>Date Range</div>
                    <div style={{
                      padding: "8px 14px", borderRadius: 8, border: step.highlight === "form" ? "2px solid #0EA5E9" : "1px solid #E8ECF2",
                      fontSize: 13, color: "#1A1D26", background: "#fff",
                      transition: "all 0.4s ease",
                      boxShadow: step.highlight === "form" ? "0 0 0 3px rgba(14,165,233,0.15)" : "none",
                    }}>
                      Jan 1 - Jan 31, 2026
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#8B92A5", marginBottom: 4 }}>Report Type</div>
                    <div style={{
                      padding: "8px 14px", borderRadius: 8, border: "1px solid #E8ECF2",
                      fontSize: 13, color: "#1A1D26", background: "#fff",
                    }}>
                      Monthly Summary
                    </div>
                  </div>
                  <button style={{
                    padding: "10px 24px", borderRadius: 8, border: "none",
                    background: step.highlight === "form" ? "#0EA5E9" : "#E8ECF2",
                    color: step.highlight === "form" ? "#fff" : "#8B92A5",
                    fontSize: 14, fontWeight: 600, width: "fit-content",
                    transition: "all 0.4s ease",
                    cursor: "default",
                  }}>
                    Generate Report
                  </button>
                </div>
              )}

              {step.highlight === "done" && (
                <div style={{
                  background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
                  borderRadius: 12, padding: 20, textAlign: "center",
                  animation: "fadeIn 0.5s ease",
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#059669" }}>Report Generated!</div>
                  <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>monthly-report-jan-2026.pdf</div>
                </div>
              )}

              {step.highlight === "nav" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={{
                      height: 14, borderRadius: 6,
                      background: "#F1F5F9",
                      width: `${80 - i * 15}%`,
                    }} />
                  ))}
                </div>
              )}
            </div>

            {/* Sarah AI bubble */}
            <div style={{
              position: "absolute",
              bottom: 20,
              right: 20,
              maxWidth: 280,
              transition: "all 0.4s ease",
            }}>
              {/* Connector line */}
              <div style={{
                background: "#fff",
                borderRadius: 16,
                padding: "14px 18px",
                boxShadow: "0 4px 24px rgba(14,165,233,0.15)",
                border: "1px solid rgba(14,165,233,0.2)",
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 6,
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    background: "linear-gradient(135deg, #0EA5E9, #0284C7)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, color: "#fff", fontWeight: 700,
                  }}>
                    S
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0EA5E9" }}>Sarah</span>
                  <span style={{ fontSize: 10, color: "#8B92A5", marginLeft: "auto" }}>AI Training Guide</span>
                </div>
                <div style={{
                  fontSize: 13, color: "#4A5168", lineHeight: 1.5,
                  transition: "all 0.3s ease",
                }}>
                  {step.bubble}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step indicators */}
      <div style={{
        display: "flex", justifyContent: "center", gap: 8, marginTop: 24,
      }}>
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveStep(i)}
            style={{
              padding: "8px 16px",
              borderRadius: 20,
              border: "1px solid",
              borderColor: i === activeStep ? "#0EA5E9" : "#E8ECF2",
              background: i === activeStep ? "rgba(14,165,233,0.08)" : "#fff",
              color: i === activeStep ? "#0EA5E9" : "#8B92A5",
              fontSize: 12,
              fontWeight: i === activeStep ? 600 : 500,
              cursor: "pointer",
              transition: "all 0.3s ease",
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}