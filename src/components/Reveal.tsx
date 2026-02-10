'use client';
import { useRef, useState, useEffect, ReactNode, CSSProperties } from 'react';

export default function Reveal({ children, delay = 0, style = {} }: { children: ReactNode; delay?: number; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`, ...style }}>
      {children}
    </div>
  );
}
