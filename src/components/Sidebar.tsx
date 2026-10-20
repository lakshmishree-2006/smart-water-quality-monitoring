import React from 'react';
import { LayoutDashboard, Sliders, Bell, History, ShieldAlert, Cpu, Layers } from 'lucide-react';
import { ViewTab } from '../types';

interface SidebarProps {
  activeTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  alertCount: number;
  isContaminated: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  alertCount,
  isContaminated,
}) => {
  const navItems = [
    {
      id: 'dashboard' as ViewTab,
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: null,
    },
    {
      id: 'controller' as ViewTab,
      label: 'Simulation Controller',
      icon: <Sliders className="w-4 h-4" />,
      badge: 'Live',
    },
    {
      id: 'alerts' as ViewTab,
      label: 'Alerts & Incidents',
      icon: <Bell className="w-4 h-4" />,
      badge: alertCount > 0 ? alertCount : null,
      badgeColor: isContaminated ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-700 text-slate-300',
    },
    {
      id: 'history' as ViewTab,
      label: 'Historical Data',
      icon: <History className="w-4 h-4" />,
      badge: null,
    },
  ];

  return (
    <aside
      id="app-sidebar"
      className="w-full md:w-64 bg-slate-950/80 border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0"
    >
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Main Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/20 text-cyan-200 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-cyan-400' : 'text-slate-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-slate-800 text-cyan-300 border border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Telemetry Node Info Card */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Node Hardware
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="space-y-1.5 text-[11px] font-mono text-slate-400">
            <div className="flex justify-between">
              <span>MCU:</span>
              <span className="text-slate-200">ESP32 Dual-Core</span>
            </div>
            <div className="flex justify-between">
              <span>Sensors:</span>
              <span className="text-slate-200">Analog/I2C 4-Ch</span>
            </div>
            <div className="flex justify-between">
              <span>Baud:</span>
              <span className="text-slate-200">115200 bps</span>
            </div>
            <div className="flex justify-between">
              <span>Alert Module:</span>
              <span className="text-slate-200">SIM800L (Sim)</span>
            </div>
          </div>
        </div>
      </div>

      {/* College Project Guide Showcase Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Mini Project Demo</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Visual Software Demonstration with Simulated IoT Sensor Feeds &amp; Automated Threshold SMS Routing.
        </p>
      </div>
    </aside>
  );
};
