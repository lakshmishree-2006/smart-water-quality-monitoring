import React, { useState } from 'react';
import { HistoryRecord, SensorType } from '../types';
import { SENSOR_CONFIGS } from '../data/mockData';
import { Activity, Eye, EyeOff } from 'lucide-react';

interface RealTimeChartProps {
  history: HistoryRecord[];
  activeParameter?: SensorType;
}

export const RealTimeChart: React.FC<RealTimeChartProps> = ({ history }) => {
  const [selectedSensor, setSelectedSensor] = useState<SensorType>('turbidity');
  const [showAll, setShowAll] = useState<boolean>(false);

  const config = SENSOR_CONFIGS[selectedSensor];

  // We take the last 20 data points for smooth real-time viewing
  const dataPoints = history.slice(-20);

  const svgWidth = 700;
  const svgHeight = 220;
  const padding = { top: 20, right: 30, bottom: 35, left: 50 };

  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Normalized bounds based on sensor
  const yMin = Math.min(
    config.minRange,
    ...dataPoints.map(d => d[selectedSensor])
  );
  const yMax = Math.max(
    config.maxRange,
    ...dataPoints.map(d => d[selectedSensor])
  );

  const getY = (val: number) => {
    if (yMax === yMin) return padding.top + plotHeight / 2;
    const ratio = (val - yMin) / (yMax - yMin);
    return padding.top + plotHeight - ratio * plotHeight;
  };

  const getX = (index: number) => {
    if (dataPoints.length <= 1) return padding.left;
    return padding.left + (index / (dataPoints.length - 1)) * plotWidth;
  };

  // Build SVG path
  const linePath = dataPoints.reduce((acc, point, idx) => {
    const x = getX(idx);
    const y = getY(point[selectedSensor]);
    return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Fill area path under curve
  const areaPath = dataPoints.length > 0
    ? `${linePath} L ${getX(dataPoints.length - 1)} ${padding.top + plotHeight} L ${getX(0)} ${padding.top + plotHeight} Z`
    : '';

  // Safe boundary lines
  const safeMinY = getY(config.safeMin);
  const safeMaxY = getY(config.safeMax);

  const getSensorColor = (type: SensorType) => {
    switch (type) {
      case 'ph':
        return { stroke: '#06b6d4', fill: 'rgba(6, 182, 212, 0.15)', name: 'Cyan' };
      case 'turbidity':
        return { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.15)', name: 'Blue' };
      case 'tds':
        return { stroke: '#818cf8', fill: 'rgba(129, 140, 248, 0.15)', name: 'Indigo' };
      case 'temperature':
        return { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.15)', name: 'Amber' };
    }
  };

  const colors = getSensorColor(selectedSensor);

  return (
    <div id="real-time-monitoring-graph" className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Real-Time Telemetry Stream</h3>
            <p className="text-xs text-slate-400">Live oscillating trend &amp; dynamic threshold bounds</p>
          </div>
        </div>

        {/* Sensor selector tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 self-start sm:self-auto overflow-x-auto max-w-full">
          {(['turbidity', 'ph', 'tds', 'temperature'] as SensorType[]).map(type => (
            <button
              key={type}
              id={`chart-tab-${type}`}
              onClick={() => setSelectedSensor(type)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                selectedSensor === type
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {SENSOR_CONFIGS[type].name.split(' ')[0]} ({SENSOR_CONFIGS[type].unit})
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[500px] overflow-visible select-none"
        >
          <defs>
            <linearGradient id={`grad-${selectedSensor}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.stroke} stopOpacity="0.35" />
              <stop offset="100%" stopColor={colors.stroke} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
            const y = padding.top + plotHeight * p;
            const val = yMax - p * (yMax - yMin);
            return (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={svgWidth - padding.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="end"
                >
                  {val.toFixed(config.decimals <= 1 ? 1 : 2)}
                </text>
              </g>
            );
          })}

          {/* Safe Range Area Tint */}
          {safeMinY && safeMaxY && (
            <rect
              x={padding.left}
              y={Math.min(safeMinY, safeMaxY)}
              width={plotWidth}
              height={Math.abs(safeMinY - safeMaxY)}
              fill="rgba(16, 185, 129, 0.06)"
              stroke="rgba(16, 185, 129, 0.2)"
              strokeDasharray="3 3"
            />
          )}

          {/* Safe threshold horizontal lines */}
          <line
            x1={padding.left}
            y1={safeMaxY}
            x2={svgWidth - padding.right}
            y2={safeMaxY}
            stroke="#10b981"
            strokeDasharray="4 4"
            strokeWidth="1.2"
          />
          <text
            x={svgWidth - padding.right}
            y={safeMaxY - 4}
            fill="#10b981"
            fontSize="9"
            fontFamily="monospace"
            textAnchor="end"
          >
            Safe Max: {config.safeMax} {config.unit}
          </text>

          {config.safeMin > config.minRange && (
            <>
              <line
                x1={padding.left}
                y1={safeMinY}
                x2={svgWidth - padding.right}
                y2={safeMinY}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth="1.2"
              />
              <text
                x={svgWidth - padding.right}
                y={safeMinY + 12}
                fill="#10b981"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="end"
              >
                Safe Min: {config.safeMin} {config.unit}
              </text>
            </>
          )}

          {/* Gradient filled area */}
          {areaPath && <path d={areaPath} fill={`url(#grad-${selectedSensor})`} />}

          {/* Data series line */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke={colors.stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data point markers */}
          {dataPoints.map((point, idx) => {
            const x = getX(idx);
            const val = point[selectedSensor];
            const y = getY(val);
            const isBreach = val < config.safeMin || val > config.safeMax;

            return (
              <g key={`${point.id}-${idx}`} className="transition-transform duration-200">
                <circle
                  cx={x}
                  cy={y}
                  r={isBreach ? 5 : 3.5}
                  fill={isBreach ? '#ef4444' : colors.stroke}
                  stroke="#0f172a"
                  strokeWidth="2"
                  className={isBreach ? 'animate-ping' : ''}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={isBreach ? 4 : 3}
                  fill={isBreach ? '#ef4444' : '#0f172a'}
                  stroke={isBreach ? '#fff' : colors.stroke}
                  strokeWidth="1.5"
                />
              </g>
            );
          })}

          {/* X Axis Time Labels */}
          {dataPoints.map((point, idx) => {
            if (idx % 4 !== 0 && idx !== dataPoints.length - 1) return null;
            const x = getX(idx);
            return (
              <text
                key={`time-${idx}`}
                x={x}
                y={svgHeight - 8}
                fill="#64748b"
                fontSize="9"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {point.timeLabel}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Chart Footer Indicator */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" />
            <span>Active Stream ({config.name})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-emerald-400 inline-block" />
            <span>Safe Threshold Band</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span>Anomaly / Breach Point</span>
          </div>
        </div>
        <div className="font-mono text-slate-400">
          Last Reading: <span className="text-white font-bold">{dataPoints[dataPoints.length - 1]?.[selectedSensor]?.toFixed(config.decimals)} {config.unit}</span>
        </div>
      </div>
    </div>
  );
};
