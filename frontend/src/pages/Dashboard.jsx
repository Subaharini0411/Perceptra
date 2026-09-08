import React from 'react';
import { 
  Activity, 
  CheckCircle2, 
  Cpu, 
  Eye, 
  Globe, 
  Lock, 
  Play, 
  RefreshCw, 
  Zap, 
  Layers,
  ArrowUpRight
} from 'lucide-react';
import ConfidenceBadge from '../components/ConfidenceBadge';

export default function Dashboard({ stats, history = [], onStartAgent, onNavigate }) {
  const hasRealTasks = history.length > 0;
  
  // Real stats or initial demo stats
  const metrics = hasRealTasks ? {
    tasksExecuted: history.length,
    successfulTasks: history.filter(t => t.status === 'SUCCESS').length,
    avgConfidence: (history.reduce((acc, t) => acc + (t.confidence || 0.9), 0) / history.length).toFixed(2),
    avgLatencyMs: Math.round(history.reduce((acc, t) => acc + (t.executionDurationMs || 1800), 0) / history.length),
    selfCorrections: history.reduce((acc, t) => acc + (t.retries || 0), 0),
    isDemoData: false
  } : {
    tasksExecuted: 42,
    successfulTasks: 39,
    avgConfidence: 0.94,
    avgLatencyMs: 1850,
    selfCorrections: 3,
    isDemoData: true
  };

  const statusCards = [
    { label: 'Agent Status', value: 'LOCAL / ONLINE', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-950/20 border-emerald-800/40' },
    { label: 'Visual Perception', value: 'READY', icon: Eye, color: 'text-cyan-400', bg: 'bg-cyan-950/20 border-cyan-800/40' },
    { label: 'Browser Automation', value: 'CONNECTED', icon: Globe, color: 'text-blue-400', bg: 'bg-blue-950/20 border-blue-800/40' },
    { label: 'Inference Device', value: 'ON-DEVICE CPU', icon: Cpu, color: 'text-purple-400', bg: 'bg-purple-950/20 border-purple-800/40' },
    { label: 'Privacy Boundary', value: 'LOCAL ONLY (0 CLOUD)', icon: Lock, color: 'text-amber-400', bg: 'bg-amber-950/20 border-amber-800/40' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1222] border border-space-border rounded-xl p-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-mono text-white">ISRO Mission Telemetry & Agent Operations</h2>
            <span className="text-[10px] bg-cyan-950 border border-cyan-700/60 text-cyan-400 font-mono px-2 py-0.5 rounded">
              SIH26171
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time control station for on-device visual browser automation and perception models.
          </p>
        </div>

        <button
          onClick={onStartAgent}
          className="px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-colors shrink-0"
        >
          <Play className="w-4 h-4 fill-current" />
          Start Agent Workspace
        </button>
      </div>

      {/* 5 Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statusCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`p-4 rounded-xl border ${card.bg} flex flex-col justify-between`}>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-mono">{card.label}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className={`font-mono font-bold text-sm ${card.color}`}>
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Metrics Section */}
      <div className="bg-[#0b1222] border border-space-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-space-border">
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-sm font-bold text-slate-200">Execution Telemetry</h3>
            {metrics.isDemoData && (
              <span className="text-[10px] bg-amber-950/60 border border-amber-800/60 text-amber-300 font-mono px-2 py-0.5 rounded">
                DEMONSTRATION SAMPLE DATA
              </span>
            )}
          </div>
          <button 
            onClick={() => onNavigate('benchmarks')}
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-mono"
          >
            View Full Benchmarks <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center font-mono">
          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-2xl font-black text-white">{metrics.tasksExecuted}</div>
            <div className="text-[11px] text-slate-400 mt-1">Tasks Executed</div>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-2xl font-black text-emerald-400">{metrics.successfulTasks}</div>
            <div className="text-[11px] text-slate-400 mt-1">Successful Tasks</div>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-2xl font-black text-cyan-400">{Math.round(metrics.avgConfidence * 100)}%</div>
            <div className="text-[11px] text-slate-400 mt-1">Avg Confidence</div>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-2xl font-black text-blue-400">{(metrics.avgLatencyMs / 1000).toFixed(1)}s</div>
            <div className="text-[11px] text-slate-400 mt-1">Avg Execution Time</div>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-2xl font-black text-amber-400">{metrics.selfCorrections}</div>
            <div className="text-[11px] text-slate-400 mt-1">Self-Corrections</div>
          </div>
        </div>
      </div>

      {/* Quick Launch Pre-Built Tasks */}
      <div className="bg-[#0b1222] border border-space-border rounded-xl p-6">
        <h3 className="font-mono text-sm font-bold text-slate-200 mb-4">
          Pre-Configured ISRO Mission Tasks
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <button
            onClick={() => onStartAgent('Search for ISRO missions')}
            className="p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group"
          >
            <div className="text-cyan-400 font-semibold mb-1 flex items-center justify-between">
              <span>Task 1: Search Missions</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-slate-400 text-[11px]">"Search for ISRO missions"</p>
          </button>

          <button
            onClick={() => onStartAgent('Open the Chandrayaan mission card')}
            className="p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 text-left transition-all group"
          >
            <div className="text-blue-400 font-semibold mb-1 flex items-center justify-between">
              <span>Task 2: Open Chandrayaan</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-slate-400 text-[11px]">"Open the Chandrayaan mission card"</p>
          </button>

          <button
            onClick={() => onStartAgent('Fill the contact form with sample data')}
            className="p-3 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/50 text-left transition-all group"
          >
            <div className="text-amber-400 font-semibold mb-1 flex items-center justify-between">
              <span>Task 3: Payload Proposal</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <p className="text-slate-400 text-[11px]">"Fill the contact form with sample data" (Sensitive)</p>
          </button>
        </div>
      </div>
    </div>
  );
}
