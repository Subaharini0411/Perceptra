import React from 'react';
import { 
  Bot, 
  Cpu, 
  ShieldCheck, 
  RefreshCw, 
  Eye, 
  Layers, 
  ArrowRight, 
  Sparkles,
  CheckCircle2,
  Lock,
  Compass
} from 'lucide-react';

export default function LandingPage({ onLaunch }) {
  const features = [
    {
      title: 'LOCAL AI & ON-DEVICE',
      desc: 'Runs completely on local CPU without mandatory cloud multimodal LLMs. Zero external API cost and zero latency lag.',
      icon: Cpu,
      accent: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-400'
    },
    {
      title: 'VISION + DOM HYBRID',
      desc: 'Fuses spatial computer-vision bounding boxes with DOM hierarchy to understand dynamic, canvas, and obfuscated web elements.',
      icon: Eye,
      accent: 'border-blue-500/40 bg-blue-950/20 text-blue-400'
    },
    {
      title: 'SAFE ACTIONS GATING',
      desc: 'Classifies actions into SAFE vs SENSITIVE (logins, submissions, transfers) with interactive operator confirmation modals.',
      icon: ShieldCheck,
      accent: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-400'
    },
    {
      title: 'AUTONOMOUS SELF-CORRECTION',
      desc: 'When an element shifts or an interaction fails, PERCEPTA automatically re-perceives the viewport and retries with alternative targets.',
      icon: RefreshCw,
      accent: 'border-amber-500/40 bg-amber-950/20 text-amber-400'
    },
    {
      title: 'PRIVACY-FIRST ARCHITECTURE',
      desc: 'Zero data exfiltration. Webpage screenshots, form entries, and DOM structures never leave the local machine.',
      icon: Lock,
      accent: 'border-purple-500/40 bg-purple-950/20 text-purple-400'
    },
    {
      title: 'CPU-FRIENDLY INFERENCE',
      desc: 'Modular ONNX Runtime and contour detection pipeline designed for standard laptops without dedicated GPUs.',
      icon: Layers,
      accent: 'border-teal-500/40 bg-teal-950/20 text-teal-400'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
      {/* Hero Header */}
      <div className="text-center space-y-6 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 text-xs font-mono tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Smart India Hackathon 2026 • PS ID: SIH26171 (ISRO)</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white font-mono">
          PERCEPTA
        </h1>
        <p className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 font-mono">
          "See the Web. Understand Locally. Act Safely."
        </p>

        <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-2xl mx-auto">
          A lightweight, on-device browser agent designed for the Department of Space / ISRO. 
          Combines spatial computer-vision perception with deep DOM intelligence to execute complex web operations with confidence, safety governance, and self-correction.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={onLaunch}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-xl shadow-cyan-500/20 transition-all transform hover:-translate-y-0.5"
          >
            <Bot className="w-4 h-4" />
            Launch Agent Workspace
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logical Architecture Flow Diagram (Visual Pipeline) */}
      <div className="bg-[#0b1222] border border-space-border rounded-2xl p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-space-border">
          <div>
            <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
              Hybrid Perception & Execution Pipeline
            </h3>
            <p className="text-xs text-slate-400">Deterministic dual-channel perception with autonomous safety loop</p>
          </div>
          <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded">
            Air-Gapped Local Architecture
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-center text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-cyan-400 font-bold mb-1">1. PARSE</span>
            <span className="text-[10px] text-slate-400">Natural Task Interpreter</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-blue-400 font-bold mb-1">2. PERCEIVE</span>
            <span className="text-[10px] text-slate-400">DOM + Visual Screenshot</span>
          </div>
          <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-700/60 flex flex-col items-center justify-center">
            <span className="text-cyan-300 font-bold mb-1">3. HYBRID</span>
            <span className="text-[10px] text-cyan-200/80">Spatial IoU & 5-Factor Score</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-purple-400 font-bold mb-1">4. CONFIDENCE</span>
            <span className="text-[10px] text-slate-400">High / Medium / Low Tiers</span>
          </div>
          <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/60 flex flex-col items-center justify-center">
            <span className="text-amber-300 font-bold mb-1">5. SAFETY</span>
            <span className="text-[10px] text-amber-200/80">Action Clearance Check</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-emerald-400 font-bold mb-1">6. ACT & VERIFY</span>
            <span className="text-[10px] text-slate-400">Playwright Coordinates</span>
          </div>
          <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-800/40 flex flex-col items-center justify-center">
            <span className="text-rose-300 font-bold mb-1">7. SELF-CORRECT</span>
            <span className="text-[10px] text-rose-200/80">Re-perception Retry</span>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          return (
            <div key={idx} className="bg-[#0b1222] border border-space-border rounded-xl p-6 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${feat.accent}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="font-mono text-sm font-bold text-white tracking-wider">
                  {feat.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
