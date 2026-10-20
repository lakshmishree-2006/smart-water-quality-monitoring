import React from 'react';
import { SensorConfig, StatusLevel } from '../types';

interface GaugeProps {
  value: number;
  config: SensorConfig;
  status: StatusLevel;
}

export const Gauge: React.FC<GaugeProps> = ({ value, config, status }) => {
  const { minRange, maxRange, safeMin, safeMax, decimals, unit } = config;

  // Clamped value for gauge percentage
  const clampedValue = Math.min(Math.max(value, minRange), maxRange);
  const percentage = (clampedValue - minRange) / (maxRange - minRange);

  // Semicircular arc gauge geometry
  // Angle from -140 deg to +140 deg (total 280 deg sweep)
  const startAngle = -140;
  const endAngle = 140;
  const sweep = endAngle - startAngle; // 280

  const radius = 62;
  const center = 80;
  const strokeWidth = 10;

  // Function to convert polar to cartesian
  const polarToCartesian = (centerX: number, centerY: number, r: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  // Function to describe SVG arc
  const describeArc = (x: number, y: number, r: number, startA: number, endA: number) => {
    const start = polarToCartesian(x, y, r, endA);
    const end = polarToCartesian(x, y, r, startA);
    const largeArcFlag = endA - startA <= 180 ? '0' : '1';
    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  // Calculate angles for safe range zone
  const safeStartPct = Math.max(0, (safeMin - minRange) / (maxRange - minRange));
  const safeEndPct = Math.min(1, (safeMax - minRange) / (maxRange - minRange));

  const safeStartAngle = startAngle + safeStartPct * sweep;
  const safeEndAngle = startAngle + safeEndPct * sweep;

  // Current needle angle
  const needleAngle = startAngle + percentage * sweep;
  const needlePos = polarToCartesian(center, center, radius - 8, needleAngle);

  // Status color styles
  const getStatusColor = () => {
    switch (status) {
      case 'CRITICAL':
        return '#ef4444'; // rose-500
      case 'WARNING':
        return '#f59e0b'; // amber-500
      default:
        return '#10b981'; // emerald-500
    }
  };

  const getStatusGlow = () => {
    switch (status) {
      case 'CRITICAL':
        return 'rgba(239, 68, 68, 0.4)';
      case 'WARNING':
        return 'rgba(245, 158, 11, 0.3)';
      default:
        return 'rgba(16, 185, 129, 0.25)';
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg
        id={`gauge-svg-${config.id}`}
        width="160"
        height="120"
        viewBox="0 0 160 130"
        className="overflow-visible"
      >
        <defs>
          <filter id={`glow-${config.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor={getStatusGlow()} />
          </filter>
        </defs>

        {/* Background track */}
        <path
          d={describeArc(center, center, radius, startAngle, endAngle)}
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Safe Range Zone Indicator (Green Accent Arc) */}
        <path
          d={describeArc(center, center, radius, safeStartAngle, safeEndAngle)}
          fill="none"
          stroke="rgba(16, 185, 129, 0.45)"
          strokeWidth={strokeWidth + 2}
          strokeLinecap="butt"
        />

        {/* Active Value Progress Arc */}
        <path
          d={describeArc(
            center,
            center,
            radius,
            startAngle,
            Math.max(startAngle + 0.1, needleAngle)
          )}
          fill="none"
          stroke={getStatusColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          filter={`url(#glow-${config.id})`}
          className="transition-all duration-300 ease-out"
        />

        {/* Needle Line */}
        <line
          x1={center}
          y1={center}
          x2={needlePos.x}
          y2={needlePos.y}
          stroke="#f8fafc"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />

        {/* Center Pivot Point */}
        <circle cx={center} cy={center} r="6" fill="#0f172a" stroke={getStatusColor()} strokeWidth="2.5" />
        <circle cx={center} cy={center} r="2.5" fill="#f8fafc" />

        {/* Tick labels: Min and Max */}
        <text
          x="24"
          y="126"
          fill="#64748b"
          fontSize="10"
          fontWeight="600"
          textAnchor="middle"
          fontFamily="monospace"
        >
          {minRange}
        </text>
        <text
          x="136"
          y="126"
          fill="#64748b"
          fontSize="10"
          fontWeight="600"
          textAnchor="middle"
          fontFamily="monospace"
        >
          {maxRange}
        </text>
      </svg>

      {/* Numerical readout under gauge */}
      <div className="-mt-3 flex items-baseline gap-1">
        <span className="font-mono text-xl font-bold tracking-tight text-white">
          {value.toFixed(decimals)}
        </span>
        <span className="text-xs font-semibold text-slate-400">{unit}</span>
      </div>
    </div>
  );
};
