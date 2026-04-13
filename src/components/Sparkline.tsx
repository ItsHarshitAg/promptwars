import { memo } from 'react';

interface SparklineProps {
  data: number[];   // array of 0–1 density values, oldest first
  color: string;
  width?: number;
  height?: number;
}

/** Tiny inline SVG polyline sparkline with trend arrow. */
export const Sparkline = memo(function Sparkline({ data, color, width = 72, height = 20 }: SparklineProps) {
  if (data.length < 2) return null;

  const step = width / (data.length - 1);
  const points = data
    .map((v, i) => `${i * step},${height - v * height}`)
    .join(' ');

  const mid = Math.floor(data.length / 2);
  const recent = data.slice(mid).reduce((a, b) => a + b, 0) / (data.length - mid);
  const older  = data.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
  const trend  = recent > older + 0.04 ? '↑' : recent < older - 0.04 ? '↓' : null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <svg width={width} height={height} aria-hidden="true" style={{ overflow: 'visible', display: 'block' }}>
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.75"
        />
      </svg>
      {trend && (
        <span style={{ fontSize: 10, color, fontWeight: 700, lineHeight: 1 }}>
          {trend}
        </span>
      )}
    </div>
  );
});
