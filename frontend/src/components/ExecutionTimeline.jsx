import React from 'react';
import { 
  CheckCircle2, 
  CircleDot, 
  Loader2, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  Scan, 
  Terminal,
  MousePointerClick
} from 'lucide-react';
import ConfidenceBadge from './ConfidenceBadge';
import ScoreBreakdown from './ScoreBreakdown';

export default function ExecutionTimeline({ 
  events = [], 
  latestScores, 
  isExecuting, 
  onStop,
  weights
}) {
  return (
    <div className="flex flex-col h-full bg-[#080d1a] border border-space-border rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-[#0f172a] px-4 py-2.5 border-b border-space-border flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">Agent Execution Timeline</span>
        </div>
        {isExecuting && (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-cyan-400 text-[11px]">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Perceiving & Acting...
            </span>
            <button
              onClick={onStop}
              className="bg-rose-950/60 border border-rose-700/60 text-rose-300 hover:bg-rose-900/60 px-2 py-0.5 rounded text-[11px] font-semibold transition-colors"
            >
              Stop
            </button>
          </div>
        )}
      </div>

      {/* Timeline Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 space-y-2">
            <CircleDot className="w-8 h-8 text-slate-700" />
            <p className="text-xs">No active execution. Select or type a task above.</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
            {events.map((evt, idx) => {
              const isLast = idx === events.length - 1;
              let Icon = CheckCircle2;
              let iconColor = 'text-emerald-400';
              let badgeBorder = 'border-emerald-500/30';
              let bgColor = 'bg-slate-900/60';

              if (evt.status === 'IN_PROGRESS' || evt.status === 'EXECUTING') {
                Icon = Loader2;
                iconColor = 'text-cyan-400 animate-spin';
                badgeBorder = 'border-cyan-500/50';
                bgColor = 'bg-cyan-950/20';
              } else if (evt.status === 'FAILED' || evt.type === 'SELF_CORRECTION') {
                Icon = AlertTriangle;
                iconColor = 'text-amber-400';
                badgeBorder = 'border-amber-500/50';
                bgColor = 'bg-amber-950/20';
              }

              return (
                <div key={idx} className="relative group">
                  {/* Step Dot Icon */}
                  <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[#080d1a] flex items-center justify-center">
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                  </div>

                  {/* Step Box */}
                  <div className={`p-3 rounded-lg border ${badgeBorder} ${bgColor} transition-all`}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-200 text-xs">
                        {evt.title || evt.name || 'Agent Step'}
                      </span>
                      {evt.confidence && (
                        <ConfidenceBadge score={evt.confidence} size="sm" />
                      )}
                    </div>

                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      {evt.detail || evt.message}
                    </p>

                    {/* Self-Correction Diagnostic Alert */}
                    {evt.recoveryPlan && (
                      <div className="mt-2 p-2 bg-amber-950/40 border border-amber-800/40 rounded text-amber-300 text-[10px] space-y-1">
                        <div className="font-semibold flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          SELF-CORRECTION ENGAGED (Attempt {evt.attempt}/{evt.maxRetries})
                        </div>
                        <div>Reason: {evt.error}</div>
                        <div className="text-amber-200/80">Strategy: {evt.recoveryPlan.strategy}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Live Score Breakdown Drawer */}
        {latestScores && (
          <div className="pt-2">
            <ScoreBreakdown scores={latestScores} weights={weights} />
          </div>
        )}
      </div>
    </div>
  );
}
