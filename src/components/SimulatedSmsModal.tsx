import React, { useState } from 'react';
import { Smartphone, Bell, Copy, Check, X, ShieldAlert, Radio } from 'lucide-react';
import { AlertItem } from '../types';

interface SimulatedSmsModalProps {
  alert: AlertItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SimulatedSmsModal: React.FC<SimulatedSmsModalProps> = ({ alert, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !alert) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(alert.smsContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      id="simulated-sms-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="simulated-sms-modal-content"
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl"
      >
        {/* Smartphone mockup header */}
        <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                  SIMULATED SMS DISPATCH
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              </div>
              <p className="text-[10px] text-slate-400">GSM Gateway • Node: ESP32-WQM-01</p>
            </div>
          </div>
          <button
            id="close-sms-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice Banner */}
        <div className="bg-amber-950/40 border-b border-amber-800/40 px-4 py-2 flex items-center gap-2 text-xs text-amber-300">
          <Radio className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Notice: This is a software demonstration of the simulated SMS alerting routine.</span>
        </div>

        {/* Smartphone SMS Chat Screen Layout */}
        <div className="p-5 space-y-4 bg-slate-900">
          <div className="text-center">
            <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
              Today at {alert.timestamp} • Emergency Broadcast
            </span>
          </div>

          {/* SMS Message Bubble */}
          <div className="relative rounded-2xl bg-gradient-to-b from-slate-800 to-slate-850 p-4 border border-slate-700/80 shadow-lg text-slate-100">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700 text-xs">
              <span className="font-bold tracking-wider text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                SIMULATED SMS ALERT
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded">
                AUTONOTIFY-IOT
              </span>
            </div>

            {/* Exact Required SMS Format */}
            <div className="font-mono text-xs leading-relaxed space-y-2 text-slate-200 whitespace-pre-line bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-400">Sensor: </span>
                <span className="text-cyan-300 font-semibold">{alert.sensorName}</span>
              </div>
              <div>
                <span className="text-slate-400">Detected Value: </span>
                <span className="text-rose-400 font-bold">
                  {alert.detectedValue} {alert.unit}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Safe Threshold: </span>
                <span className="text-emerald-400 font-semibold">{alert.safeThreshold}</span>
              </div>
              <div className="pt-2 text-amber-200/90 font-sans text-[11px] border-t border-slate-800/80 leading-normal">
                Warning: Water quality parameter has exceeded the defined safe limit. Please inspect the water source.
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
              <span>Delivery Status: Delivered (Simulated)</span>
              <span>Network: Cellular/IoT Node</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            id="copy-sms-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Copied to Clipboard
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy SMS Text
              </>
            )}
          </button>

          <button
            id="acknowledge-sms-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors cursor-pointer shadow-md shadow-rose-900/40"
          >
            Acknowledge &amp; Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};
