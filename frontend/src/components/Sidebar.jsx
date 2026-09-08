import React from 'react';
import { 
  LayoutDashboard, 
  Bot, 
  ScanEye, 
  Globe, 
  History, 
  BarChart3, 
  Shield, 
  Settings as SettingsIcon,
  Sparkles,
  Lock,
  Cpu,
  Radio
} from 'lucide-react';

export default function Sidebar({ currentTab, setTab }) {
  const menuItems = [
    { id: 'landing', label: 'Overview', icon: Sparkles },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workspace', label: 'Agent Workspace', icon: Bot, highlight: true },
    { id: 'visual', label: 'Visual Perception', icon: ScanEye },
    { id: 'browser', label: 'Browser Testbed', icon: Globe },
    { id: 'history', label: 'Task History', icon: History },
    { id: 'benchmarks', label: 'Benchmarks', icon: BarChart3 },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-[#090d1a] border-r border-space-border flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] select-none">
      {/* Navigation List */}
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[10px] font-mono tracking-widest text-slate-500 uppercase">
          Autonomous Mission Control
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-950/70 to-blue-950/40 text-cyan-400 border border-cyan-700/50 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
              } ${item.highlight && !isActive ? 'border-dashed border-cyan-900/60' : ''}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.highlight && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Local Edge Privacy Status Footer */}
      <div className="p-4 border-t border-space-border bg-[#070a14]">
        <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800/80 space-y-2 text-[11px] font-mono">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              Mode
            </span>
            <span className="text-emerald-400 font-semibold">LOCAL ONLY</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Inference
            </span>
            <span className="text-cyan-400 font-semibold">ON-DEVICE CPU</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Privacy
            </span>
            <span className="text-amber-400 font-semibold">AIR-GAPPED READY</span>
          </div>
        </div>

        <div className="mt-3 text-[10px] text-center text-slate-600 font-mono">
          PERCEPTA v1.0.0 • ISRO Space Agent
        </div>
      </div>
    </aside>
  );
}
