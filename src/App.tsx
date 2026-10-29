import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { ControllerView } from './components/views/ControllerView';
import { AlertsView } from './components/views/AlertsView';
import { HistoryView } from './components/views/HistoryView';
import { WaterSourcesView } from './components/views/WaterSourcesView';
import { AnalyticsView } from './components/views/AnalyticsView';
import { ReportsView } from './components/views/ReportsView';
import { ContaminationView } from './components/views/ContaminationView';
import { SimulatedSmsModal } from './components/SimulatedSmsModal';
import { SettingsView } from './components/views/SettingsView';
import { INITIAL_SENSOR_VALUES, SENSOR_CONFIGS, generateInitialHistory } from './data/mockData';
import {
  calculateWQI,
  createAlertItem,
  evaluateAllStatuses,
  evaluateSensorStatus,
  getOverallStatus,
} from './utils/waterQuality';
import { AlertItem, HistoryRecord, SensorStateMap, SensorType, ViewTab } from './types';
import {
  subscribeToTurbidity,
  subscribeToConnectionStatus,
  subscribeToSensorValue,
  pushTurbidityToFirebase
} from './services/firebase';

export default function App() {
  // Navigation tab state
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');

  // Sensor state values (turbidity is initialized and updated directly from Firebase RTDB)
  const [sensorValues, setSensorValues] = useState<SensorStateMap>(INITIAL_SENSOR_VALUES);

  // Firebase Realtime Database status
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(true);
  const [firebaseLastUpdated, setFirebaseLastUpdated] = useState<string | null>(null);

  // Live streaming toggle (micro fluctuations for pH, TDS, Temp while turbidity is live from Firebase)
  const [isStreaming, setIsStreaming] = useState<boolean>(true);

  // Incident alerts list
  const [alerts, setAlerts] = useState<AlertItem[]>([]);

  // Active selected alert for SMS modal
  const [selectedAlertForSms, setSelectedAlertForSms] = useState<AlertItem | null>(null);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState<boolean>(false);

  // History timeline dataset
  const [history, setHistory] = useState<HistoryRecord[]>(() => generateInitialHistory());

  // Ref to track last alert triggers to avoid spamming the same alert within 3 seconds
  const lastAlertTimestampRef = useRef<Record<SensorType, number>>({
    ph: 0,
    turbidity: 0,
    tds: 0,
    temperature: 0,
  });

  // Track latest turbidity from Firebase to prevent stream overwrites
  const latestFirebaseTurbidityRef = useRef<number>(sensorValues.turbidity);

  // Calculate statuses & WQI
  const sensorStatuses = evaluateAllStatuses(sensorValues);
  const overallStatus = getOverallStatus(sensorStatuses);
  const wqi = calculateWQI(sensorValues);

  const criticalCount = Object.values(sensorStatuses).filter((s) => s === 'CRITICAL').length;
  const warningCount = Object.values(sensorStatuses).filter((s) => s === 'WARNING').length;

  // Web Audio alert beep (optional subtle demonstration chime)
  const playAlertChime = useCallback(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio context might be restricted by browser until user gesture
    }
  }, []);

  // Trigger alert dispatch for a sensor breach
  const dispatchAlert = useCallback(
    (sensorId: SensorType, value: number, forceOpenModal = true) => {
      const status = evaluateSensorStatus(sensorId, value);
      if (status === 'NORMAL') return;

      const now = Date.now();
      // Throttle alerts per sensor to avoid high frequency duplicates unless forced
      if (forceOpenModal || now - lastAlertTimestampRef.current[sensorId] > 3000) {
        lastAlertTimestampRef.current[sensorId] = now;
        const newAlert = createAlertItem(sensorId, value, status);

        setAlerts((prev) => [newAlert, ...prev]);

        if (forceOpenModal) {
          setSelectedAlertForSms(newAlert);
          setIsSmsModalOpen(true);
          playAlertChime();
        }
      }
    },
    [playAlertChime]
  );

  
useEffect(() => {
  const unsubscribeConn = subscribeToConnectionStatus((connected) => {
    setFirebaseConnected(connected);
  });

  const unsubscribers = [
    subscribeToTurbidity((value) => {
      latestFirebaseTurbidityRef.current = value;
      setSensorValues((current) => ({
        ...current,
        turbidity: value,
      }));
      setFirebaseLastUpdated(new Date().toLocaleTimeString());
    }),
    ...(['ph', 'tds', 'temperature'] as const).map((sensor) =>
      subscribeToSensorValue(sensor, (value) => {
        setSensorValues((current) => ({
          ...current,
          [sensor]: value,
        }));
        setFirebaseLastUpdated(new Date().toLocaleTimeString());
      })
    ),
  ];

  return () => {
    unsubscribeConn();
    unsubscribers.forEach((unsubscribe) => unsubscribe());
  };
}, []);


const handleUpdateSensor = (sensorId: SensorType, value: number) => {
  const config = SENSOR_CONFIGS[sensorId];
  const clamped = Math.max(config.minRange, Math.min(config.maxRange, value));
  const formatted = Number(clamped.toFixed(config.decimals));

  if (sensorId === 'turbidity') {
    latestFirebaseTurbidityRef.current = formatted;
  }

  setSensorValues((current) => ({
    ...current,
    [sensorId]: formatted,
  }));

  const status = evaluateSensorStatus(sensorId, clamped);
  if (status !== 'NORMAL') {
    dispatchAlert(sensorId, clamped, true);
  }
};



  // Simulation triggers (kept working as requested)
  const handleSimulateHighTurbidity = () => {
    const nextValues = { ...sensorValues, turbidity: 8.80 };
    latestFirebaseTurbidityRef.current = 8.80;
    setSensorValues(nextValues);
    dispatchAlert('turbidity', 8.80, true);
  };

  const handleSimulateLowPh = () => {
    const nextValues = { ...sensorValues, ph: 4.80 };
    setSensorValues(nextValues);
    dispatchAlert('ph', 4.80, true);
  };

  const handleSimulateHighTds = () => {
    const nextValues = { ...sensorValues, tds: 750 };
    setSensorValues(nextValues);
    dispatchAlert('tds', 750, true);
  };

  const handleSimulateHighTemp = () => {
    const nextValues = { ...sensorValues, temperature: 34.5 };
    setSensorValues(nextValues);
    dispatchAlert('temperature', 34.5, true);
  };

  
const handleResetToNormal = () => {
  const resetTurbidity = 2.5;

  latestFirebaseTurbidityRef.current = resetTurbidity;

  setSensorValues({
    ...INITIAL_SENSOR_VALUES,
    turbidity: resetTurbidity,
  });

  // Reset the Firebase turbidity value too
  pushTurbidityToFirebase(resetTurbidity);

  setAlerts([]);
};


  // Apply quick preset from dashboard
  const handleQuickPreset = (presetName: string) => {
    if (presetName === 'turbidity') handleSimulateHighTurbidity();
    else if (presetName === 'ph') handleSimulateLowPh();
    else if (presetName === 'tds') handleSimulateHighTds();
    else if (presetName === 'temp') handleSimulateHighTemp();
    else if (presetName === 'normal') handleResetToNormal();
  };

  // Multi-scenario applicator
  const handleApplyScenario = (name: string, scenarioValues: Partial<SensorStateMap>) => {
    if (scenarioValues.turbidity !== undefined) {
      latestFirebaseTurbidityRef.current = scenarioValues.turbidity;
    }
    const next = { ...sensorValues, ...scenarioValues };
    setSensorValues(next);

    // Check which sensor breached and alert the primary one
    for (const [key, val] of Object.entries(scenarioValues)) {
      const sId = key as SensorType;
      const status = evaluateSensorStatus(sId, val as number);
      if (status !== 'NORMAL') {
        dispatchAlert(sId, val as number, true);
        break;
      }
    }
  };

  // Live telemetry stream effect (updates history every 2.5s with micro-fluctuations for pH, TDS, Temp)
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setSensorValues((current) => {
         
        // Keep Firebase sensor readings unchanged
        const newValues: SensorStateMap = {
          ...current,
          turbidity: latestFirebaseTurbidityRef.current,
        };


        // Record history snapshot
        const now = new Date();
        const statuses = evaluateAllStatuses(newValues);
        const isContam = getOverallStatus(statuses) === 'CONTAMINATED';
        const quality = calculateWQI(newValues);

        const newRecord: HistoryRecord = {
          id: `hist-${Date.now()}`,
          timestamp: now.toISOString(),
          timeLabel: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          ph: newValues.ph,
          turbidity: newValues.turbidity,
          tds: newValues.tds,
          temperature: newValues.temperature,
          wqi: quality.score,
          overallStatus: isContam ? 'CONTAMINATED' : 'SAFE',
          hasAlert: isContam,
        };

        setHistory((prev) => [...prev.slice(-40), newRecord]);

        return newValues;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Open latest SMS modal
  const handleOpenLatestSms = () => {
    if (alerts.length > 0) {
      setSelectedAlertForSms(alerts[0]);
      setIsSmsModalOpen(true);
    } else {
      // Create a preview alert if none logged yet
      const sample = createAlertItem('turbidity', sensorValues.turbidity > 5 ? sensorValues.turbidity : 8.80, 'CRITICAL');
      setSelectedAlertForSms(sample);
      setIsSmsModalOpen(true);
    }
  };

  const handleSelectSpecificAlert = (alert: AlertItem) => {
    setSelectedAlertForSms(alert);
    setIsSmsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-200 selection:text-slate-900">
      {/* Top Telemetry Header with Project Title, Firebase RTDB indicator & Alert Banner */}
      <Header
        overallStatus={overallStatus}
        wqi={wqi}
        criticalCount={criticalCount}
        warningCount={warningCount}
        latestAlert={alerts[0] || null}
        firebaseConnected={firebaseConnected}
        firebaseLastUpdated={firebaseLastUpdated}
        onOpenLatestSms={handleOpenLatestSms}
        onResetToNormal={handleResetToNormal}
        isStreaming={isStreaming}
        onToggleStreaming={() => setIsStreaming(!isStreaming)}
      />

      {/* Main Body with Sidebar + Active View */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          alertCount={alerts.length}
          isContaminated={overallStatus === 'CONTAMINATED'}
        />

        {/* Content View Area */}
        <main className="flex-1 bg-slate-950 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              sensorValues={sensorValues}
              sensorStatuses={sensorStatuses}
              overallStatus={overallStatus}
              wqi={wqi}
              history={history}
              alerts={alerts}
              firebaseConnected={firebaseConnected}
              onSelectAlert={handleSelectSpecificAlert}
              onOpenController={() => setActiveTab('controller')}
              onClearAlerts={() => setAlerts([])}
              onSimulatePreset={handleQuickPreset}
            />
          )}

          {activeTab === 'controller' && (
            <ControllerView
              sensorValues={sensorValues}
              onUpdateSensor={handleUpdateSensor}
              onSimulateHighTurbidity={handleSimulateHighTurbidity}
              onSimulateLowPh={handleSimulateLowPh}
              onSimulateHighTds={handleSimulateHighTds}
              onSimulateHighTemp={handleSimulateHighTemp}
              onResetToNormal={handleResetToNormal}
              onApplyScenario={handleApplyScenario}
              isStreaming={isStreaming}
              onToggleStreaming={() => setIsStreaming(!isStreaming)}
            />
          )}

          {activeTab === 'alerts' && (
            <AlertsView
              alerts={alerts}
              onSelectAlert={handleSelectSpecificAlert}
              onClearAlerts={() => setAlerts([])}
              onOpenLatestSms={handleOpenLatestSms}
            />
          )}

          {activeTab === 'history' && <HistoryView history={history} />}
          {activeTab === 'analytics' && (
  <AnalyticsView
    sensorValues={sensorValues}
    history={history}
  />
)}
{activeTab === 'reports' && (
  <ReportsView history={history} />
)}
{activeTab === 'contamination' && (
  <ContaminationView
    sensorValues={sensorValues}
    sensorStatuses={sensorStatuses}
    overallStatus={overallStatus}
  />
)}
{activeTab === 'settings' && <SettingsView />}
          {activeTab === 'sources' && <WaterSourcesView />}
          
          

{![
  'dashboard',
  'controller',
  'alerts',
  'history',
  'sources',
  'analytics',
  'contamination',
  'reports',
  'settings',
].includes(activeTab) && (

  <div className="min-h-[60vh] flex flex-col items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 p-8 text-center">
    <div className="mb-4 rounded-full border border-cyan-500/30 bg-cyan-500/10 p-4">
      <span className="text-3xl">💧</span>
    </div>

    <h2 className="text-2xl font-bold text-white">
      {activeTab === 'sources' ? 'Water Sources' :
       activeTab === 'analytics' ? 'Analytics' :
       activeTab === 'contamination' ? 'Contamination Tests' :
       activeTab === 'reports' ? 'Reports' :
       activeTab === 'settings' ? 'Settings' :
       'Section'}
    </h2>

    <p className="mt-2 max-w-md text-sm text-slate-300">
      This section is ready for implementation in the Smart Water Quality Monitoring System.
    </p>

    <p className="mt-4 text-xs text-cyan-300">
      Sensor monitoring • Water quality • Environmental safety
    </p>
  </div>
)}

        </main>
      </div>

      {/* Simulated SMS Alert Modal */}
      <SimulatedSmsModal
        alert={selectedAlertForSms}
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
      />
    </div>
  );
}
