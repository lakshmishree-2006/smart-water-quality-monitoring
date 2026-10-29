import React from 'react';
import { SENSOR_CONFIGS } from '../../data/mockData';
import { SensorStateMap, SensorType, StatusLevel } from '../../types';
import { evaluateSensorStatus } from '../../utils/waterQuality';
import {
  Sliders,
  RotateCcw,
  AlertTriangle,
  Flame,
  Droplets,
  Zap,
  Activity,
  CheckCircle2,
  ShieldAlert,
  Info,
  Layers,
} from 'lucide-react';

interface ControllerViewProps {
  sensorValues: SensorStateMap;
  onUpdateSensor: (sensorId: SensorType, value: number) => void;
  onSimulateHighTurbidity: () => void;
  onSimulateLowPh: () => void;
  onSimulateHighTds: () => void;
  onSimulateHighTemp: () => void;
  onResetToNormal: () => void;
  onApplyScenario: (name: string, values: Partial<SensorStateMap>) => void;
  isStreaming: boolean;
  onToggleStreaming: () => void;
}

export const ControllerView: React.FC<ControllerViewProps> = ({
  sensorValues,
  onUpdateSensor,
  onSimulateHighTurbidity,
  onSimulateLowPh,
  onSimulateHighTds,
  onSimulateHighTemp,
  onResetToNormal,
  onApplyScenario,
  isStreaming,
  onToggleStreaming,
}) => {
  const getStatusBadge = (sensorId: SensorType, val: number) => {
    const status: StatusLevel = evaluateSensorStatus(sensorId, val);
    if (status === 'CRITICAL') {
      return (
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/50 flex items-center gap-1">
          <ShieldAlert className="w-3 h-3" />
          CRITICAL BREACH
        </span>
      );
    }
    if (status === 'WARNING') {
      return (
        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/50 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          WARNING
        </span>
      );
    }
    return (
      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
        <CheckCircle2 className="w-3 h-3" />
        SAFE NORMAL
      </span>
    );
  };

  const renderSensorControl = (sensorId: SensorType) => {
    const config = SENSOR_CONFIGS[sensorId];
    const value = sensorValues[sensorId];
    const status = evaluateSensorStatus(sensorId, value);

    const isBreach = status !== 'NORMAL';

    return (
      <div
        key={sensorId}
        id={`controller-card-${sensorId}`}
        className={`p-5 rounded-xl border transition-all ${
          status === 'CRITICAL'
            ? 'bg-rose-950/25 border-rose-700/80 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
            : status === 'WARNING'
            ? 'bg-amber-950/25 border-amber-700/80'
            : 'bg-slate-800/90 border-slate-700 shadow-lg shadow-black/20 hover:border-cyan-500/40'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-slate-100">{config.name}</h4>
              <span className="text-xs text-slate-400 font-mono">({config.unit})</span>
            </div>
            <p className="text-xs text-slate-400">{config.description}</p>
          </div>
          <div>{getStatusBadge(sensorId, value)}</div>
        </div>

        {/* Value and Step Controls */}
        <div className="flex items-center gap-3 my-3">
          <button
            id={`step-down-${sensorId}`}
            onClick={() => {
              const next = Math.max(config.minRange, value - config.step * 2);
              onUpdateSensor(sensorId, Number(next.toFixed(config.decimals)));
            }}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center border border-slate-700 cursor-pointer text-sm"
          >
            -
          </button>

          <div className="flex-1 text-center bg-slate-950 px-4 py-2 rounded-lg border border-slate-700 shadow-inner">
            <span className="font-mono text-xl font-extrabold text-white tracking-wide">
              {value.toFixed(config.decimals)}
            </span>
            <span className="ml-1 text-xs font-semibold text-slate-400">{config.unit}</span>
          </div>

          <button
            id={`step-up-${sensorId}`}
            onClick={() => {
              const next = Math.min(config.maxRange, value + config.step * 2);
              onUpdateSensor(sensorId, Number(next.toFixed(config.decimals)));
            }}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center justify-center border border-slate-700 cursor-pointer text-sm"
          >
            +
          </button>
        </div>

        {/* Range Slider */}
        <div className="space-y-1.5">
          <input
            id={`slider-${sensorId}`}
            type="range"
            min={config.minRange}
            max={config.maxRange}
            step={config.step}
            value={value}
            onChange={(e) => onUpdateSensor(sensorId, parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />

          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>Min: {config.minRange}</span>
            <span className="text-emerald-400 font-semibold">
              Safe: {config.safeMin} – {config.safeMax} {config.unit}
            </span>
            <span>Max: {config.maxRange}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="simulation-controller-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Intro Header */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Simulated IoT Sensor Controller
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Interactive control panel for demonstrating sensor variations, safety threshold triggers, and GSM SMS dispatches.
              </p>
            </div>
          </div>

          <button
            id="controller-reset-all-btn"
            onClick={onResetToNormal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-950/50 cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Normal
          </button>
        </div>
      </div>

      {/* Required Preset Buttons */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            Specific Contamination Test Presets
          </h3>
          <span className="text-xs text-slate-400">Single-click project guide demo triggers</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            id="btn-simulate-high-turbidity"
            onClick={onSimulateHighTurbidity}
            className="flex flex-col items-center justify-center text-center p-3.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 text-blue-200 border border-blue-700/60 transition-all shadow cursor-pointer group"
          >
            <Droplets className="w-5 h-5 text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs">Simulate High Turbidity</span>
            <span className="text-[10px] text-blue-300/80 font-mono mt-0.5">8.80 NTU (Critical)</span>
          </button>

          <button
            id="btn-simulate-low-ph"
            onClick={onSimulateLowPh}
            className="flex flex-col items-center justify-center text-center p-3.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border border-rose-700/60 transition-all shadow cursor-pointer group"
          >
            <AlertTriangle className="w-5 h-5 text-rose-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs">Simulate Low pH</span>
            <span className="text-[10px] text-rose-300/80 font-mono mt-0.5">4.80 pH (Acidic Spill)</span>
          </button>

          <button
            id="btn-simulate-high-tds"
            onClick={onSimulateHighTds}
            className="flex flex-col items-center justify-center text-center p-3.5 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-700/60 transition-all shadow cursor-pointer group"
          >
            <Activity className="w-5 h-5 text-indigo-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs">Simulate High TDS</span>
            <span className="text-[10px] text-indigo-300/80 font-mono mt-0.5">750 ppm (High Minerals)</span>
          </button>

          <button
            id="btn-simulate-high-temperature"
            onClick={onSimulateHighTemp}
            className="flex flex-col items-center justify-center text-center p-3.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border border-amber-700/60 transition-all shadow cursor-pointer group"
          >
            <Flame className="w-5 h-5 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs">Simulate High Temperature</span>
            <span className="text-[10px] text-amber-300/80 font-mono mt-0.5">34.5 °C (Thermal Shock)</span>
          </button>

          <button
            id="btn-reset-to-normal"
            onClick={onResetToNormal}
            className="flex flex-col items-center justify-center text-center p-3.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-200 border border-emerald-700/70 transition-all shadow cursor-pointer group"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs">Reset to Normal</span>
            <span className="text-[10px] text-emerald-300/80 font-mono mt-0.5">All Safe Baseline</span>
          </button>
        </div>
      </div>

      {/* Individual Parameter Precision Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {renderSensorControl('ph')}
        {renderSensorControl('turbidity')}
        {renderSensorControl('tds')}
        {renderSensorControl('temperature')}
      </div>

      {/* Advanced Environmental Scenarios */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Multi-Parametric Pollution Scenarios</h3>
            <p className="text-xs text-slate-400">Simulate complex real-world environmental contamination events</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            id="scenario-industrial-runoff"
            onClick={() =>
              onApplyScenario('Industrial Chemical Discharge', {
                ph: 4.5,
                turbidity: 11.2,
                tds: 820,
                temperature: 28.0,
              })
            }
            className="p-4 rounded-xl bg-slate-950 hover:bg-indigo-950/50 border border-slate-700 hover:border-indigo-500/60 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-950/30 cursor-pointer"
          >
            <div className="font-bold text-xs text-rose-400">Industrial Chemical Discharge</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Severe acid breach + high turbidity &amp; mineral solids.</p>
          </button>

          <button
            id="scenario-agricultural-runoff"
            onClick={() =>
              onApplyScenario('Agricultural Silt & Fertilizer Runoff', {
                ph: 8.9,
                turbidity: 14.5,
                tds: 620,
                temperature: 24.0,
              })
            }
            className="p-3 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-left transition-colors cursor-pointer"
          >
            <div className="font-bold text-xs text-amber-400">Agricultural Silt &amp; Fertilizer</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Heavy turbidity silt + elevated alkaline salts.</p>
          </button>

          <button
            id="scenario-thermal-effluent"
            onClick={() =>
              onApplyScenario('Power Plant Thermal Effluent', {
                ph: 7.4,
                turbidity: 1.2,
                tds: 180,
                temperature: 36.5,
              })
            }
            className="p-3 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 text-left transition-colors cursor-pointer"
          >
            <div className="font-bold text-xs text-amber-400">Power Plant Thermal Effluent</div>
            <p className="text-[11px] text-slate-400 mt-0.5">High heated cooling water breach (&gt; 35 °C).</p>
          </button>
        </div>
      </div>
    </div>
  );
};
