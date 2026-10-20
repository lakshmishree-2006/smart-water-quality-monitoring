import { SensorConfig, SensorType, HistoryRecord, SensorStateMap } from '../types';

export const INITIAL_SENSOR_VALUES: SensorStateMap = {
  ph: 7.20,
  turbidity: 0.00,
  tds: 120,
  temperature: 20.5,
};

export const SENSOR_CONFIGS: Record<SensorType, SensorConfig> = {
  ph: {
    id: 'ph',
    name: 'pH Level',
    unit: 'pH',
    minRange: 0,
    maxRange: 14,
    safeMin: 6.5,
    safeMax: 8.5,
    warningMin: 6.0,
    warningMax: 9.0,
    decimals: 2,
    iconName: 'Droplet',
    description: 'Acidity / Alkalinity level of water sample',
    step: 0.05,
  },
  turbidity: {
    id: 'turbidity',
    name: 'Turbidity',
    unit: 'NTU',
    minRange: 0,
    maxRange: 20,
    safeMin: 0,
    safeMax: 5.0,
    warningMin: 0,
    warningMax: 5.0,
    decimals: 2,
    iconName: 'Waves',
    description: 'Cloudiness or haziness caused by suspended particles',
    step: 0.1,
  },
  tds: {
    id: 'tds',
    name: 'Total Dissolved Solids (TDS)',
    unit: 'ppm',
    minRange: 0,
    maxRange: 1000,
    safeMin: 50,
    safeMax: 500,
    warningMin: 30,
    warningMax: 650,
    decimals: 0,
    iconName: 'Activity',
    description: 'Concentration of dissolved inorganic and organic substances',
    step: 5,
  },
  temperature: {
    id: 'temperature',
    name: 'Temperature',
    unit: '°C',
    minRange: 0,
    maxRange: 50,
    safeMin: 15.0,
    safeMax: 25.0,
    warningMin: 12.0,
    warningMax: 30.0,
    decimals: 1,
    iconName: 'Thermometer',
    description: 'Thermal profile influencing biological and chemical reactions',
    step: 0.5,
  },
};

// Generate realistic starting history points
export const generateInitialHistory = (): HistoryRecord[] => {
  const records: HistoryRecord[] = [];
  const now = Date.now();
  const intervals = 20;

  for (let i = intervals; i >= 0; i--) {
    const time = new Date(now - i * 60 * 1000);
    // Add small random realistic variations around normal
    const ph = Number((7.2 + (Math.sin(i / 2) * 0.15) + (Math.random() * 0.08 - 0.04)).toFixed(2));
    const turbidity = Number((0.5 + (Math.cos(i / 3) * 0.12) + (Math.random() * 0.06 - 0.03)).toFixed(2));
    const tds = Math.round(120 + Math.sin(i / 4) * 8 + (Math.random() * 6 - 3));
    const temperature = Number((20.5 + Math.cos(i / 2) * 0.4 + (Math.random() * 0.2 - 0.1)).toFixed(1));

    records.push({
      id: `hist-${intervals - i}`,
      timestamp: time.toISOString(),
      timeLabel: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      ph,
      turbidity,
      tds,
      temperature,
      wqi: 94 - (turbidity > 1 ? 5 : 0),
      overallStatus: 'SAFE',
      hasAlert: false,
    });
  }

  return records;
};
