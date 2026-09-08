import React, { useState, useEffect } from 'react';
import { Play, Square, RotateCcw, Send, Sparkles, Terminal, Info } from 'lucide-react';
import LiveBrowser from '../components/LiveBrowser';
import ExecutionTimeline from '../components/ExecutionTimeline';
import SafetyModal from '../components/SafetyModal';
import { api } from '../services/api';

export default function AgentWorkspace({ initialTask = '', weights }) {
  const [taskInput, setTaskInput] = useState(initialTask || 'Search for ISRO missions');
  const [isExecuting, setIsExecuting] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [currentScreenshot, setCurrentScreenshot] = useState(null);
  const [visualDetections, setVisualDetections] = useState([]);
  const [activeTarget, setActiveTarget] = useState(null);
  const [latestScores, setLatestScores] = useState(null);
  const [currentUrl, setCurrentUrl] = useState('http://localhost:5000/demo/index.html');
  const [safetyRequest, setSafetyRequest] = useState(null);

  // Pre-built demo tasks (Section 23)
  const demoTasks = [
    { id: 1, text: 'Search for ISRO missions' },
    { id: 2, text: 'Open the Chandrayaan mission card' },
    { id: 3, text: 'Fill the contact form with sample data' },
    { id: 4, text: 'Find the Mars mission and open its details' },
    { id: 5, text: 'Select India from the country dropdown' },
    { id: 6, text: 'Scroll down and click the Learn More button' },
    { id: 7, text: 'Search for satellite communication and open the first result' },
    { id: 8, text: 'Open the demo shopping site and search for a laptop' },
    { id: 9, text: 'Login with scientist credentials' },
  ];

  // Subscribe to real-time agent SSE events
  useEffect(() => {
    const unsubscribe = api.subscribeToStream((event) => {
      const { type, data } = event;

      switch (type) {
        case 'TASK_STARTED':
          setIsExecuting(true);
          setTimelineEvents([{
            title: 'Task Initiated',
            detail: `Executing instruction: "${data.instruction}"`,
            status: 'COMPLETED',
            timestamp: new Date().toLocaleTimeString()
          }]);
          break;

        case 'TIMELINE_EVENT':
          setTimelineEvents(prev => [...prev, {
            ...data,
            timestamp: new Date().toLocaleTimeString()
          }]);
          break;

        case 'SCREENSHOT_UPDATE':
          if (data.screenshot) {
            setCurrentScreenshot(data.screenshot);
          }
          break;

        case 'PERCEPTION_DETECTIONS':
          if (data.elements) {
            setVisualDetections(data.elements);
          }
          break;

        case 'HYBRID_SCORES':
          if (data.matchedCandidate) {
            setActiveTarget(data.matchedCandidate);
          }
          if (data.scores) {
            setLatestScores(data.scores);
          }
          break;

        case 'SAFETY_CONFIRMATION_REQUIRED':
          setSafetyRequest(data);
          break;

        case 'SELF_CORRECTION_TRIGGERED':
          setTimelineEvents(prev => [...prev, {
            type: 'SELF_CORRECTION',
            title: `Self-Correction Triggered (Retry ${data.attempt})`,
            detail: data.recoveryPlan?.message || data.error,
            recoveryPlan: data.recoveryPlan,
            attempt: data.attempt,
            maxRetries: data.maxRetries,
            status: 'FAILED',
            timestamp: new Date().toLocaleTimeString()
          }]);
          break;

        case 'TASK_COMPLETED':
          setIsExecuting(false);
          setTimelineEvents(prev => [...prev, {
            title: 'Task Successfully Completed',
            detail: `All sub-actions verified. Total duration: ${data.duration}s with ${Math.round(data.confidence * 100)}% confidence.`,
            status: 'COMPLETED',
            confidence: data.confidence,
            timestamp: new Date().toLocaleTimeString()
          }]);
          break;

        case 'TASK_FAILED':
          setIsExecuting(false);
          setTimelineEvents(prev => [...prev, {
            title: 'Task Terminated',
            detail: data.error,
            status: 'FAILED',
            timestamp: new Date().toLocaleTimeString()
          }]);
          break;

        case 'AGENT_STOPPED':
          setIsExecuting(false);
          setTimelineEvents(prev => [...prev, {
            title: 'Execution Stopped',
            detail: data.message,
            status: 'FAILED',
            timestamp: new Date().toLocaleTimeString()
          }]);
          break;

        default:
          break;
      }
    });

    // Initial snapshot
    api.analyzePerception().then(res => {
      if (res.screenshot) setCurrentScreenshot(res.screenshot);
      if (res.visualDetections) setVisualDetections(res.visualDetections);
      if (res.url) setCurrentUrl(res.url);
    }).catch(e => console.warn('Initial perception warmup notice:', e.message));

    return () => unsubscribe();
  }, []);

  const handleRunTask = async () => {
    if (!taskInput.trim() || isExecuting) return;
    setIsExecuting(true);
    try {
      await api.runTask(taskInput);
    } catch (err) {
      setIsExecuting(false);
      console.error('Failed to dispatch task:', err);
    }
  };

  const handleStop = async () => {
    await api.stopAgent();
    setIsExecuting(false);
  };

  const handleClear = () => {
    setTimelineEvents([]);
    setActiveTarget(null);
    setLatestScores(null);
  };

  const handleConfirmSafety = async (allowed) => {
    if (safetyRequest) {
      await api.confirmAction(safetyRequest.taskId, allowed);
      setSafetyRequest(null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 space-y-3 overflow-hidden">
      {/* Top Input Bar & Demo Task Chips */}
      <div className="bg-[#0b1222] border border-space-border rounded-xl p-3 shrink-0 space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunTask()}
              placeholder="What should PERCEPTA do? (e.g. Open the Chandrayaan mission card)"
              disabled={isExecuting}
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-lg px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 font-mono outline-none transition-colors"
            />
          </div>

          <button
            onClick={handleRunTask}
            disabled={isExecuting || !taskInput.trim()}
            className="px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-md shadow-cyan-500/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Run Task
          </button>

          <button
            onClick={handleStop}
            disabled={!isExecuting}
            className="px-3.5 py-2.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 disabled:opacity-40 text-rose-300 font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            Stop
          </button>

          <button
            onClick={handleClear}
            disabled={isExecuting}
            className="px-3 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors shrink-0"
            title="Clear timeline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Demo Tasks Quick Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-[11px] font-mono no-scrollbar">
          <span className="text-slate-500 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Quick Demo Tasks:
          </span>
          {demoTasks.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTaskInput(t.text);
              }}
              disabled={isExecuting}
              className={`shrink-0 px-2.5 py-1 rounded-md border transition-all ${
                taskInput === t.text
                  ? 'bg-cyan-950/70 border-cyan-600 text-cyan-300 font-semibold'
                  : 'bg-slate-950/80 hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Task {t.id}: {t.text.slice(0, 30)}...
            </button>
          ))}
        </div>
      </div>

      {/* Split Screen Main Interface */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        {/* Left Pane: Live Browser Preview (7 cols) */}
        <div className="lg:col-span-7 h-full min-h-[300px]">
          <LiveBrowser
            screenshot={currentScreenshot}
            detections={visualDetections}
            activeTarget={activeTarget}
            currentUrl={currentUrl}
            onRefresh={() => {
              api.analyzePerception().then(res => {
                if (res.screenshot) setCurrentScreenshot(res.screenshot);
                if (res.visualDetections) setVisualDetections(res.visualDetections);
              });
            }}
          />
        </div>

        {/* Right Pane: Agent Execution Timeline (5 cols) */}
        <div className="lg:col-span-5 h-full min-h-[300px]">
          <ExecutionTimeline
            events={timelineEvents}
            latestScores={latestScores}
            isExecuting={isExecuting}
            onStop={handleStop}
            weights={weights}
          />
        </div>
      </div>

      {/* Safety Modal Dialog */}
      <SafetyModal
        isOpen={!!safetyRequest}
        request={safetyRequest}
        onConfirm={() => handleConfirmSafety(true)}
        onCancel={() => handleConfirmSafety(false)}
      />
    </div>
  );
}
