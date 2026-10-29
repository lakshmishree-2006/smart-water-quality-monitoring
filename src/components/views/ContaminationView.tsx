
import React from 'react';
import type { SensorStateMap, SensorType } from '../../types';

interface ContaminationViewProps {
  sensorValues: SensorStateMap;
  sensorStatuses: Record<SensorType, string>;
  overallStatus: string;
}

export function ContaminationView({
  sensorValues,
  sensorStatuses,
  overallStatus,
}: ContaminationViewProps) {
  const sensors = [
    { key: 'ph', label: 'pH Level', unit: 'pH', icon: '🧪' },
    { key: 'turbidity', label: 'Turbidity', unit: 'NTU', icon: '💧' },
    { key: 'tds', label: 'Total Dissolved Solids', unit: 'ppm', icon: '🧂' },
    { key: 'temperature', label: 'Temperature', unit: '°C', icon: '🌡️' },
  ] as const;

  const getStatusColor = (status: string) => {
    const value = status.toLowerCase();

    if (
      value.includes('critical') ||
      value.includes('high') ||
      value.includes('danger') ||
      value.includes('poor')
    ) {
      return 'text-red-400 bg-red-500/10 border-red-500/30';
    }

    if (
      value.includes('warning') ||
      value.includes('moderate')
    ) {
      return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    }

    if (
      value.includes('normal') ||
      value.includes('safe') ||
      value.includes('good')
    ) {
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }

    return 'text-slate-300 bg-slate-500/10 border-slate-500/30';
  };

  return (
    <div className="space-y-6 p-6 text-white">
      <div>
        <h1 className="text-3xl font-bold">Contamination Tests</h1>
        <p className="mt-2 text-slate-400">
          Monitor sensor readings and identify parameters that may need attention.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <p className="text-sm text-slate-400">Overall Water Quality Status</p>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold">{overallStatus}</h2>
          <span
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${getStatusColor(overallStatus)}`}
          >
            {overallStatus}
          </span>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {sensors.map((sensor) => {
          const value = sensorValues[sensor.key];
          const status = sensorStatuses[sensor.key];

          return (
            <div
              key={sensor.key}
              className="rounded-2xl border border-slate-700 bg-slate-900 p-5"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{sensor.icon}</span>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusColor(status)}`}
                >
                  {status}
                </span>
              </div>

              <h3 className="mt-4 text-sm text-slate-400">
                {sensor.label}
              </h3>

              <p className="mt-2 text-3xl font-bold">
                {typeof value === 'number' ? value.toFixed(2) : value}
                <span className="ml-2 text-sm font-normal text-slate-400">
                  {sensor.unit}
                </span>
              </p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <h2 className="text-xl font-semibold">Contamination Assessment</h2>

        <p className="mt-2 text-sm text-slate-400">
          Review each parameter's status to identify unusual readings. These
          sensor readings alone cannot confirm the presence of every contaminant
          or establish that water is safe to drink.
        </p>

        <div className="mt-5 space-y-3">
          {sensors.map((sensor) => {
            const status = sensorStatuses[sensor.key];

            return (
              <div
                key={sensor.key}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700 p-4"
              >
                <span className="font-medium">{sensor.label}</span>
                <span className={`rounded-full border px-3 py-1 text-sm ${getStatusColor(status)}`}>
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
