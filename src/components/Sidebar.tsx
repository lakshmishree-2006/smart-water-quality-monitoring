
import React from 'react';
import {
  LayoutDashboard,
  SlidersHorizontal,
  Bell,
  History,
  Cpu,
  Layers,
  Droplets,
  ChartNoAxesCombined,
  Microscope,
  FileText,
  Settings,
  House,
} from 'lucide-react';
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
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'sources' as ViewTab,
      label: 'Water Sources',
      icon: <Droplets className="w-4 h-4" />,
    },
    {
      id: 'analytics' as ViewTab,
      label: 'Analytics',
      icon: <ChartNoAxesCombined className="w-4 h-4" />,
    },
    {
      id: 'contamination' as ViewTab,
      label: 'Contamination Tests',
      icon: <Microscope className="w-4 h-4" />,
    },
    {
      id: 'alerts' as ViewTab,
      label: 'Alerts & Incidents',
      icon: <Bell className="w-4 h-4" />,
      badge: alertCount > 0 ? alertCount : null,
      badgeColor: isContaminated
        ? 'bg-rose-500 text-white'
        : 'bg-slate-700 text-slate-300',
    },
    {
      id: 'history' as ViewTab,
      label: 'Historical Data',
      icon: <History className="w-4 h-4" />,
    },
    {
      id: 'reports' as ViewTab,
      label: 'Reports',
      icon: <FileText className="w-4 h-4" />,
    },
    {
      id: 'settings' as ViewTab,
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
    {
      id: 'controller' as ViewTab,
      label: 'Simulation Controller',
      icon: <SlidersHorizontal className="w-4 h-4" />,
      badge: 'Demo',
    },
  ];

  return (
    <aside
      id="app-sidebar"
      className="w-full md:w-64 bg-slate-700 border-r border-slate-600 p-4 flex flex-col justify-between shrink-0"
    >
      <div className="space-y-6">
        <div className="px-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
            <Droplets className="w-5 h-5 text-teal-400" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">AquaGuard</div>
            <div className="text-[10px] text-slate-200">
              Water Quality Monitor
            </div>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-200 px-3 mb-2">
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
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
                      : 'text-slate-200 hover:text-white hover:bg-slate-600 border border-transparent'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-teal-400' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </span>
                  {'badge' in item && item.badge != null && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        'badgeColor' in item && item.badgeColor
                          ? item.badgeColor
                          : 'bg-slate-800 text-teal-300'
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

        <div className="p-3.5 rounded-xl bg-slate-600 border border-slate-500 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Cpu className="w-4 h-4 text-teal-400" />
            Device Monitoring
          </div>

          <div className="text-[11px] text-slate-200 leading-relaxed">
            Hardware integration pending. Sensor readings depend on the
            configured data source.
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            <House className="w-3.5 h-3.5" />
            Household water priority
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-500 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
          <Layers className="w-3.5 h-3.5 text-teal-400" />
          <span>Water Quality Dashboard</span>
        </div>
        <p className="text-[10px] leading-relaxed">
          Monitoring and test-result tracking. Contamination tests require
          actual measurements or laboratory results.
        </p>
      </div>
    </aside>
  );
};
