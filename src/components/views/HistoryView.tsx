import React, { useState } from 'react';
import { HistoryRecord, SensorType } from '../../types';
import { SENSOR_CONFIGS } from '../../data/mockData';
import {
  History,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Search,
  Table,
  BarChart3,
} from 'lucide-react';

interface HistoryViewProps {
  history: HistoryRecord[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history }) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [chartMetric, setChartMetric] = useState<SensorType>('turbidity');

  // Compute analytics summary
  const computeStats = (key: SensorType) => {
    if (history.length === 0) return { min: 0, avg: 0, max: 0 };
    const values = history.map((h) => h[key]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return {
      min: Number(min.toFixed(SENSOR_CONFIGS[key].decimals)),
      avg: Number(avg.toFixed(SENSOR_CONFIGS[key].decimals)),
      max: Number(max.toFixed(SENSOR_CONFIGS[key].decimals)),
    };
  };

  const stats = {
    ph: computeStats('ph'),
    turbidity: computeStats('turbidity'),
    tds: computeStats('tds'),
    temperature: computeStats('temperature'),
  };

  // Filter records
  const filteredHistory = history
    .slice()
    .reverse()
    .filter((rec) => {
      if (filterStatus !== 'ALL' && rec.overallStatus !== filterStatus) return false;
      if (searchTerm && !rec.timeLabel.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Time', 'pH', 'Turbidity (NTU)', 'TDS (ppm)', 'Temperature (°C)', 'WQI Score', 'Status'];
    const rows = history.map((r) => [
      r.timestamp,
      r.timeLabel,
      r.ph,
      r.turbidity,
      r.tds,
      r.temperature,
      r.wqi,
      r.overallStatus,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `water_quality_telemetry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="history-view" className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                Historical Telemetry &amp; Log Records
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Detailed time-series records of sampled parameters, sensor health, and threshold evaluation logs.
              </p>
            </div>
          </div>

          <button
            id="export-csv-btn"
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            Export CSV Dataset
          </button>
        </div>

        {/* Statistical summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800">
          {(['ph', 'turbidity', 'tds', 'temperature'] as SensorType[]).map((type) => {
            const cfg = SENSOR_CONFIGS[type];
            const s = stats[type];
            return (
              <div key={type} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <div className="text-xs font-bold text-slate-300 flex items-center justify-between mb-1.5">
                  <span>{cfg.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({cfg.unit})</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center font-mono text-xs">
                  <div className="bg-slate-900/80 p-1 rounded">
                    <div className="text-[9px] text-slate-400 uppercase font-sans">Min</div>
                    <div className="text-slate-200 font-bold">{s.min}</div>
                  </div>
                  <div className="bg-slate-900/80 p-1 rounded border border-cyan-900/40">
                    <div className="text-[9px] text-cyan-400 uppercase font-sans">Avg</div>
                    <div className="text-cyan-300 font-bold">{s.avg}</div>
                  </div>
                  <div className="bg-slate-900/80 p-1 rounded">
                    <div className="text-[9px] text-slate-400 uppercase font-sans">Max</div>
                    <div className="text-slate-200 font-bold">{s.max}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Table & Filter Controls */}
      <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-sm text-slate-100">Telemetry Data Log Table</h3>
            <span className="text-xs text-slate-400 font-mono">({filteredHistory.length} readings)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {['ALL', 'SAFE', 'CONTAMINATED'].map((st) => (
                <button
                  key={st}
                  id={`filter-hist-${st}`}
                  onClick={() => setFilterStatus(st)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    filterStatus === st
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4 text-right">pH (6.5-8.5)</th>
                <th className="py-3 px-4 text-right">Turbidity (0-5 NTU)</th>
                <th className="py-3 px-4 text-right">TDS (50-500 ppm)</th>
                <th className="py-3 px-4 text-right">Temp (15-25 °C)</th>
                <th className="py-3 px-4 text-center">WQI Score</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 font-mono">
              {filteredHistory.map((rec) => {
                const isContam = rec.overallStatus === 'CONTAMINATED';
                return (
                  <tr
                    key={rec.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isContam ? 'bg-rose-950/15 text-rose-200' : 'text-slate-300'
                    }`}
                  >
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                      {rec.timeLabel}
                    </td>

                    {/* pH */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={
                          rec.ph < 6.5 || rec.ph > 8.5
                            ? 'text-rose-400 font-bold bg-rose-950/60 px-1.5 py-0.5 rounded'
                            : 'text-cyan-300 font-semibold'
                        }
                      >
                        {rec.ph.toFixed(2)}
                      </span>
                    </td>

                    {/* Turbidity */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={
                          rec.turbidity > 5.0
                            ? 'text-rose-400 font-bold bg-rose-950/60 px-1.5 py-0.5 rounded'
                            : 'text-blue-300 font-semibold'
                        }
                      >
                        {rec.turbidity.toFixed(2)} NTU
                      </span>
                    </td>

                    {/* TDS */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={
                          rec.tds < 50 || rec.tds > 500
                            ? 'text-rose-400 font-bold bg-rose-950/60 px-1.5 py-0.5 rounded'
                            : 'text-indigo-300 font-semibold'
                        }
                      >
                        {rec.tds} ppm
                      </span>
                    </td>

                    {/* Temp */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={
                          rec.temperature < 15 || rec.temperature > 25
                            ? 'text-rose-400 font-bold bg-rose-950/60 px-1.5 py-0.5 rounded'
                            : 'text-amber-300 font-semibold'
                        }
                      >
                        {rec.temperature.toFixed(1)} °C
                      </span>
                    </td>

                    {/* WQI */}
                    <td className="py-3 px-4 text-center whitespace-nowrap font-bold text-white">
                      {rec.wqi}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center whitespace-nowrap font-sans">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                          isContam
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {isContam ? (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            CONTAMINATED
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            SAFE
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
