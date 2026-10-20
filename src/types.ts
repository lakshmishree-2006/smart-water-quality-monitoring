export type SensorType = 'ph' | 'turbidity' | 'tds' | 'temperature';

export type StatusLevel = 'NORMAL' | 'WARNING' | 'CRITICAL';

export interface SensorConfig {
  id: SensorType;
  name: string;
  unit: string;
  minRange: number;
  maxRange: number;
  safeMin: number;
  safeMax: number;
  warningMin: number;
  warningMax: number;
  decimals: number;
  iconName: string;
  description: string;
  step: number;
}

export interface SensorReading {
  value: number;
  status: StatusLevel;
  timestamp: string;
}

export interface SensorStateMap {
  ph: number;
  turbidity: number;
  tds: number;
  temperature: number;
}

export interface AlertItem {
  id: string;
  timestamp: string;
  sensorId: SensorType;
  sensorName: string;
  detectedValue: number;
  unit: string;
  safeThreshold: string;
  status: StatusLevel;
  message: string;
  smsContent: string;
  acknowledged: boolean;
}

export interface HistoryRecord {
  id: string;
  timestamp: string;
  timeLabel: string;
  ph: number;
  turbidity: number;
  tds: number;
  temperature: number;
  wqi: number;
  overallStatus: 'SAFE' | 'CONTAMINATED';
  hasAlert: boolean;
}

export type ViewTab = 'dashboard' | 'controller' | 'alerts' | 'history';

export interface SimulatedSmsPayload {
  sensorName: string;
  detectedValue: string;
  safeThreshold: string;
  timestamp: string;
  sensorId: SensorType;
  level: StatusLevel;
}
