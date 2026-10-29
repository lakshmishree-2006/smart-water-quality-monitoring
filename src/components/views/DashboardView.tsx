import React, { useEffect, useRef, useState } from 'react';
import { SensorCard } from '../SensorCard';
import { RealTimeChart } from '../RealTimeChart';
import { RecentAlerts } from '../RecentAlerts';
import { SENSOR_CONFIGS } from '../../data/mockData';
import { AlertItem, HistoryRecord, SensorStateMap, SensorType, StatusLevel } from '../../types';
import { Droplet, ShieldCheck, ShieldAlert, Sparkles, TrendingUp, Cpu, SlidersHorizontal } from 'lucide-react';

interface DashboardViewProps {
  sensorValues: SensorStateMap;
  sensorStatuses: Record<SensorType, StatusLevel>;
  overallStatus: 'SAFE' | 'CONTAMINATED';
  wqi: { score: number; rating: string; color: string };
  history: HistoryRecord[];
  alerts: AlertItem[];
  firebaseConnected?: boolean;
  onSelectAlert: (alert: AlertItem) => void;
  onOpenController: () => void;
  onClearAlerts: () => void;
  onSimulatePreset: (presetName: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  sensorValues,
  sensorStatuses,
  overallStatus,
  wqi,
  history,
  alerts,
  firebaseConnected = true,
  onSelectAlert,
  onOpenController,
  onClearAlerts,
  onSimulatePreset,
}) => {
  const isContaminated = overallStatus === 'CONTAMINATED';
  const [bannerAlert, setBannerAlert] = useState<AlertItem | null>(null);

const lastSeenAlertId = useRef(alerts[0]?.id);

useEffect(() => {
  const latestAlert = alerts[0];

  if (!latestAlert || latestAlert.id === lastSeenAlertId.current) {
    return;
  }

  lastSeenAlertId.current = latestAlert.id;

  if (
    latestAlert.status === 'CRITICAL' ||
    latestAlert.status === 'WARNING'
  ) {
    setBannerAlert(latestAlert);
  }
}, [alerts]);
  const [flashLevel, setFlashLevel] = useState<'CRITICAL' | 'WARNING' | null>(null);

useEffect(() => {
  const latestAlert = alerts[0];

  if (!latestAlert || latestAlert.status === 'NORMAL') return;

  setFlashLevel(latestAlert.status === 'CRITICAL' ? 'CRITICAL' : 'WARNING');

  const timer = window.setTimeout(() => {
    setFlashLevel(null);
  }, 1800);

  return () => window.clearTimeout(timer);
}, [alerts]);

  return (
    <div id="dashboard-view" className="space-y-6 animate-in fade-in duration-300">
      {bannerAlert && (
  <div
    role="alert"
    className={`animate-in slide-in-from-top-3 fade-in duration-300 rounded-xl border p-4 shadow-lg ${
      bannerAlert.status === 'CRITICAL'
        ? 'border-rose-500/60 bg-rose-950/90'
        : 'border-amber-500/60 bg-amber-950/90'
    }`}
  >
    <div className="flex items-start gap-3">
      <ShieldAlert
        className={`mt-0.5 h-6 w-6 shrink-0 ${
          bannerAlert.status === 'CRITICAL'
            ? 'text-rose-400'
            : 'text-amber-400'
        }`}
      />

      <div className="min-w-0 flex-1">
        <h3
          className={`text-sm font-extrabold tracking-wide ${
            bannerAlert.status === 'CRITICAL'
              ? 'text-rose-300'
              : 'text-amber-300'
          }`}
        >
          {bannerAlert.status === 'CRITICAL'
            ? 'CRITICAL WATER QUALITY ALERT'
            : 'WATER QUALITY WARNING'}
        </h3>

        <p className="mt-1 text-sm font-semibold text-white">
          {bannerAlert.sensorName} threshold exceeded
        </p>

        <p className="mt-1 text-xs text-slate-300">
          Detected: {bannerAlert.detectedValue} {bannerAlert.unit}
          {' · '}Safe threshold: {bannerAlert.safeThreshold}
        </p>

        <button
          onClick={() => {
            onSelectAlert(bannerAlert);
            setBannerAlert(null);
          }}
          className="mt-3 rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20"
        >
          VIEW ALERT DETAILS →
        </button>
      </div>

      <button
        onClick={() => setBannerAlert(null)}
        aria-label="Dismiss alert banner"
        className="rounded-md p-1 text-slate-300 hover:bg-white/10 hover:text-white"
      >
        ✕
      </button>
    </div>
  </div>
)}
      {flashLevel && (
  <div
    key={flashLevel}
    className={`pointer-events-none fixed inset-0 z-[9999] ${
      flashLevel === 'CRITICAL'
        ? 'animate-flash-red'
        : 'animate-flash-amber'
    }`}
    aria-hidden="true"
  />
)}
      {/* Top Banner & Fast Preset Action Bar */}
      
<div className="rounded-2xl border border-sky-100 bg-gradient-to-r from-slate-800 via-slate-800 to-slate-900 border border-slate-700 p-5 shadow-sm">

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Water Quality Telemetry Matrix
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">Node ID: ESP32-WQM-01</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Real-Time Water Monitoring Overview
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-2 leading-6">
              Continuous multi-parametric analysis of physical and chemical water characteristics with autonomous threshold violation detection.
            </p>
          </div>

          {/* Quick Simulation Presets */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto bg-white p-2 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-400 font-semibold px-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              Quick Triggers:
            </span>
            <button
              id="dash-quick-turbidity"
              onClick={() => onSimulatePreset('turbidity')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-950/80 text-blue-300 border border-blue-800/80 hover:bg-blue-900 transition-colors cursor-pointer"
            >
              High Turbidity
            </button>
            <button
              id="dash-quick-ph"
              onClick={() => onSimulatePreset('ph')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 hover:bg-cyan-900 transition-colors cursor-pointer"
            >
              Low pH
            </button>
            <button
              id="dash-quick-tds"
              onClick={() => onSimulatePreset('tds')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 hover:bg-indigo-900 transition-colors cursor-pointer"
            >
              High TDS
            </button>
            <button
              id="dash-quick-temp"
              onClick={() => onSimulatePreset('temp')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-950/80 text-amber-300 border border-amber-800/80 hover:bg-amber-900 transition-colors cursor-pointer"
            >
              High Temp
            </button>
            <button
              id="dash-quick-normal"
              onClick={() => onSimulatePreset('normal')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 hover:bg-emerald-900 transition-colors cursor-pointer"
            >
              Reset Normal
            </button>
          </div>
        </div>
      </div>

      {/* 4 Sensor Parameter Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SensorCard
          config={SENSOR_CONFIGS.ph}
          value={sensorValues.ph}
          status={sensorStatuses.ph}
          onOpenController={onOpenController}
        />
        <SensorCard
          config={SENSOR_CONFIGS.turbidity}
          value={sensorValues.turbidity}
          status={sensorStatuses.turbidity}
          isFirebaseLive={firebaseConnected}
          onOpenController={onOpenController}
        />
        <SensorCard
          config={SENSOR_CONFIGS.tds}
          value={sensorValues.tds}
          status={sensorStatuses.tds}
          onOpenController={onOpenController}
        />
        <SensorCard
          config={SENSOR_CONFIGS.temperature}
          value={sensorValues.temperature}
          status={sensorStatuses.temperature}
          onOpenController={onOpenController}
        />
      </div>

      {/* Real-time Monitoring Graph & Recent Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RealTimeChart history={history} />
        </div>
        <div className="lg:col-span-1">
          <RecentAlerts
            alerts={alerts}
            onSelectAlert={onSelectAlert}
            onClearAlerts={onClearAlerts}
          />
        </div>
      </div>

      {/* Historical Trends & Parameter Comparison Metrics */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">Historical Trends &amp; Baseline Quality Summary</h3>
              <p className="text-xs text-slate-400">Baseline safety limits vs current live telemetry</p>
            </div>
          </div>
          <button
            id="view-full-history-btn"
            onClick={() => onOpenController()}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
          >
            Adjust Simulation &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs font-semibold text-slate-200 mb-1">pH Acidity Baseline</div>
            <div className="text-lg font-bold font-mono text-cyan-300">
              {sensorValues.ph.toFixed(2)} <span className="text-xs font-normal text-slate-400">pH</span>
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              Std. Potable Range: 6.5 – 8.5
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs font-semibold text-slate-400 mb-1">Turbidity Haziness</div>
            <div className="text-lg font-bold font-mono text-blue-300">
              {sensorValues.turbidity.toFixed(2)} <span className="text-xs font-normal text-slate-400">NTU</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              WHO Clean Threshold: &le; 5.0 NTU
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs font-semibold text-slate-400 mb-1">Total Dissolved Solids</div>
            <div className="text-lg font-bold font-mono text-indigo-300">
              {sensorValues.tds} <span className="text-xs font-normal text-slate-400">ppm</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Safe Mineral Band: 50 – 500 ppm
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className="text-xs font-semibold text-slate-400 mb-1">Water Temperature</div>
            <div className="text-lg font-bold font-mono text-amber-300">
              {sensorValues.temperature.toFixed(1)} <span className="text-xs font-normal text-slate-400">°C</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Optimal Thermal: 15.0 – 25.0 °C
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
