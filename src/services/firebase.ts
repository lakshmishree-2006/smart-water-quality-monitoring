
import {
  initializeApp,
  getApps,
  getApp,
  FirebaseApp,
} from 'firebase/app';

import {
  getDatabase,
  ref,
  onValue,
  set,
  off,
  Database,
  DataSnapshot,
} from 'firebase/database';

export const FIREBASE_CONFIG = {
  projectId: 'smart-water-quality-84a25',
  databaseURL:
    'https://smart-water-quality-84a25-default-rtdb.asia-southeast1.firebasedatabase.app',
};

let app: FirebaseApp;

if (getApps().length === 0) {
  app = initializeApp(FIREBASE_CONFIG);
} else {
  app = getApp();
}

export const rtdb: Database = getDatabase(app);

export type WaterSensor =
  | 'ph'
  | 'turbidity'
  | 'tds'
  | 'temperature';

export interface WaterSensorValues {
  ph: number;
  turbidity: number;
  tds: number;
  temperature: number;
}

export interface FirebaseConnectionStatus {
  connected: boolean;
  lastUpdated: string | null;
  lastRawValue: unknown;
  error: string | null;
}

export function extractTurbidityValue(data: unknown): number | null {
  if (typeof data === 'number') {
    return Number.isFinite(data) ? data : null;
  }

  if (typeof data === 'string' && data.trim() !== '') {
    const parsed = Number(data);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;

    for (const key of ['turbidity', 'value', 'ntu', 'val']) {
      if (obj[key] !== undefined && obj[key] !== null) {
        return extractTurbidityValue(obj[key]);
      }
    }
  }

  return null;
}

/** Listen to one sensor value in Firebase Realtime Database. */
export function subscribeToSensorValue(
  sensor: WaterSensor,
  onUpdate: (value: number) => void,
  onError?: (error: Error) => void
): () => void {
  const sensorRef = ref(rtdb, sensor);

  const unsubscribe = onValue(
    sensorRef,
    (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      console.log('Firebase sensor:', sensor, 'value:', data);
const value =
  typeof data === 'number'
    ? data
    : typeof data === 'string' && data.trim() !== ''
      ? Number(data)
      : null;

      if (value !== null) {
        onUpdate(value);
      } else {
        console.warn(
          `[Firebase RTDB] Missing or invalid value for ${sensor}`
        );
      }
    },
    (error) => {
      console.error(
        `[Firebase RTDB] Error reading ${sensor}:`,
        error
      );
      onError?.(error);
    }
  );

  return () => unsubscribe();
}

/** Existing turbidity listener retained for compatibility. */
export function subscribeToTurbidity(
  onUpdate: (value: number, rawData: unknown) => void,
  onError?: (error: Error) => void
): () => void {
  const turbidityRef = ref(rtdb, 'turbidity');

  const unsubscribe = onValue(
    turbidityRef,
    (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      const value = extractTurbidityValue(data);

      if (value !== null) {
        onUpdate(value, data);
      } else {
        console.warn(
          '[Firebase RTDB] Invalid turbidity value:',
          data
        );
      }
    },
    (error) => {
      console.error(
        '[Firebase RTDB] Error listening to turbidity:',
        error
      );
      onError?.(error);
    }
  );

  return () => unsubscribe();
}

export function subscribeToConnectionStatus(
  onStatusChange: (isConnected: boolean) => void
): () => void {
  const connectedRef = ref(rtdb, '.info/connected');

  const unsubscribe = onValue(connectedRef, (snapshot) => {
    onStatusChange(snapshot.val() === true);
  });

  return () => unsubscribe();
}

export async function pushTurbidityToFirebase(
  value: number
): Promise<void> {
  await set(ref(rtdb, 'turbidity'), Number(value.toFixed(2)));
}
