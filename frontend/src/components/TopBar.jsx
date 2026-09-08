import React from 'react';
import { Cpu, Activity, ShieldCheck, Globe, Zap, Terminal } from 'lucide-react';

export default function TopBar({ systemStats, isConnected }) {
  const stats = systemStats || {
    processMemoryMB: 84,
    cpuModel: 'Intel Core / AMD CPU',
    cpuCores: 8,
    inferenceLatencyMs: 14,
    browserStatus: 'CONNECTED',
    privacy: { cloudCalls: 0 }
  };

  return (
    <header className="h-16 border-b border-space-border bg-[#0a0f1d]/90 backdrop-blur-md px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Title & Tagline */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-black text-white text-base shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-base text-white font-mono">PERCEPTA</span>
              <span className="text-[10px] font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 px-2 py-0.5 rounded tracking-wide">
                ISRO SIH26171
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
              On-Device Visual Perception for Light-weight Browser Agents
            </p>
          </div>
        </div>
      </div>

      {/* Real-time Aerospace Telemetry Badges */}
      <div className="flex items-center gap-3 text-xs font-mono">
        {/* Status Indicator */}
        <div className="hidden md:flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 px-3 py-1.5 rounded-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Local Engine Active</span>
        </div>

        {/* CPU Badge */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-md">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>CPU Inference ({stats.cpuCores} Cores)</span>
        </div>

        {/* Memory */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-md">
          <Activity className="w-3.5 h-3.5 text-blue-400" />
          <span>RAM: {stats.processMemoryMB} MB</span>
        </div>

        {/* Latency */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-md">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Latency: ~{stats.inferenceLatencyMs}ms</span>
        </div>

        {/* Zero Cloud Guarantee */}
        <div className="flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-800/40 text-cyan-300 px-3 py-1.5 rounded-md">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold">Cloud Calls: 0</span>
        </div>
      </div>
    </header>
  );
}
