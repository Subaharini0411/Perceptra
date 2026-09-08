import React, { useState, useEffect } from 'react';
import { History, CheckCircle2, XCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import ConfidenceBadge from '../components/ConfidenceBadge';
import { api } from '../services/api';

export default function TaskHistory() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const list = await api.getTasks();
      setTasks(list || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Demo fallback rows if fresh session
  const displayTasks = tasks.length > 0 ? tasks : [
    {
      id: 'demo-task-1',
      instruction: 'Search for ISRO missions',
      status: 'SUCCESS',
      confidence: 0.94,
      steps: [{}, {}, {}, {}],
      retries: 0,
      executionDurationMs: 1800,
      startTime: new Date(Date.now() - 3600000).toLocaleTimeString(),
      isDemo: true
    },
    {
      id: 'demo-task-2',
      instruction: 'Fill registration form',
      status: 'SUCCESS',
      confidence: 0.89,
      steps: [{}, {}, {}, {}, {}, {}, {}],
      retries: 1,
      executionDurationMs: 3200,
      startTime: new Date(Date.now() - 7200000).toLocaleTimeString(),
      isDemo: true
    },
    {
      id: 'demo-task-3',
      instruction: 'Open the Chandrayaan mission card',
      status: 'SUCCESS',
      confidence: 0.96,
      steps: [{}, {}],
      retries: 0,
      executionDurationMs: 1200,
      startTime: new Date(Date.now() - 10800000).toLocaleTimeString(),
      isDemo: true
    },
    {
      id: 'demo-task-4',
      instruction: 'Scroll down and click the Learn More button',
      status: 'SUCCESS',
      confidence: 0.92,
      steps: [{}, {}, {}],
      retries: 0,
      executionDurationMs: 1950,
      startTime: new Date(Date.now() - 14400000).toLocaleTimeString(),
      isDemo: true
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#0b1222] border border-space-border rounded-xl p-5">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Execution Audit Log & Task History</h2>
          </div>
          <p className="text-slate-400 text-[11px] mt-0.5">
            Immutable log of all autonomous instructions, confidence metrics, and recovery actions.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          disabled={isLoading}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Log
        </button>
      </div>

      {/* Task Table */}
      <div className="bg-[#0b1222] border border-space-border rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#070d1a] border-b border-space-border text-slate-400 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Task Instruction</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Actions</th>
                <th className="py-3 px-4">Retries</th>
                <th className="py-3 px-4">Exec Time</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {displayTasks.map((t, idx) => (
                <tr key={t.id || idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white max-w-xs truncate">
                    {t.instruction}
                    {t.isDemo && (
                      <span className="ml-2 text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                        SAMPLE
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {t.status === 'SUCCESS' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> SUCCESS
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                        <XCircle className="w-3.5 h-3.5" /> FAILED
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <ConfidenceBadge score={t.confidence || 0.9} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {t.steps?.length || 1} actions
                  </td>
                  <td className="py-3 px-4">
                    {t.retries > 0 ? (
                      <span className="text-amber-400 font-bold">{t.retries} retry</span>
                    ) : (
                      <span className="text-slate-500">0 retries</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-cyan-300">
                    {((t.executionDurationMs || 1500) / 1000).toFixed(1)} sec
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {t.startTime || 'Recent'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
