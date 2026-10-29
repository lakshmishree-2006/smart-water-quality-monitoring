
import React, { useMemo, useState } from 'react';
import type { HistoryRecord } from '../../types';

interface ReportsViewProps {
  history: HistoryRecord[];
}

export function ReportsView({ history }: ReportsViewProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredHistory = useMemo(() => {
    return history.filter((record) => {
      const recordDate = new Date(record.timestamp);
      if (startDate && recordDate < new Date(`${startDate}T00:00:00`)) {
        return false;
      }
      if (endDate && recordDate > new Date(`${endDate}T23:59:59.999`)) {
        return false;
      }
      return true;
    });
  }, [history, startDate, endDate]);

  const average = (values: number[]) => {
    const valid = values.filter((value) => Number.isFinite(value));
    if (!valid.length) return 'N/A';
    return (valid.reduce((sum, value) => sum + value, 0) / valid.length).toFixed(2);
  };

  const downloadCSV = () => {
    const headers = [
      'Timestamp',
      'pH',
      'Turbidity',
      'TDS',
      'Temperature',
      'WQI',
      'Overall Status',
      'Has Alert',
    ];

    const rows = filteredHistory.map((record) => [
      record.timestamp,
      record.ph,
      record.turbidity,
      record.tds,
      record.temperature,
      record.wqi,
      record.overallStatus,
      record.hasAlert ? 'Yes' : 'No',
    ]);

    const escapeCSV = (value: unknown) =>
      `"${String(value ?? '').replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(','))
      .join('\r\n');

    const blob = new Blob(['\uFEFF' + csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'water-quality-report.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const summaries = [
    { label: 'Average pH', value: average(filteredHistory.map((r) => r.ph)), unit: '' },
    { label: 'Average Turbidity', value: average(filteredHistory.map((r) => r.turbidity)), unit: 'NTU' },
    { label: 'Average TDS', value: average(filteredHistory.map((r) => r.tds)), unit: 'ppm' },
    { label: 'Average Temperature', value: average(filteredHistory.map((r) => r.temperature)), unit: '°C' },
  ];

  const alertCount = filteredHistory.filter((record) => record.hasAlert).length;

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Water Quality Reports</h1>
          <p className="mt-1 text-sm text-slate-400">
            Review recorded dashboard readings and export a CSV report.
          </p>
        </div>

        <button
          onClick={downloadCSV}
          disabled={filteredHistory.length === 0}
          className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Download CSV
        </button>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
        <h2 className="mb-4 text-lg font-semibold">Report Date Range</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-slate-300">
            From
            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white"
            />
          </label>

          <label className="text-sm text-slate-300">
            To
            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-white"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-400">
            {filteredHistory.length} records · {alertCount} records marked with alerts
          </p>
          <button
            onClick={() => {
              setStartDate('');
              setEndDate('');
            }}
            className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Clear filters
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaries.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-700 bg-slate-900 p-5"
          >
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-3 text-2xl font-bold text-cyan-300">
              {item.value}{item.value !== 'N/A' ? item.unit : ''}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
        <div className="border-b border-slate-700 p-5">
          <h2 className="text-lg font-semibold">Recorded Readings</h2>
          <p className="mt-1 text-xs text-slate-400">
            Records currently available in dashboard history.
          </p>
        </div>

        {filteredHistory.length === 0 ? (
          <p className="p-5 text-sm text-slate-400">
            No records found for this date range.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">pH</th>
                  <th className="px-4 py-3">Turbidity</th>
                  <th className="px-4 py-3">TDS</th>
                  <th className="px-4 py-3">Temperature</th>
                  <th className="px-4 py-3">WQI</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.slice().reverse().map((record) => (
                  <tr key={record.id} className="border-t border-slate-800">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                      {new Date(record.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">{record.ph}</td>
                    <td className="px-4 py-3">{record.turbidity}</td>
                    <td className="px-4 py-3">{record.tds}</td>
                    <td className="px-4 py-3">{record.temperature} °C</td>
                    <td className="px-4 py-3">{record.wqi}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs ${
                        record.hasAlert
                          ? 'bg-amber-500/10 text-amber-300'
                          : 'bg-emerald-500/10 text-emerald-300'
                      }`}>
                        {record.hasAlert ? 'Alert recorded' : record.overallStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs leading-5 text-slate-500">
        This report reflects records available in the dashboard's current history.
        It does not automatically include the separate Borewell or River Water JSON datasets.
      </p>
    </div>
  );
}
