
import React, { useState } from 'react';

export function SettingsView() {
  const [thresholds, setThresholds] = useState({
    phMin: '6.5',
    phMax: '8.5',
    turbidityMax: '5',
    tdsMax: '500',
    temperatureMax: '35',
  });

  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [message, setMessage] = useState('');

  const handleChange = (key: keyof typeof thresholds, value: string) => {
    setThresholds((previous) => ({
      ...previous,
      [key]: value,
    }));
    setMessage('');
  };

  const handleSave = () => {
    const values = Object.values(thresholds).map(Number);

    if (
      values.some((value) => !Number.isFinite(value)) ||
      values.some((value) => value < 0) ||
      Number(thresholds.phMin) > Number(thresholds.phMax) ||
      Number(thresholds.phMax) > 14
    ) {
      setMessage('Please enter valid threshold values.');
      return;
    }

    localStorage.setItem('waterQualitySettings', JSON.stringify({
      thresholds,
      alertsEnabled,
    }));

    setMessage('Settings saved successfully!');
  };

  const handleReset = () => {
    setThresholds({
      phMin: '6.5',
      phMax: '8.5',
      turbidityMax: '5',
      tdsMax: '500',
      temperatureMax: '35',
    });
    setAlertsEnabled(true);
    localStorage.removeItem('waterQualitySettings');
    setMessage('Default settings restored.');
  };

  const fields = [
    { key: 'phMin' as const, label: 'Minimum pH', unit: 'pH' },
    { key: 'phMax' as const, label: 'Maximum pH', unit: 'pH' },
    { key: 'turbidityMax' as const, label: 'Maximum Turbidity', unit: 'NTU' },
    { key: 'tdsMax' as const, label: 'Maximum TDS', unit: 'ppm' },
    { key: 'temperatureMax' as const, label: 'Maximum Temperature', unit: '°C' },
  ];

  return (
    <div className="space-y-6 p-6 text-white">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-2 text-slate-400">
          Configure water quality thresholds and alert preferences.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <h2 className="mb-5 text-xl font-semibold">Sensor Thresholds</h2>

        <div className="grid gap-5 md:grid-cols-2">
          {fields.map((field) => (
            <div key={field.key}>
              <label className="mb-2 block text-sm text-slate-300">
                {field.label} ({field.unit})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={thresholds[field.key]}
                onChange={(event) =>
                  handleChange(field.key, event.target.value)
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-cyan-400"
              />
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-slate-400">
          These are configurable demo thresholds. Confirm suitable limits for
          your actual water source before using them for safety decisions.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
        <h2 className="mb-4 text-xl font-semibold">Alert Preferences</h2>

        <label className="flex cursor-pointer items-center justify-between gap-4">
          <span>
            <span className="block font-medium">Enable Alerts</span>
            <span className="text-sm text-slate-400">
              Store your alert preference for this browser.
            </span>
          </span>

          <input
            type="checkbox"
            checked={alertsEnabled}
            onChange={(event) => {
              setAlertsEnabled(event.target.checked);
              setMessage('');
            }}
            className="h-5 w-5 accent-cyan-400"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSave}
          className="rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
        >
          Save Settings
        </button>

        <button
          onClick={handleReset}
          className="rounded-lg border border-slate-600 px-6 py-3 font-semibold hover:bg-slate-800"
        >
          Reset to Default
        </button>
      </div>

      {message && (
        <p role="status" className="text-sm text-cyan-300">
          {message}
        </p>
      )}
    </div>
  );
}
