import React from 'react';
import { ShieldAlert, Check, X, AlertTriangle } from 'lucide-react';
import ConfidenceBadge from './ConfidenceBadge';

export default function SafetyModal({ isOpen, request, onConfirm, onCancel }) {
  if (!isOpen || !request) return null;

  const { action, confidence = 0.91, reason } = request;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0e1626] border border-amber-500/40 rounded-xl max-w-md w-full p-6 shadow-2xl shadow-amber-950/30 text-slate-200">
        <div className="flex items-center gap-3 mb-4 text-amber-400">
          <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Sensitive Action Confirmation</h3>
            <p className="text-xs text-amber-300/80 font-mono">ISRO Safety Governance Protocol</p>
          </div>
        </div>

        <div className="bg-slate-900/90 rounded-lg p-4 border border-slate-800 mb-5 space-y-3">
          <p className="text-xs text-slate-300">
            PERCEPTA is about to perform this sensitive action:
          </p>
          <div className="text-sm font-semibold text-white bg-slate-950 px-3 py-2 rounded border border-slate-800">
            {action?.description || action?.target || action?.type}
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-400">Calculated Confidence:</span>
            <ConfidenceBadge score={confidence} />
          </div>

          {reason && (
            <p className="text-[11px] text-amber-200/70 italic border-t border-slate-800/80 pt-2">
              {reason}
            </p>
          )}
        </div>

        <p className="text-xs text-slate-400 mb-6">
          Do you authorize the browser agent to proceed with this operation?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
            Cancel Action
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 transition-colors"
          >
            <Check className="w-4 h-4" />
            Allow Action
          </button>
        </div>
      </div>
    </div>
  );
}
