"use client";

import { useEffect, useState } from "react";

const COLORS = [
  "bg-violet-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-blue-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
];

interface Particle {
  id: number;
  color: string;
  left: string;
  delay: string;
  duration: string;
  size: string;
}

export default function Confetti() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const items: Particle[] = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      color: COLORS[i % COLORS.length],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 0.5}s`,
      duration: `${1.5 + Math.random() * 2}s`,
      size: `${6 + Math.random() * 8}px`,
    }));
    setParticles(items);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute animate-confetti rounded-sm ${p.color}`}
          style={{
            left: p.left,
            top: "-10px",
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}
