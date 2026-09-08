import React from 'react';

export default function ScoreBreakdown({ scores, weights }) {
  const currentScores = scores || {
    visual: 0.92,
    dom: 0.95,
    text: 0.94,
    position: 0.88,
    semantic: 0.96,
    finalHybrid: 0.93
  };

  const currentWeights = weights || {
    visual: 0.30,
    dom: 0.25,
    text: 0.20,
    position: 0.10,
    semantic: 0.15
  };

  const factors = [
    { key: 'visual', label: 'Visual Score', score: currentScores.visual, weight: currentWeights.visual, color: 'bg-cyan-500' },
    { key: 'dom', label: 'DOM Structure', score: currentScores.dom, weight: currentWeights.dom, color: 'bg-blue-500' },
    { key: 'text', label: 'Text Semantics', score: currentScores.text, weight: currentWeights.text, color: 'bg-emerald-500' },
    { key: 'position', label: 'Position Geometry', score: currentScores.position, weight: currentWeights.position, color: 'bg-amber-500' },
    { key: 'semantic', label: 'Intent Affinity', score: currentScores.semantic, weight: currentWeights.semantic, color: 'bg-purple-500' },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 font-mono text-xs">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-800">
        <span className="font-semibold text-slate-300">Hybrid Perception Breakdown</span>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Final:</span>
          <span className="text-cyan-400 font-bold text-sm">
            {Math.round(currentScores.finalHybrid * 100)}%
          </span>
        </div>
      </div>

      <div className="space-y-2.5">
        {factors.map(f => {
          const pct = Math.round(f.score * 100);
          return (
            <div key={f.key}>
              <div className="flex justify-between text-[11px] mb-1 text-slate-400">
                <span>{f.label} <span className="text-slate-500">({Math.round(f.weight * 100)}% wt)</span></span>
                <span className="text-slate-200 font-semibold">{f.score.toFixed(2)}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${f.color} rounded-full transition-all duration-300`} 
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
