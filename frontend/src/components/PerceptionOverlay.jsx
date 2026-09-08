import React from 'react';

export default function PerceptionOverlay({ detections = [], activeTarget, showLabels = true }) {
  if (!detections || detections.length === 0) return null;

  // Visual label colors
  const getColor = (label) => {
    switch ((label || '').toUpperCase()) {
      case 'BUTTON': return { border: 'border-emerald-400', bg: 'bg-emerald-500/20', text: 'bg-emerald-600 text-white' };
      case 'INPUT': return { border: 'border-cyan-400', bg: 'bg-cyan-500/20', text: 'bg-cyan-600 text-white' };
      case 'CARD': return { border: 'border-purple-400', bg: 'bg-purple-500/15', text: 'bg-purple-600 text-white' };
      case 'LINK': return { border: 'border-amber-400', bg: 'bg-amber-500/20', text: 'bg-amber-600 text-white' };
      case 'CHECKBOX': return { border: 'border-pink-400', bg: 'bg-pink-500/20', text: 'bg-pink-600 text-white' };
      default: return { border: 'border-blue-400', bg: 'bg-blue-500/15', text: 'bg-blue-600 text-white' };
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {detections.map((det, index) => {
        const bbox = det.bbox || det;
        const color = getColor(det.label || det.matchedVisualLabel);
        const isActive = activeTarget && (
          (activeTarget.coordinates?.x >= bbox.x && activeTarget.coordinates?.x <= bbox.x + bbox.width &&
           activeTarget.coordinates?.y >= bbox.y && activeTarget.coordinates?.y <= bbox.y + bbox.height) ||
          activeTarget.id === det.id
        );

        return (
          <div
            key={det.id || index}
            style={{
              left: `${bbox.x}px`,
              top: `${bbox.y}px`,
              width: `${bbox.width}px`,
              height: `${bbox.height}px`
            }}
            className={`absolute border transition-all duration-300 ${
              isActive 
                ? 'border-2 border-cyan-300 bg-cyan-400/30 shadow-[0_0_15px_rgba(6,182,212,0.6)] z-20 animate-pulse'
                : `${color.border} ${color.bg} border opacity-75 hover:opacity-100 z-10`
            }`}
          >
            {showLabels && (
              <div 
                className={`absolute -top-5 left-0 px-1 py-0.2 text-[9px] font-mono font-bold tracking-tight rounded-t ${color.text} flex items-center gap-1 shadow-sm`}
              >
                <span>{det.label || 'NODE'}</span>
                <span>{Math.round((det.confidence || 0.9) * 100)}%</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
