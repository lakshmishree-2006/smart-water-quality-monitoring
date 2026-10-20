import React from 'react';
import { Droplet, Waves, Activity, Thermometer, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { SensorConfig, StatusLevel } from '../types';
import { Gauge } from './Gauge';

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
  const getIcon = () => {
    switch (config.id) {
      case 'ph':
        return <Droplet className="w-5 h-5 text-cyan-400" />;
      case 'turbidity':
        return <Waves className="w-5 h-5 text-blue-400" />;
      case 'tds':
        return <Activity className="w-5 h-5 text-indigo-400" />;
      case 'temperature':
        return <Thermometer className="w-5 h-5 text-amber-400" />;
      default:
        return <Droplet className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5" />
            CRITICAL
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/50">
            <AlertTriangle className="w-3.5 h-3.5" />
            WARNING
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            NORMAL
          </span>
        );
    }
  };

  const isAlert = status !== 'NORMAL';

  return (
    <div
      id={`sensor-card-${config.id}`}
      className={`relative overflow-hidden rounded-xl bg-slate-900/90 border backdrop-blur-md p-5 transition-all duration-300 ${
        status === 'CRITICAL'
          ? 'border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.3)] ring-1 ring-rose-500/50 bg-rose-950/20'
          : status === 'WARNING'
          ? 'border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.2)] bg-amber-950/20'
          : 'border-slate-800 hover:border-slate-700 shadow-lg'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60 shadow-inner">
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-sm text-slate-100 tracking-wide">{config.name}</h3>
              {isFirebaseLive && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Firebase RTDB
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {isFirebaseLive ? 'Firebase path: /turbidity' : `Node Channel: ${config.id.toUpperCase()}`}
            </p>
          </div>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      {/* Visual Gauge */}
      <div className="my-1 py-1 flex items-center justify-center">
        <Gauge value={value} config={config} status={status} />
      </div>

      {/* Safe Range & Stats */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Safe Range:</span>
          <span className="font-mono font-semibold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
            {config.safeMin} – {config.safeMax} {config.unit}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Operating Limit:</span>
          <span className="font-mono text-slate-300">
            {config.minRange} to {config.maxRange} {config.unit}
          </span>
        </div>
      </div>

      {/* Alert Warning message if breach occurs */}
      {isAlert && (
        <div
          id={`alert-badge-${config.id}`}
          className={`mt-3 p-2 rounded-lg text-xs flex items-center justify-between ${
            status === 'CRITICAL'
              ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60'
              : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
          }`}
        >
          <span className="font-medium truncate">
            {status === 'CRITICAL' ? 'Critical threshold breach!' : 'Outside optimal safe zone!'}
          </span>
          {onOpenController && (
            <button
              id={`adjust-btn-${config.id}`}
              onClick={onOpenController}
              className="ml-2 underline font-semibold cursor-pointer hover:text-white shrink-0"
            >
              Adjust
            </button>
          )}
        </div>
      )}
    </div>
  );
};
