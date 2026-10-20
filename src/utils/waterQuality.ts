import { SENSOR_CONFIGS } from '../data/mockData';
import { AlertItem, SensorStateMap, SensorType, StatusLevel } from '../types';

export function evaluateSensorStatus(sensorId: SensorType, value: number): StatusLevel {
  const config = SENSOR_CONFIGS[sensorId];
  if (!config) return 'NORMAL';

  // Check if within safe range
  if (value >= config.safeMin && value <= config.safeMax) {
    return 'NORMAL';
  }

  // Check if within warning range
  if (value >= config.warningMin && value <= config.warningMax) {
    return 'WARNING';
  }

  return 'CRITICAL';
}

export function evaluateAllStatuses(values: SensorStateMap): Record<SensorType, StatusLevel> {
  return {
    ph: evaluateSensorStatus('ph', values.ph),
    turbidity: evaluateSensorStatus('turbidity', values.turbidity),
    tds: evaluateSensorStatus('tds', values.tds),
    temperature: evaluateSensorStatus('temperature', values.temperature),
  };
}

export function getOverallStatus(statuses: Record<SensorType, StatusLevel>): 'SAFE' | 'CONTAMINATED' {
  const hasWarningOrCritical = Object.values(statuses).some(s => s === 'WARNING' || s === 'CRITICAL');
  return hasWarningOrCritical ? 'CONTAMINATED' : 'SAFE';
}

export function calculateWQI(values: SensorStateMap): { score: number; rating: string; color: string } {
  // Weighted calculation based on standard drinking water index modeling
  // pH ideal = 7.0, safe = 6.5-8.5
  let phPenalty = 0;
  if (values.ph < 6.5) phPenalty = Math.min(40, (6.5 - values.ph) * 20);
  else if (values.ph > 8.5) phPenalty = Math.min(40, (values.ph - 8.5) * 20);

  // Turbidity ideal = 0-1, safe = <= 5
  let turbPenalty = 0;
  if (values.turbidity > 5) turbPenalty = Math.min(40, (values.turbidity - 5) * 5);

  // TDS ideal = <300, safe = 50-500
  let tdsPenalty = 0;
  if (values.tds < 50) tdsPenalty = Math.min(25, (50 - values.tds) * 0.5);
  else if (values.tds > 500) tdsPenalty = Math.min(40, (values.tds - 500) * 0.1);

  // Temp safe = 15-25
  let tempPenalty = 0;
  if (values.temperature < 15) tempPenalty = Math.min(20, (15 - values.temperature) * 2);
  else if (values.temperature > 25) tempPenalty = Math.min(30, (values.temperature - 25) * 2.5);

  const totalPenalty = phPenalty + turbPenalty + tdsPenalty + tempPenalty;
  const score = Math.max(10, Math.min(100, Math.round(100 - totalPenalty)));

  if (score >= 90) return { score, rating: 'Excellent', color: 'text-emerald-400' };
  if (score >= 75) return { score, rating: 'Good', color: 'text-teal-400' };
  if (score >= 50) return { score, rating: 'Fair / Degraded', color: 'text-amber-400' };
  if (score >= 30) return { score, rating: 'Poor', color: 'text-orange-400' };
  return { score, rating: 'Contaminated / Toxic', color: 'text-rose-500' };
}

export function formatSafeThreshold(sensorId: SensorType): string {
  const c = SENSOR_CONFIGS[sensorId];
  if (sensorId === 'turbidity') {
    return `${c.safeMin} – ${c.safeMax} ${c.unit} (≤ ${c.safeMax} ${c.unit})`;
  }
  return `${c.safeMin} – ${c.safeMax} ${c.unit}`;
}

export function generateSmsText(
  sensorId: SensorType,
  detectedValue: number
): { text: string; safeThreshold: string; sensorName: string } {
  const config = SENSOR_CONFIGS[sensorId];
  const safeThreshold = formatSafeThreshold(sensorId);
  const formattedValue = `${detectedValue.toFixed(config.decimals)} ${config.unit}`;

  const text = `SIMULATED SMS ALERT

Sensor: ${config.name}
Detected Value: ${formattedValue}
Safe Threshold: ${safeThreshold}

Warning: Water quality parameter has exceeded the defined safe limit. Please inspect the water source.`;

  return {
    text,
    safeThreshold,
    sensorName: config.name,
  };
}

export function createAlertItem(
  sensorId: SensorType,
  detectedValue: number,
  status: StatusLevel
): AlertItem {
  const config = SENSOR_CONFIGS[sensorId];
  const { text, safeThreshold, sensorName } = generateSmsText(sensorId, detectedValue);
  const now = new Date();

  return {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    sensorId,
    sensorName,
    detectedValue,
    unit: config.unit,
    safeThreshold,
    status,
    message: `${sensorName} breached safe boundary (${detectedValue.toFixed(config.decimals)} ${config.unit}). Condition: ${status}.`,
    smsContent: text,
    acknowledged: false,
  };
}
