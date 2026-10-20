import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, off, Database, DataSnapshot } from 'firebase/database';

export const FIREBASE_CONFIG = {
  projectId: 'smart-water-quality-84a25',
  databaseURL: 'https://smart-water-quality-84a25-default-rtdb.asia-southeast1.firebasedatabase.app',
};

// Initialize Firebase App singleton
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(FIREBASE_CONFIG);
} else {
  app = getApp();
}

export const rtdb: Database = getDatabase(app);

export interface FirebaseConnectionStatus {
  connected: boolean;
  lastUpdated: string | null;
  lastRawValue: any;
  error: string | null;
}

/**
 * Parses snapshot value to extract a valid numeric turbidity value
 */
export function extractTurbidityValue(data: any): number | null {
  if (data === null || data === undefined) {
    return null;
  }

  // Directly a number
  if (typeof data === 'number') {
    return isNaN(data) ? null : data;
  }

  // A string that can be parsed as a float
  if (typeof data === 'string') {
    const parsed = parseFloat(data);
    return isNaN(parsed) ? null : parsed;
  }

  // An object containing turbidity property or value/ntu/val
  if (typeof data === 'object') {
    if ('turbidity' in data && data.turbidity !== null) {
      return extractTurbidityValue(data.turbidity);
    }
    if ('value' in data && data.value !== null) {
      return extractTurbidityValue(data.value);
    }
    if ('ntu' in data && data.ntu !== null) {
      return extractTurbidityValue(data.ntu);
    }
    if ('val' in data && data.val !== null) {
      return extractTurbidityValue(data.val);
    }
  }

  return null;
}

/**
 * Subscribes to real-time updates of the /turbidity node in Firebase Realtime Database
 */
export function subscribeToTurbidity(
  onUpdate: (value: number, rawData: any) => void,
  onError?: (err: Error) => void
): () => void {
  const turbidityRef = ref(rtdb, 'turbidity');

  const unsubscribe = onValue(
    turbidityRef,
    (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      const parsedValue = extractTurbidityValue(data);
      if (parsedValue !== null) {
        onUpdate(parsedValue, data);
      } else if (data !== null) {
        // If data exists but could not be parsed as standard number, log for debugging
        console.warn('[Firebase RTDB] Unparsed turbidity data:', data);
      }
    },
    (error) => {
      console.error('[Firebase RTDB] Error listening to /turbidity:', error);
      if (onError) onError(error);
    }
  );

  return () => {
    off(turbidityRef);
  };
}

/**
 * Subscribes to Firebase RTDB connection status (/.info/connected)
 */
export function subscribeToConnectionStatus(
  onStatusChange: (isConnected: boolean) => void
): () => void {
  const connectedRef = ref(rtdb, '.info/connected');

  const unsubscribe = onValue(connectedRef, (snap) => {
    const isConnected = snap.val() === true;
    onStatusChange(isConnected);
  });

  return () => {
    off(connectedRef);
  };
}

/**
 * Helper to write a turbidity value to Firebase Realtime Database (for testing / simulation sync)
 */
export async function pushTurbidityToFirebase(value: number): Promise<void> {
  const turbidityRef = ref(rtdb, 'turbidity');
  await set(turbidityRef, Number(value.toFixed(2)));
}
