import React, { useState, useEffect } from 'react';
import { Sun, Moon, Sparkles, Clock, Utensils, Activity } from 'lucide-react';

const timeToMinutes = (t) => {
  const [h, m] = (t || '06:00').split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

export default function SunArc({ schedule = [], diet = [], day = 'Senin' }) {
  const [nowMin, setNowMin] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });
  const [hoveredItem, setHoveredItem] = useState(null);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setNowMin(d.getHours() * 60 + d.getMinutes());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const W = 680, H = 220;
  const startMin = 4 * 60; // 04:00 AM
  const endMin = 22 * 60;  // 10:00 PM
  const cx = W / 2, cy = H - 15, r = 270;

  const posFor = (minutes) => {
    const clamped = Math.min(Math.max(minutes, startMin), endMin);
    const t = (clamped - startMin) / (endMin - startMin); // 0..1
    const angle = Math.PI - t * Math.PI; // PI to 0
    return {
      x: cx + r * Math.cos(angle) * 0.98,
      y: cy - r * Math.sin(angle) * 0.98,
      angle
    };
  };

  const nowPos = posFor(nowMin);
  const isNight = nowMin < startMin || nowMin > endMin;

  const items = [
    ...schedule.filter((s) => s.day === day).map((s) => ({ ...s, kind: 'asana' })),
    ...diet.filter((d) => d.day === day).map((d) => ({ ...d, kind: 'meal' }))
  ];

  const arcPath = () => {
    const p0 = posFor(startMin);
    const p1 = posFor(endMin);
    return `M ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p1.x} ${p1.y}`;
  };

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="arcGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-sage)" stopOpacity="0.4" />
            <stop offset="50%" stopColor="var(--accent-gold)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="var(--accent-sage)" stopOpacity="0.4" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Background Base Arc */}
        <path
          d={arcPath()}
          fill="none"
          stroke="rgba(142, 175, 150, 0.15)"
          strokeWidth="3"
          strokeDasharray="4 8"
          strokeLinecap="round"
        />

        {/* Active Time Glow Arc */}
        <path
          d={arcPath()}
          fill="none"
          stroke="url(#arcGlow)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#glow)"
        />

        {/* Hour Markers */}
        {[4, 7, 10, 13, 16, 19, 22].map((h) => {
          const p = posFor(h * 60);
          return (
            <g key={h}>
              <line
                x1={p.x} y1={p.y - 4}
                x2={p.x} y2={p.y + 4}
                stroke="var(--surface-border)"
                strokeWidth="1.5"
              />
              <text
                x={p.x}
                y={p.y + 20}
                textAnchor="middle"
                fontSize="11"
                fill="var(--text-dim)"
                fontFamily="JetBrains Mono, monospace"
              >
                {String(h).padStart(2, '0')}:00
              </text>
            </g>
          );
        })}

        {/* Event Items (Yoga & Meals) */}
        {items.map((it) => {
          const p = posFor(timeToMinutes(it.time));
          const isAsana = it.kind === 'asana';
          const color = isAsana ? 'var(--accent-sage)' : 'var(--accent-gold)';

          return (
            <g
              key={it.id}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredItem(it)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <circle cx={p.x} cy={p.y} r="12" fill={color} opacity="0.15" />
              <circle cx={p.x} cy={p.y} r="7" fill={color} filter="url(#glow)" />
              <circle cx={p.x} cy={p.y} r="3" fill="#0A1611" />
            </g>
          );
        })}

        {/* Real-time Sun / Moon Marker */}
        <g transform={`translate(${nowPos.x}, ${nowPos.y})`} filter="url(#glow)">
          <circle r="14" fill="var(--accent-gold-glow)" />
          <circle r="9" fill="var(--accent-gold)" />
          <circle r="5" fill="#FFF" opacity="0.9" />
        </g>
      </svg>

      {/* Tooltip Overlay */}
      {hoveredItem && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(10, 22, 17, 0.95)',
            border: '1px solid var(--accent-gold)',
            borderRadius: '10px',
            padding: '8px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 20
          }}
        >
          {hoveredItem.kind === 'asana' ? (
            <Activity size={16} color="var(--accent-sage)" />
          ) : (
            <Utensils size={16} color="var(--accent-gold)" />
          )}
          <div>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>
              {hoveredItem.jenis || hoveredItem.menu}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-dim)', marginLeft: '8px' }} className="font-mono">
              {hoveredItem.time} {hoveredItem.durasi ? `(${hoveredItem.durasi}m)` : hoveredItem.slot}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
