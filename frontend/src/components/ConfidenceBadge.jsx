import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';

export default function ConfidenceBadge({ score = 0.90, showText = true, size = 'md' }) {
  const pct = Math.round(score * 100);
  
  let tier = 'HIGH';
  let colorClasses = 'bg-emerald-950/70 border-emerald-700/60 text-emerald-400';
  let Icon = CheckCircle2;

  if (score < 0.70) {
    tier = 'LOW';
    colorClasses = 'bg-rose-950/70 border-rose-700/60 text-rose-400';
    Icon = AlertCircle;
  } else if (score < 0.90) {
    tier = 'MEDIUM';
    colorClasses = 'bg-amber-950/70 border-amber-700/60 text-amber-400';
    Icon = AlertTriangle;
  }

  const sizeClasses = size === 'sm' 
    ? 'text-[10px] px-1.5 py-0.5' 
    : 'text-xs px-2.5 py-1';

  return (
    <div className={`inline-flex items-center gap-1.5 font-mono font-medium rounded border ${colorClasses} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{pct}%</span>
      {showText && <span className="opacity-80 text-[10px] tracking-wide">({tier})</span>}
    </div>
  );
}
