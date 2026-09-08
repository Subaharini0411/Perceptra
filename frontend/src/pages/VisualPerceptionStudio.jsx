import React, { useState, useEffect } from 'react';
import { 
  ScanEye, 
  Camera, 
  Sparkles, 
  Code, 
  Layers, 
  RefreshCw, 
  CheckCircle2,
  Sliders,
  Maximize2
} from 'lucide-react';
import PerceptionOverlay from '../components/PerceptionOverlay';
import ConfidenceBadge from '../components/ConfidenceBadge';
import { api } from '../services/api';

export default function VisualPerceptionStudio() {
  const [screenshot, setScreenshot] = useState(null);
  const [detections, setDetections] = useState([]);
  const [hybridMatches, setHybridMatches] = useState([]);
  const [telemetry, setTelemetry] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL', 'BUTTON', 'INPUT', 'CARD', 'LINK'
  const [selectedElement, setSelectedElement] = useState(null);

  const fetchPerceptionData = async () => {
    setIsLoading(true);
    try {
      const data = await api.analyzePerception();
      if (data.screenshot) setScreenshot(data.screenshot);
      if (data.visualDetections) setDetections(data.visualDetections);
      if (data.hybridMatches) {
        setHybridMatches(data.hybridMatches);
        if (data.hybridMatches.length > 0) setSelectedElement(data.hybridMatches[0]);
      }
      if (data.telemetry) setTelemetry(data.telemetry);
      if (data.modelInfo) setModelInfo(data.modelInfo);
    } catch (err) {
      console.error('Failed to run visual perception:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerceptionData();
  }, []);

  const filteredDetections = activeTab === 'ALL'
    ? detections
    : detections.filter(d => (d.label || '').toUpperCase() === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0b1222] border border-space-border rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2.5">
            <ScanEye className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold font-mono text-white">Visual Perception & Detection Studio</h2>
            <span className="text-[10px] bg-cyan-950 border border-cyan-800 text-cyan-400 font-mono px-2 py-0.5 rounded">
              {modelInfo?.modelName || 'Local CV Detector (CPU)'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time on-device spatial bounding box extraction and multi-class UI element segmentation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPerceptionData}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Run Detection
          </button>
        </div>
      </div>

      {/* Main Studio Viewport & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-[#080d1a] border border-space-border rounded-xl p-4 flex flex-col items-center justify-center">
          {/* Element Type Filter Chips */}
          <div className="flex items-center gap-2 mb-3 w-full overflow-x-auto text-[11px] font-mono no-scrollbar">
            {['ALL', 'BUTTON', 'INPUT', 'CARD', 'LINK', 'CHECKBOX'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1 rounded-md border transition-all ${
                  activeTab === tab
                    ? 'bg-cyan-950 border-cyan-600 text-cyan-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab} ({tab === 'ALL' ? detections.length : detections.filter(d => (d.label || '').toUpperCase() === tab).length})
              </button>
            ))}
          </div>

          <div className="relative border border-slate-800 rounded-lg overflow-hidden bg-black max-w-full">
            {screenshot ? (
              <div className="relative inline-block">
                <img
                  src={`data:image/jpeg;base64,${screenshot}`}
                  alt="Detected Viewport"
                  className="block max-w-full h-auto"
                />
                <PerceptionOverlay 
                  detections={filteredDetections}
                  activeTarget={selectedElement}
                />
              </div>
            ) : (
              <div className="w-full h-96 flex items-center justify-center text-slate-500 font-mono text-xs">
                Capturing visual buffer...
              </div>
            )}
          </div>
        </div>

        {/* Inspector Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Telemetry info */}
          <div className="bg-[#0b1222] border border-space-border rounded-xl p-4 font-mono text-xs space-y-3">
            <h3 className="font-bold text-slate-200 flex items-center justify-between">
              <span>Perception Engine Telemetry</span>
              <span className="text-[10px] text-emerald-400 font-normal">● ON-DEVICE</span>
            </h3>

            <div className="space-y-1.5 text-slate-400 text-[11px]">
              <div className="flex justify-between">
                <span>Model Backend:</span>
                <span className="text-white">{modelInfo?.isDemoDetector ? 'Local Deterministic CV' : 'ONNX Model'}</span>
              </div>
              <div className="flex justify-between">
                <span>Inference Device:</span>
                <span className="text-cyan-400">CPU (Air-Gapped)</span>
              </div>
              <div className="flex justify-between">
                <span>Inference Latency:</span>
                <span className="text-amber-400">{telemetry?.latencyMs || 12} ms</span>
              </div>
              <div className="flex justify-between">
                <span>Elements Segmented:</span>
                <span className="text-white">{detections.length} objects</span>
              </div>
            </div>
          </div>

          {/* Selected Element Candidate Details */}
          <div className="bg-[#0b1222] border border-space-border rounded-xl p-4 font-mono text-xs space-y-3">
            <h3 className="font-bold text-slate-200">Candidate Inspector</h3>

            {selectedElement ? (
              <div className="space-y-3">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1.5 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Target:</span>
                    <span className="text-cyan-300 font-semibold truncate max-w-[160px]">
                      {selectedElement.targetName || selectedElement.selector}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Classification:</span>
                    <span className="text-emerald-400 font-bold">{selectedElement.matchedVisualLabel}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Center Coordinates:</span>
                    <span className="text-white">({selectedElement.coordinates.x}, {selectedElement.coordinates.y})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Confidence:</span>
                    <ConfidenceBadge score={selectedElement.confidence} size="sm" />
                  </div>
                </div>

                {/* Score breakdown for selected element */}
                <div className="space-y-1.5 text-[11px]">
                  <div className="text-slate-400 font-semibold mb-1">Affinity Scores:</div>
                  <div className="flex justify-between text-slate-300">
                    <span>Visual Score:</span>
                    <span>{selectedElement.scores?.visual}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>DOM Score:</span>
                    <span>{selectedElement.scores?.dom}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Text Score:</span>
                    <span>{selectedElement.scores?.text}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Position Score:</span>
                    <span>{selectedElement.scores?.position}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Semantic Score:</span>
                    <span>{selectedElement.scores?.semantic}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-[11px]">Click an element candidate below to inspect.</p>
            )}
          </div>

          {/* Candidates List */}
          <div className="bg-[#0b1222] border border-space-border rounded-xl p-4 font-mono text-xs max-h-64 overflow-y-auto space-y-2">
            <h4 className="font-bold text-slate-300 mb-2">Detected UI Candidates ({hybridMatches.length})</h4>
            {hybridMatches.slice(0, 8).map((c, i) => (
              <div
                key={c.id || i}
                onClick={() => setSelectedElement(c)}
                className={`p-2 rounded border cursor-pointer transition-all text-[11px] ${
                  selectedElement?.id === c.id
                    ? 'bg-cyan-950/70 border-cyan-500 text-cyan-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold truncate">{c.targetName || c.selector}</span>
                  <span className="text-emerald-400 font-bold">{Math.round(c.confidence * 100)}%</span>
                </div>
                <div className="text-[10px] text-slate-500 flex justify-between mt-0.5">
                  <span>Type: {c.matchedVisualLabel}</span>
                  <span>({c.coordinates.x}, {c.coordinates.y})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
