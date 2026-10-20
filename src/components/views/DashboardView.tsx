import React from 'react';
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

  return (
    <div id="dashboard-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Fast Preset Action Bar */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 p-5 shadow-xl">
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
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Continuous multi-parametric analysis of physical and chemical water characteristics with autonomous threshold violation detection.
            </p>
          </div>

          {/* Quick Simulation Presets */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto bg-slate-950/70 p-2 rounded-xl border border-slate-800">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
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
            <div className="text-xs font-semibold text-slate-400 mb-1">pH Acidity Baseline</div>
            <div className="text-lg font-bold font-mono text-cyan-300">
              {sensorValues.ph.toFixed(2)} <span className="text-xs font-normal text-slate-400">pH</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
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
