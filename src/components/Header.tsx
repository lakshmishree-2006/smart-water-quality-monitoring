import React from 'react';
import { ShieldCheck, ShieldAlert, Radio, Bell, RefreshCw, Smartphone, Zap, Database } from 'lucide-react';
import { AlertItem, StatusLevel } from '../types';

interface HeaderProps {
  overallStatus: 'SAFE' | 'CONTAMINATED';
  wqi: { score: number; rating: string; color: string };
  criticalCount: number;
  warningCount: number;
  latestAlert: AlertItem | null;
  firebaseConnected: boolean;
  firebaseLastUpdated: string | null;
  onOpenLatestSms: () => void;
  onResetToNormal: () => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  overallStatus,
  wqi,
  criticalCount,
  warningCount,
  latestAlert,
  firebaseConnected,
  firebaseLastUpdated,
  onOpenLatestSms,
  onResetToNormal,
  isStreaming,
  onToggleStreaming,
}) => {
  const isContaminated = overallStatus === 'CONTAMINATED';

  return (
    <header id="app-header" className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-700 shadow-lg shadow-black/20">
      {/* Contamination Alert Banner (if contaminated) */}
      {isContaminated && (
        <div
          id="contamination-alert-banner"
          className="bg-gradient-to-r from-rose-950 via-rose-900 to-rose-950 text-white px-4 py-2 text-xs md:text-sm font-semibold flex items-center justify-between border-b border-rose-700/80 shadow-[0_4px_20px_rgba(225,29,72,0.4)] animate-pulse"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-300 shrink-0" />
            <span>
              <strong className="tracking-wide">CONTAMINATION DETECTED:</strong> One or more water quality sensors have exceeded defined safe thresholds!
            </span>
          </div>

          <div className="flex items-center gap-2">
            {latestAlert && (
              <button
                id="banner-view-sms-btn"
                onClick={onOpenLatestSms}
                className="flex items-center gap-1 bg-white text-rose-900 hover:bg-rose-100 text-xs px-2.5 py-1 rounded-md font-bold transition-all shadow cursor-pointer whitespace-nowrap"
              >
                <Smartphone className="w-3.5 h-3.5" />
                View SMS Alert
              </button>
            )}
            <button
              id="banner-reset-btn"
              onClick={onResetToNormal}
              className="bg-rose-950/80 hover:bg-rose-950 text-rose-200 text-xs px-2.5 py-1 rounded-md border border-rose-600 transition-all cursor-pointer whitespace-nowrap"
            >
              Reset Normal
            </button>
          </div>
        </div>
      )}

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Project Branding & Node telemetry */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 shadow-inner">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white">
                Smart Water Quality Monitoring System
              </h1>
              <span className="hidden sm:inline-block text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
                ESP32 Node 01
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Contamination Alert Network • College Mini Project Demonstration
            </p>
          </div>
        </div>

        {/* Right: Telemetry status indicators & Quick actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Firebase Realtime Database Status Badge */}
          <div
            id="firebase-status-indicator"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              firebaseConnected
                ? 'bg-amber-950/40 text-amber-300 border-amber-600/50 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                : 'bg-slate-900 text-slate-400 border-slate-700'
            }`}
            title="Firebase Realtime Database: smart-water-quality-84a25 (/turbidity)"
          >
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  firebaseConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                }`}
              />
              <span className="font-bold">Firebase RTDB:</span>
              <span className={firebaseConnected ? 'text-emerald-300' : 'text-amber-300'}>
                {firebaseConnected ? 'Live' : 'Connected'}
              </span>
            </span>
          </div>

          {/* Live stream toggle */}
          <button
            id="toggle-live-stream-btn"
            onClick={onToggleStreaming}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              isStreaming
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900/40'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800'
            }`}
            title="Toggle simulated micro-fluctuations"
          >
            <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
            {isStreaming ? 'Live Stream ON' : 'Live Stream Paused'}
          </button>

          {/* Overall Water Quality Score Badge */}
          <div
            id="overall-wqi-indicator"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800"
          >
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400">Water Quality Index</div>
              <div className={`text-xs font-bold ${wqi.color}`}>{wqi.rating}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-cyan-500/15 border-2 border-cyan-400/60 flex items-center justify-center font-mono font-black text-sm text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.15)]">
  {wqi.score}
</div>
          </div>

          {/* Overall Status Badge: SAFE vs CONTAMINATED */}
          <div
            id="overall-status-badge"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-wider border shadow-sm ${
              isContaminated
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
            }`}
          >
            {isContaminated ? (
              <>
                <ShieldAlert className="w-4 h-4 text-rose-400 animate-bounce" />
                CONTAMINATED
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                SAFE
              </>
            )}
          </div>

          {/* Simulated SMS Quick Access Button */}
          {latestAlert && (
            <button
              id="header-open-sms-btn"
              onClick={onOpenLatestSms}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 transition-colors cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Simulated</span> SMS
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
