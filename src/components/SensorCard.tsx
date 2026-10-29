
import React from 'react';
import {
  Droplet,
  Waves,
  Activity,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import { SensorConfig, StatusLevel } from '../types';

interface SensorCardProps {
  config: SensorConfig;
  value: number;
  status: StatusLevel;
  isFirebaseLive?: boolean;
  onQuickSimulate?: (sensorId: string, val: number) => void;
  onOpenController?: () => void;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  config,
  value,
  status,
  isFirebaseLive,
  onOpenController,
}) => {
  const styles = {
    ph: {
      icon: Droplet,
      accent: 'text-violet-600',
      iconBg: 'bg-violet-100',
      border: 'border-violet-200',
      strip: 'bg-violet-500',
      soft: 'bg-violet-50',
      bar: 'bg-violet-500',
    },
    turbidity: {
      icon: Waves,
      accent: 'text-blue-600',
      iconBg: 'bg-blue-100',
      border: 'border-blue-200',
      strip: 'bg-blue-500',
      soft: 'bg-blue-50',
      bar: 'bg-blue-500',
    },
    tds: {
      icon: Activity,
      accent: 'text-teal-600',
      iconBg: 'bg-teal-100',
      border: 'border-teal-200',
      strip: 'bg-teal-500',
      soft: 'bg-teal-50',
      bar: 'bg-teal-500',
    },
    temperature: {
      icon: Thermometer,
      accent: 'text-orange-600',
      iconBg: 'bg-orange-100',
      border: 'border-orange-200',
      strip: 'bg-orange-500',
      soft: 'bg-orange-50',
      bar: 'bg-orange-500',
    },
  };

  const style = styles[config.id];
  const Icon = style.icon;
  const isAlert = status !== 'NORMAL';

  const statusStyle =
    status === 'CRITICAL'
      ? 'bg-rose-100 text-rose-700 border-rose-200'
      : status === 'WARNING'
      ? 'bg-amber-100 text-amber-700 border-amber-200'
      : 'bg-emerald-100 text-emerald-700 border-emerald-200';

  const statusLabel =
    status === 'CRITICAL'
      ? 'CRITICAL'
      : status === 'WARNING'
      ? 'WARNING'
      : 'NORMAL';

  const formatValue = () => {
    if (config.id === 'ph' || config.id === 'turbidity') {
      return value.toFixed(2);
    }
    if (config.id === 'temperature') {
      return value.toFixed(1);
    }
    return value.toLocaleString();
  };

  // A visual indicator of the value within the configured operating range.
  const range = config.maxRange - config.minRange;
  const progress = range > 0
    ? Math.max(0, Math.min(100, ((value - config.minRange) / range) * 100))
    : 0;

  return (
    <div
      id={`sensor-card-${config.id}`}
className={`relative overflow-hidden rounded-2xl border bg-slate-800 p-5 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
        isAlert ? 'border-rose-200' : style.border
      }`}
    >
      {/* Color accent */}
      <div className={`absolute left-0 top-0 h-1.5 w-full ${isAlert ? 'bg-gradient-to-r from-rose-500 to-orange-400' : `bg-gradient-to-r ${config.id === 'ph' ? 'from-violet-500 to-fuchsia-400' : config.id === 'turbidity' ? 'from-blue-500 to-cyan-400' : config.id === 'tds' ? 'from-teal-500 to-emerald-400' : 'from-orange-500 to-amber-400'}`}`} />

      {/* Parameter title and icon */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`shrink-0 rounded-lg p-2 ${style.iconBg}`}>
          <Icon className={`h-5 w-5 ${style.accent}`} />
          </div>

          <div>
            <h3 className="text-sm font-bold text-white">
              {config.name}
            </h3>
            <p className="mt-1 text-xs text-slate-300">
              {isFirebaseLive ? 'Firebase RTDB' : 'Demo / simulated reading'}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${statusStyle}`}
        >
          {status === 'CRITICAL' ? (
            <ShieldAlert className="h-3 w-3" />
          ) : status === 'WARNING' ? (
            <AlertTriangle className="h-3 w-3" />
          ) : (
            <CheckCircle2 className="h-3 w-3" />
          )}
          {statusLabel}
        </span>
      </div>

      {/* Large reading — no gauge */}
      <div className="mt-7 flex items-baseline gap-2">
       <span className={`text-3xl font-extrabold tracking-tight ${style.accent}`}>
          {formatValue()}
        </span>
        <span className="text-sm font-medium text-slate-500">
          {config.unit}
        </span>
      </div>

      <p className="mt-1 text-xs text-slate-300">Current parameter reading</p>

      {/* Simple horizontal range bar */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-slate-200">Operating range</span>
          <span className="font-semibold text-white">
            {Math.round(progress)}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isAlert ? 'bg-rose-500' : style.bar
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 flex justify-between text-[11px] text-slate-300">
          <span>{config.minRange}</span>
          <span>{config.maxRange}</span>
        </div>
      </div>

      {/* Safe range */}
     <div className="mt-4 rounded-xl border border-slate-600 bg-slate-700/70 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-slate-200">
            Safe range
          </span>
          <span className="text-xs font-bold text-white">
            {config.safeMin} – {config.safeMax} {config.unit}
          </span>
        </div>
      </div>

      {/* Firebase connection indicator */}
      {isFirebaseLive && (
        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
          Connected to Firebase RTDB
        </div>
      )}

      {/* Alert message */}
      {isAlert && (
        <div
          id={`alert-badge-${config.id}`}
          className={`mt-3 flex items-center justify-between gap-2 rounded-lg border p-3 text-xs ${
            status === 'CRITICAL'
              ? 'border-rose-200 bg-rose-50 text-rose-700'
              : 'border-amber-200 bg-amber-50 text-amber-700'
          }`}
        >
          <span className="font-medium">
            {status === 'CRITICAL'
              ? 'Critical threshold breach!'
              : 'Outside optimal safe zone!'}
          </span>

          {onOpenController && (
            <button
              id={`adjust-btn-${config.id}`}
              onClick={onOpenController}
              className="shrink-0 font-bold underline hover:opacity-70"
            >
              Adjust
            </button>
          )}
        </div>
      )}
    </div>
  );
};
