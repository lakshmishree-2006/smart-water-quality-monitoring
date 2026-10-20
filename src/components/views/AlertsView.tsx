import React, { useState } from 'react';
import { AlertItem, SensorType, StatusLevel } from '../../types';
import { SENSOR_CONFIGS } from '../../data/mockData';
import {
  Bell,
  ShieldAlert,
  AlertTriangle,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  Trash2,
  Filter,
  Radio,
  Clock,
} from 'lucide-react';

interface AlertsViewProps {
  alerts: AlertItem[];
  onSelectAlert: (alert: AlertItem) => void;
  onClearAlerts: () => void;
  onOpenLatestSms: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onSelectAlert,
  onClearAlerts,
  onOpenLatestSms,
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [filterSensor, setFilterSensor] = useState<string>('ALL');

  const filteredAlerts = alerts.filter((alert) => {
    if (filterLevel !== 'ALL' && alert.status !== filterLevel) return false;
    if (filterSensor !== 'ALL' && alert.sensorId !== filterSensor) return false;
    return true;
  });

  const criticalCount = alerts.filter((a) => a.status === 'CRITICAL').length;
  const warningCount = alerts.filter((a) => a.status === 'WARNING').length;

  return (
    <div id="alerts-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Contamination Incident &amp; Alert Log
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Automated threshold breach history and simulated GSM SMS cellular transmissions.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {alerts.length > 0 && (
              <>
                <button
                  id="alerts-open-latest-sms"
                  onClick={onOpenLatestSms}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shadow-md"
                >
                  <Smartphone className="w-4 h-4" />
                  View Latest SMS
                </button>
                <button
                  id="alerts-clear-all-btn"
                  onClick={onClearAlerts}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Logged Incidents</span>
            <span className="text-base font-bold font-mono text-white">{alerts.length}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Critical Breaches</span>
            <span className="text-base font-bold font-mono text-rose-400">{criticalCount}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Warning Thresholds</span>
            <span className="text-base font-bold font-mono text-amber-400">{warningCount}</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            Severity:
          </span>
          {['ALL', 'CRITICAL', 'WARNING'].map((lvl) => (
            <button
              key={lvl}
              id={`filter-lvl-${lvl}`}
              onClick={() => setFilterLevel(lvl)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterLevel === lvl
                  ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Sensor:</span>
          <select
            id="filter-sensor-select"
            value={filterSensor}
            onChange={(e) => setFilterSensor(e.target.value)}
            className="bg-slate-950 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="ALL">All Sensors</option>
            <option value="turbidity">Turbidity (NTU)</option>
            <option value="ph">pH Level</option>
            <option value="tds">Total Dissolved Solids (TDS)</option>
            <option value="temperature">Temperature (°C)</option>
          </select>
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-80" />
            <h3 className="text-base font-bold text-slate-200">No Incident Records Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              There are no alert incidents matching the current filter. Use the Simulation Controller to trigger test anomalies.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isCritical = alert.status === 'CRITICAL';
            return (
              <div
                key={alert.id}
                id={`alert-row-${alert.id}`}
                className={`p-4 rounded-xl border transition-all ${
                  isCritical
                    ? 'bg-slate-900/90 border-rose-900/60 hover:border-rose-700/80 shadow-md'
                    : 'bg-slate-900/90 border-amber-900/60 hover:border-amber-700/80 shadow-md'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                        isCritical
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {isCritical ? (
                        <ShieldAlert className="w-5 h-5 animate-pulse" />
                      ) : (
                        <AlertTriangle className="w-5 h-5" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-100">{alert.sensorName}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isCritical
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {alert.status}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {alert.timestamp}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300">
                        Recorded Value:{' '}
                        <span className="font-mono font-bold text-white">
                          {alert.detectedValue} {alert.unit}
                        </span>{' '}
                        • Safe Limit: <span className="font-mono text-emerald-400">{alert.safeThreshold}</span>
                      </div>

                      <p className="text-xs text-slate-400">{alert.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <button
                      id={`inspect-sms-${alert.id}`}
                      onClick={() => onSelectAlert(alert)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Inspect Simulated SMS
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
