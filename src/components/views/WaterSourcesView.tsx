

import React, { useEffect, useState } from 'react';
import { subscribeToSensorValue } from '../../services/firebase';
import borewellData from '../../data/borewell_historical.json';
import riverData from '../../data/river_historical.json';

const waterSources = [
  {
    id: 'primary',
    name: 'Household Water',
    type: 'Primary Source',
    description: 'Your existing household water monitoring source.',
    color: '#06b6d4',
  },
  {
    id: 'borewell',
    name: 'Borewell',
    type: 'Secondary Source',
    description: 'Groundwater quality monitoring.',
    color: '#8b5cf6',
  },
  {
    id: 'river',
    name: 'River Water',
    type: 'Secondary Source',
    description: 'Surface water quality monitoring.',
    color: '#f59e0b',
  },
];

const riverParameters = [
  {
    id: 'ec',
    name: 'Electrical Conductivity',
    unit: 'µS/cm',
    color: 'border-blue-400 bg-blue-950',
  },
  {
    id: 'colour',
    name: 'Colour',
    unit: '',
    color: 'border-violet-400 bg-violet-950',
  },
  {
    id: 'odour',
    name: 'Odour',
    unit: '',
    color: 'border-pink-400 bg-pink-950',
  },
  {
    id: 'turbidity',
    name: 'Turbidity',
    unit: 'NTU',
    color: 'border-amber-400 bg-amber-950',
  },
  {
    id: 'temperature',
    name: 'Temperature',
    unit: '°C',
    color: 'border-orange-400 bg-orange-950',
  },
  {
    id: 'totalSolids',
    name: 'Total Solids',
    unit: 'mg/L',
    color: 'border-teal-400 bg-teal-950',
  },
] as const;

export function WaterSourcesView() {
  const [sensorValues, setSensorValues] = useState({
    ph: null as number | null,
    turbidity: null as number | null,
    tds: null as number | null,
    temperature: null as number | null,
  });

  const [sensorErrors, setSensorErrors] = useState<string[]>([]);
  const [selectedBorewellIndex, setSelectedBorewellIndex] = useState(0);
  const [selectedRiverIndex, setSelectedRiverIndex] = useState(0);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);

  const borewellRecords = borewellData.records;
  const selectedBorewell = borewellRecords[selectedBorewellIndex];

  const riverRecords = riverData.records;
  const selectedRiver = riverRecords[selectedRiverIndex];

  const borewellParameters = [
    { id: 'ph', label: 'pH', unit: '', acceptable: '6.5–8.5' },
    { id: 'tds', label: 'TDS', unit: 'mg/L', acceptable: '≤ 500' },
    { id: 'chloride', label: 'Chloride', unit: 'mg/L', acceptable: '≤ 250' },
    { id: 'sulphate', label: 'Sulphate', unit: 'mg/L', acceptable: '≤ 200' },
    {
      id: 'totalHardness',
      label: 'Total Hardness',
      unit: 'mg/L',
      acceptable: '≤ 200',
    },
    { id: 'calcium', label: 'Calcium', unit: 'mg/L', acceptable: '≤ 75' },
    { id: 'magnesium', label: 'Magnesium', unit: 'mg/L', acceptable: '≤ 30' },
    {
      id: 'ec',
      label: 'Electrical Conductivity',
      unit: 'µS/cm',
      acceptable: 'Monitoring only',
    },
  ] as const;

  useEffect(() => {
    const sensors = ['ph', 'turbidity', 'tds', 'temperature'] as const;

    const unsubscribers = sensors.map((sensor) =>
      subscribeToSensorValue(
        sensor,
        (value) => {
          setSensorValues((prev) => ({ ...prev, [sensor]: value }));
          setSensorErrors((prev) =>
            prev.filter((item) => item !== sensor)
          );
        },
        () => {
          setSensorErrors((prev) =>
            prev.includes(sensor) ? prev : [...prev, sensor]
          );
        }
      )
    );

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  return (
    <div className="space-y-6 text-white">
      <div>
        {selectedSource !== null && (
          <button
            onClick={() => setSelectedSource(null)}
            className="mb-3 flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
          >
            ← Back to Water Sources
          </button>
        )}

        <p className="mt-2 text-sm text-slate-400">
          Manage and monitor your primary and secondary water sources.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {waterSources
          .filter(
            (source) =>
              selectedSource === null || source.id === selectedSource
          )
          .map((source) => (
            <div
              key={source.id}
              onClick={() => setSelectedSource(source.id)}
              className="cursor-pointer rounded-xl border border-slate-700 bg-slate-900 p-5 transition hover:border-cyan-400"
            >
              <div
                className="mb-4 h-1 w-12 rounded-full"
                style={{ backgroundColor: source.color }}
              />

              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                {source.type}
              </p>

              <h2 className="mt-2 text-lg font-semibold">{source.name}</h2>

              <p className="mt-2 text-sm text-slate-400">
                {source.description}
              </p>

              {source.id === 'borewell' && (
                <div className="mt-4">
                  <label className="mb-2 block text-sm text-slate-300">
                    Select Historical Station
                  </label>

                  <select
                    value={selectedBorewellIndex}
                    onChange={(e) =>
                      setSelectedBorewellIndex(Number(e.target.value))
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 p-2 text-sm text-white"
                  >
                    {borewellRecords.map((record, index) => (
                      <option key={index} value={index}>
                        {record.station || 'Unknown Station'} —{' '}
                        {record.sampleDate}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {source.id === 'river' && (
                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Select River Sample
                  </label>

                  <select
                    value={selectedRiverIndex}
                    onChange={(e) =>
                      setSelectedRiverIndex(Number(e.target.value))
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-sm text-white"
                  >
                    {riverRecords.map((record, index) => (
                      <option key={index} value={index}>
                        {record.station || 'Unknown Station'} —{' '}
                        {record.sampleDate}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3">
                {source.id === 'primary' ? (
                  (
                    [
                      { id: 'ph', label: 'pH', unit: '' },
                      { id: 'turbidity', label: 'Turbidity', unit: 'NTU' },
                      { id: 'tds', label: 'TDS', unit: 'ppm' },
                      {
                        id: 'temperature',
                        label: 'Temperature',
                        unit: '°C',
                      },
                    ] as const
                  ).map((sensor) => (
                    <div
                      key={sensor.id}
                      className="rounded-lg bg-slate-800 p-3"
                    >
                      <p className="text-xs text-slate-400">
                        {sensor.label}
                      </p>

                      <p className="mt-1 text-lg font-bold text-cyan-300">
                        {sensorValues[sensor.id] !== null
                          ? `${sensorValues[sensor.id]} ${sensor.unit}`
                          : sensorErrors.includes(sensor.id)
                            ? 'Read error'
                            : 'Waiting...'}
                      </p>
                    </div>
                  ))
                ) : source.id === 'borewell' ? (
                  <div className="col-span-2 space-y-3">
                    <div className="mt-4 rounded-xl border border-violet-500/30 bg-slate-800/70 p-4">
                      <h3 className="mb-3 text-lg font-semibold text-violet-300">
                        Station Information
                      </h3>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <p className="text-xs text-slate-400">
                            Station Name
                          </p>
                          <p className="mt-1 font-medium text-white">
                            {selectedBorewell.station || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">State</p>
                          <p className="mt-1 font-medium text-white">
                            {selectedBorewell.state || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">District</p>
                          <p className="mt-1 font-medium text-white">
                            {selectedBorewell.district || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">Tehsil</p>
                          <p className="mt-1 font-medium text-white">
                            {selectedBorewell.tehsil || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            Sample Date & Time
                          </p>
                          <p className="mt-1 font-medium text-white">
                            {selectedBorewell.sampleDate || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">Agency</p>
                          <p className="mt-1 font-medium text-white">
                            {selectedBorewell.agency || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">Latitude</p>
                          <p className="mt-1 font-medium text-white">
                            {selectedBorewell.latitude ?? 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">Longitude</p>
                          <p className="mt-1 font-medium text-white">
                            {selectedBorewell.longitude ?? 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">Source Type</p>
                          <p className="mt-1 text-sm text-white">
                            Historical groundwater station — type unverified
                          </p>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400">
                      Historical sample date: {selectedBorewell.sampleDate}
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      {borewellParameters.map((parameter) => {
                        const item =
                          selectedBorewell.parameters[parameter.id];
                        const value = item?.value;
                        const status = item?.status ?? 'N/A';

                        const statusClass =
                          status === 'NORMAL'
                            ? 'text-emerald-300'
                            : status === 'WARNING'
                              ? 'text-amber-300'
                              : status === 'CRITICAL'
                                ? 'text-rose-300'
                                : 'text-slate-400';

                        const cardColors: Record<string, string> = {
                          ph: 'border-cyan-400 bg-cyan-950',
                          ec: 'border-blue-400 bg-blue-950',
                          tds: 'border-amber-400 bg-amber-950',
                          chloride: 'border-violet-400 bg-violet-950',
                          sulphate: 'border-teal-400 bg-teal-950',
                          totalHardness: 'border-orange-400 bg-orange-950',
                          calcium: 'border-emerald-400 bg-emerald-950',
                          magnesium: 'border-pink-400 bg-pink-950',
                        };

                        return (
                          <div
                            key={parameter.id}
                            className={`rounded-lg border p-3 ${
                              cardColors[parameter.id]
                            }`}
                          >
                            <p className="text-xs text-slate-400">
                              {parameter.label}
                            </p>

                            <p className="mt-1 text-lg font-bold text-white">
                              {value == null
                                ? 'N/A'
                                : `${value} ${parameter.unit}`}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Reference: {parameter.acceptable}
                            </p>

                            <p
                              className={`mt-1 text-xs font-semibold ${statusClass}`}
                            >
                              {value == null ? 'NO DATA' : status}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {borewellParameters.some((parameter) => {
                      const status =
                        selectedBorewell.parameters[parameter.id]?.status;

                      return (
                        status === 'WARNING' || status === 'CRITICAL'
                      );
                    }) && (
                      <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
                        <p className="font-semibold">Water Quality Alert</p>
                        <p className="mt-1 text-xs">
                          One or more historical measurements exceed the
                          acceptable screening limits. Review the statuses
                          above.
                        </p>
                      </div>
                    )}
                  </div>
                ) : source.id === 'river' ? (
                  <div className="col-span-2 space-y-3">
                    <div className="rounded-lg border border-cyan-500/30 bg-slate-800/70 p-4">
                      <h3 className="mb-3 text-lg font-semibold text-cyan-300">
                        River Station Information
                      </h3>

                      <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
                        <div>
                          <p className="text-slate-400">Station</p>
                          <p className="text-white">
                            {selectedRiver?.station || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-400">State</p>
                          <p className="text-white">
                            {selectedRiver?.state || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-400">District</p>
                          <p className="text-white">
                            {selectedRiver?.district || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-400">Sample Date</p>
                          <p className="text-white">
                            {selectedRiver?.sampleDate || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-400">Agency</p>
                          <p className="text-white">
                            {selectedRiver?.agency || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-400">Tehsil</p>
                          <p className="text-white">
                            {selectedRiver?.tehsil || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-400">Latitude</p>
                          <p className="text-white">
                            {selectedRiver?.latitude ?? 'N/A'}
                          </p>
                        </div>

                        <div>
                          <p className="text-slate-400">Longitude</p>
                          <p className="text-white">
                            {selectedRiver?.longitude ?? 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-800 px-3 py-3 text-sm text-slate-300">
                      <p>
                        River sample: {selectedRiver?.sampleDate || 'N/A'}
                      </p>
                      <p className="mt-1 text-xs text-amber-300">
                        Historical monitoring data. Missing measurements are
                        unavailable.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {riverParameters.map((parameter) => {
                        const reading =
                          selectedRiver?.parameters?.[parameter.id];

                        return (
                          <div
                            key={parameter.id}
                            className={`rounded-lg border p-3 ${parameter.color}`}
                          >
                            <p className="text-sm text-slate-300">
                              {parameter.name}
                            </p>

                            <p className="mt-2 text-xl font-bold text-white">
                              {reading?.value ?? 'N/A'}
                              {reading?.value != null && parameter.unit
                                ? ` ${parameter.unit}`
                                : ''}
                            </p>

                            <p className="mt-1 text-xs text-slate-300">
                              {reading?.value == null
                                ? 'Measurement unavailable'
                                : 'Historical reading'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                      {selectedRiver?.parameters?.ec?.value != null &&
      selectedRiver.parameters.ec.value > 1500 && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
          <p className="font-semibold">River Water Conductivity Alert</p>
          <p className="mt-1 text-xs">
            Electrical conductivity is above the configured screening
            threshold of 1500 µS/cm. Please review this sample.
          </p>
        </div>
      )}
      </div>
                ) : (
                  <div className="col-span-2 rounded-lg bg-slate-800 px-3 py-3 text-sm text-slate-300">
                    <p>Awaiting sensor configuration</p>
                    <p className="mt-1 text-xs text-amber-300">
                      No live readings configured
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
