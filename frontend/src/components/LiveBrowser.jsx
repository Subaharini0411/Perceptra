import React, { useState } from 'react';
import { Eye, EyeOff, Globe, RefreshCw, Layers, Crosshair } from 'lucide-react';
import PerceptionOverlay from './PerceptionOverlay';

export default function LiveBrowser({ 
  screenshot, 
  detections = [], 
  activeTarget, 
  currentUrl = 'http://localhost:5000/demo/index.html',
  onRefresh
}) {
  const [showOverlay, setShowOverlay] = useState(true);

  return (
    <div className="flex flex-col h-full bg-[#080d1a] border border-space-border rounded-xl overflow-hidden shadow-2xl">
      {/* Mock Browser Header / URL bar */}
      <div className="bg-[#0f172a] px-4 py-2.5 border-b border-space-border flex items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
          </div>
          <button 
            onClick={onRefresh}
            className="p-1 hover:text-cyan-400 transition-colors ml-2" 
            title="Refresh Viewport"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* URL Bar */}
        <div className="flex-1 max-w-xl bg-slate-950/80 border border-slate-800 rounded px-3 py-1 text-slate-300 flex items-center gap-2 text-[11px] truncate">
          <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-cyan-300 truncate">{currentUrl}</span>
        </div>

        {/* Overlay Toggle Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowOverlay(!showOverlay)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border text-[11px] transition-colors ${
              showOverlay
                ? 'bg-cyan-950/60 border-cyan-700/60 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>CV Overlay {showOverlay ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Viewport Canvas Container */}
      <div className="relative flex-1 bg-black/50 overflow-auto flex items-start justify-center p-2">
        {screenshot ? (
          <div className="relative inline-block border border-slate-800 rounded shadow-md overflow-hidden bg-space-950">
            <img
              src={`data:image/jpeg;base64,${screenshot}`}
              alt="Live Browser Viewport"
              className="block max-w-full h-auto select-none"
              style={{ maxHeight: 'calc(100vh - 19rem)' }}
            />

            {/* Bounding Box Visual Overlays */}
            {showOverlay && (
              <PerceptionOverlay 
                detections={detections} 
                activeTarget={activeTarget} 
              />
            )}

            {/* Action Crosshair Cursor Indicator */}
            {activeTarget?.coordinates && (
              <div
                style={{
                  left: `${activeTarget.coordinates.x}px`,
                  top: `${activeTarget.coordinates.y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
                className="absolute pointer-events-none z-30 flex items-center justify-center animate-bounce"
              >
                <div className="w-8 h-8 rounded-full border-2 border-cyan-400 flex items-center justify-center bg-cyan-400/20 shadow-[0_0_12px_#22d3ee]">
                  <Crosshair className="w-5 h-5 text-cyan-200" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-80 text-slate-500 space-y-3 font-mono text-xs">
            <Globe className="w-10 h-10 text-slate-600 animate-pulse" />
            <p>Browser viewport standby. Run a task to launch live preview.</p>
          </div>
        )}
      </div>
    </div>
  );
}
