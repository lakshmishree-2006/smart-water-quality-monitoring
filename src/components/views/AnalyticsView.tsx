
import React from 'react';
import type { HistoryRecord, SensorStateMap } from '../../types';

interface AnalyticsViewProps {
  sensorValues: SensorStateMap;
  history: HistoryRecord[];
}

export function AnalyticsView({
  sensorValues,
  history,
}: AnalyticsViewProps) {
  const parameters = [
    {
      key: 'ph',
      label: 'pH',
      value: sensorValues.ph,
      unit: '',
      range: '6.5–8.5',
      color: 'text-cyan-300',
      bar: 'bg-cyan-400',
    },
    {
      key: 'turbidity',
      label: 'Turbidity',
      value: sensorValues.turbidity,
      unit: 'NTU',
      range: '0–5 NTU',
      color: 'text-blue-300',
      bar: 'bg-blue-400',
    },
    {
      key: 'tds',
      label: 'TDS',
      value: sensorValues.tds,
      unit: 'ppm',
      range: '0–500 ppm',
      color: 'text-amber-300',
      bar: 'bg-amber-400',
    },
    {
      key: 'temperature',
      label: 'Temperature',
      value: sensorValues.temperature,
      unit: '°C',
      range: '20–35 °C',
      color: 'text-rose-300',
      bar: 'bg-rose-400',
    },
  ];

  const chartParameters = [
    {
      key: 'ph',
      label: 'pH',
      color: '#22d3ee',
    },
    {
      key: 'turbidity',
      label: 'Turbidity',
      color: '#60a5fa',
    },
    {
      key: 'tds',
      label: 'TDS',
      color: '#fbbf24',
    },
    {
      key: 'temperature',
      label: 'Temperature',
      color: '#fb7185',
    },
  ] as const;

  const recentHistory = history.slice(-12).reverse();

  return (
    <div className="space-y-6 text-white">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="mt-1 text-sm text-slate-400">
          Real-time sensor readings and historical water quality trends.
        </p>
      </div>

      {/* Current sensor cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {parameters.map((parameter) => (
          <div
            key={parameter.key}
            className="rounded-xl border border-slate-700 bg-slate-900 p-5"
          >
            <p className="text-sm text-slate-400">{parameter.label}</p>

            <p className={`mt-3 text-3xl font-bold ${parameter.color}`}>
              {parameter.value == null
                ? 'N/A'
                : `${parameter.value}${parameter.unit ? ` ${parameter.unit}` : ''}`}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Reference range: {parameter.range}
            </p>

            <div className="mt-4 h-1.5 rounded-full bg-slate-800">
              <div className={`h-1.5 w-2/3 rounded-full ${parameter.bar}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Historical trends */}
      <div className="rounded-xl border border-slate-700 bg-slate-900 p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Sensor Trends</h2>
          <p className="mt-1 text-xs text-slate-400">
            Historical readings from the dashboard telemetry stream.
          </p>
        </div>

        {history.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            No historical readings available yet.
          </p>
        ) : (
          <div className="space-y-6">
            {chartParameters.map((parameter) => {
              const values = history
                .slice(-24)
                .map((record) => record[parameter.key])
                .filter(
                  (value): value is number =>
                    typeof value === 'number' && Number.isFinite(value)
                );

            const min = Math.min(...values);
const max = Math.max(...values);
const actualSpread = max - min;

const padding =
  actualSpread === 0
    ? Math.max(Math.abs(min) * 0.02, 0.1)
    : actualSpread * 0.15;

const chartMin = min - padding;
const chartMax = max + padding;
const spread = chartMax - chartMin;

const points = values
  .map((value, index) => {
    const x =
      values.length > 1
        ? (index / (values.length - 1)) * 100
        : 50;

    const y = 30 - ((value - chartMin) / spread) * 24;

    return `${x},${y}`;
  })
  .join(' ');

              return (
                <div key={parameter.key}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {parameter.label}
                    </span>
                    <span className="text-xs text-slate-400">
                      {values.length > 0
                        ? `Latest: ${values[values.length - 1]}`
                        : 'No data'}
                    </span>
                  </div>

                  <div className="h-16 overflow-hidden rounded-lg border border-slate-800 bg-slate-950 px-2">
                    {values.length > 0 ? (
                      <svg
                        viewBox="0 0 100 36"
                        preserveAspectRatio="none"
                        className="h-full w-full"
                        role="img"
                        aria-label={`${parameter.label} historical trend`}
                      >
                        <line
                          x1="0"
                          y1="32"
                          x2="100"
                          y2="32"
                          stroke="#334155"
                          strokeWidth="0.5"
                        />
                        <polyline
                          points={points}
                          fill="none"
                          stroke={parameter.color}
                          strokeWidth="1.5"
                          vectorEffect="non-scaling-stroke"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />
                      </svg>
                    ) : (
                      <p className="py-5 text-center text-xs text-slate-500">
                        Waiting for readings
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent history table */}
      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
        <div className="border-b border-slate-700 p-5">
          <h2 className="text-lg font-semibold">Recent Readings</h2>
          <p className="mt-1 text-xs text-slate-400">
            Latest dashboard history records.
          </p>
        </div>

        {recentHistory.length === 0 ? (
          <p className="p-5 text-sm text-slate-400">
            No readings recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-slate-800 text-slate-300">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">pH</th>
                  <th className="px-4 py-3">Turbidity</th>
                  <th className="px-4 py-3">TDS</th>
                  <th className="px-4 py-3">Temperature</th>
                  <th className="px-4 py-3">WQI</th>
                </tr>
              </thead>
              <tbody>
                {recentHistory.map((record) => (
                  <tr
                    key={record.id}
                    className="border-t border-slate-800"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-slate-400">
                      {record.timeLabel}
                    </td>
                    <td className="px-4 py-3">{record.ph}</td>
                    <td className="px-4 py-3">{record.turbidity}</td>
                    <td className="px-4 py-3">{record.tds}</td>
                    <td className="px-4 py-3">{record.temperature} °C</td>
                    <td className="px-4 py-3">{record.wqi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
