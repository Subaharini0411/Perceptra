import React, { useState } from 'react';
import { Settings as SettingsIcon, Sliders, Save, CheckCircle2, Shield, Cpu } from 'lucide-react';
import { api } from '../services/api';

export default function Settings({ weights, setWeights }) {
  const [localWeights, setLocalWeights] = useState(weights || {
    visual: 0.30,
    dom: 0.25,
    text: 0.20,
    position: 0.10,
    semantic: 0.15
  });

  const [settings, setSettings] = useState({
    inferenceMode: 'CPU',
    visualModel: 'Local Edge CV Detector (CPU)',
    confidenceThreshold: 0.70,
    autoRetry: true,
    maxRetries: 2,
    sensitiveConfirmation: true,
    offlineMode: true,
    debugOverlay: true
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSaveWeights = async () => {
    try {
      await api.updateWeights(localWeights);
      if (setWeights) setWeights(localWeights);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      console.error('Failed to update weights:', err);
    }
  };

  const handleWeightChange = (key, val) => {
    setLocalWeights(prev => ({
      ...prev,
      [key]: parseFloat(val)
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#0b1222] border border-space-border rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <SettingsIcon className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-mono text-white">Agent & Engine Settings</h2>
            <p className="text-xs text-slate-400 font-mono">Tune inference models, perception fusion weights, and safety thresholds</p>
          </div>
        </div>

        {isSaved && (
          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1.5 rounded-md">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved</span>
          </div>
        )}
      </div>

      {/* Core Runtime Parameters */}
      <div className="bg-[#0b1222] border border-space-border rounded-xl p-6 space-y-5 font-mono text-xs">
        <h3 className="font-bold text-slate-200 text-sm border-b border-slate-800 pb-2">
          Inference & Execution Policy
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block mb-1">Inference Mode</span>
            <span className="text-cyan-400 font-bold">{settings.inferenceMode} (Low Power / On-Device)</span>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
            <span className="text-slate-400 block mb-1">Active Visual Model</span>
            <span className="text-white font-bold">{settings.visualModel}</span>
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-slate-200 block font-semibold">Sensitive Action Confirmation</span>
              <span className="text-[11px] text-slate-500">Require manual clearance before submits/logins</span>
            </div>
            <input 
              type="checkbox" 
              checked={settings.sensitiveConfirmation}
              onChange={(e) => setSettings({ ...settings, sensitiveConfirmation: e.target.checked })}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-slate-200 block font-semibold">Autonomous Auto-Retry</span>
              <span className="text-[11px] text-slate-500">Re-perceive on interaction failure (Max: {settings.maxRetries})</span>
            </div>
            <input 
              type="checkbox" 
              checked={settings.autoRetry}
              onChange={(e) => setSettings({ ...settings, autoRetry: e.target.checked })}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-slate-200 block font-semibold">Air-Gapped Offline Mode</span>
              <span className="text-[11px] text-slate-500">Strictly disallow remote outbound calls</span>
            </div>
            <input 
              type="checkbox" 
              checked={settings.offlineMode}
              onChange={(e) => setSettings({ ...settings, offlineMode: e.target.checked })}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-slate-200 block font-semibold">Debug Bounding Box Overlay</span>
              <span className="text-[11px] text-slate-500">Render spatial computer vision targets</span>
            </div>
            <input 
              type="checkbox" 
              checked={settings.debugOverlay}
              onChange={(e) => setSettings({ ...settings, debugOverlay: e.target.checked })}
              className="w-4 h-4 accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Hybrid Perception Weights Tuning */}
      <div className="bg-[#0b1222] border border-space-border rounded-xl p-6 space-y-6 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h3 className="font-bold text-slate-200 text-sm">Hybrid Perception Weights Configuration</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              hybridScore = w_v * visual + w_d * dom + w_t * text + w_p * pos + w_s * semantic
            </p>
          </div>
          <button
            onClick={handleSaveWeights}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Apply Weights
          </button>
        </div>

        <div className="space-y-4">
          {[
            { key: 'visual', label: 'Visual Score Weight (w_v)', val: localWeights.visual },
            { key: 'dom', label: 'DOM Score Weight (w_d)', val: localWeights.dom },
            { key: 'text', label: 'Text Semantic Score Weight (w_t)', val: localWeights.text },
            { key: 'position', label: 'Position Geometry Weight (w_p)', val: localWeights.position },
            { key: 'semantic', label: 'Intent Affinity Weight (w_s)', val: localWeights.semantic },
          ].map(f => (
            <div key={f.key} className="space-y-1.5">
              <div className="flex justify-between text-slate-300 text-xs">
                <span>{f.label}</span>
                <span className="font-bold text-cyan-400">{(f.val * 100).toFixed(0)}% ({f.val.toFixed(2)})</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={f.val}
                onChange={(e) => handleWeightChange(f.key, e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
