import React from 'react';
import { AlertTriangle, ShieldAlert, MessageSquare, CheckCircle2, Clock } from 'lucide-react';
import { AlertItem } from '../types';

interface RecentAlertsProps {
  alerts: AlertItem[];
  onSelectAlert: (alert: AlertItem) => void;
  onClearAlerts?: () => void;
}

export const RecentAlerts: React.FC<RecentAlertsProps> = ({
  alerts,
  onSelectAlert,
  onClearAlerts,
}) => {
  const recentList = alerts.slice(0, 5);

  return (
    <div id="recent-alerts-widget" className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100">Recent Alerts &amp; Incidents</h3>
            <p className="text-xs text-slate-400">Automated threshold triggers</p>
          </div>
        </div>

        {alerts.length > 0 && onClearAlerts && (
          <button
            id="clear-alerts-btn"
            onClick={onClearAlerts}
            className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Alerts list */}
      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[290px] pr-1">
        {recentList.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-lg bg-slate-950/40">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2 opacity-80" />
            <p className="text-sm font-semibold text-slate-300">All Parameters Normal</p>
            <p className="text-xs text-slate-400 max-w-[220px] mt-1">
              No contamination or threshold breaches detected in the active stream.
            </p>
          </div>
        ) : (
          recentList.map((alert) => {
            const isCritical = alert.status === 'CRITICAL';
            return (
              <div
                key={alert.id}
                id={`alert-item-${alert.id}`}
                onClick={() => onSelectAlert(alert)}
                className={`p-3 rounded-lg border transition-all cursor-pointer group flex flex-col gap-1.5 ${
                  isCritical
                    ? 'bg-rose-950/30 hover:bg-rose-950/50 border-rose-900/60'
                    : 'bg-amber-950/30 hover:bg-amber-950/50 border-amber-900/60'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {isCritical ? (
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-pulse" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <span className="font-semibold text-xs text-slate-200">
                      {alert.sensorName}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {alert.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  Value: <span className="font-mono font-bold text-white">{alert.detectedValue} {alert.unit}</span> (Safe: {alert.safeThreshold})
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {alert.timestamp}
                  </span>
                  <span className="inline-flex items-center gap-1 text-cyan-400 group-hover:underline font-medium">
                    <MessageSquare className="w-3 h-3" />
                    View SMS Alert
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {alerts.length > 5 && (
        <p className="text-center text-xs text-slate-400 mt-2">
          + {alerts.length - 5} more in Alerts tab
        </p>
      )}
    </div>
  );
};
