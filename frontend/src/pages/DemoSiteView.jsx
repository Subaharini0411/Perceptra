import React, { useState } from 'react';
import { Globe, ExternalLink, RefreshCw, Layers } from 'lucide-react';

export default function DemoSiteView() {
  const [activePage, setActivePage] = useState('/demo/index.html');
  const [iframeKey, setIframeKey] = useState(0);

  const demoRoutes = [
    { label: 'Missions Portal', path: '/demo/index.html' },
    { label: 'Search Telemetry', path: '/demo/search.html' },
    { label: 'Payload Proposal Form', path: '/demo/forms.html' },
    { label: 'Equipment Store', path: '/demo/shopping.html' },
    { label: 'Scientist Login', path: '/demo/login.html' },
    { label: 'News & Bulletins', path: '/demo/news.html' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0b1222] border border-space-border rounded-xl p-4">
        <div>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold font-mono text-white">Local ISRO Testbed Simulation Site</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Self-contained testbed hosting dynamic mission cards, real-time search, proposal forms, and scrollable articles.
          </p>
        </div>

        {/* Route switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-mono no-scrollbar">
          {demoRoutes.map((r) => (
            <button
              key={r.path}
              onClick={() => {
                setActivePage(r.path);
                setIframeKey(k => k + 1);
              }}
              className={`px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
                activePage === r.path
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
          <button
            onClick={() => setIframeKey(k => k + 1)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Reload Demo Viewport"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Embedded Iframe */}
      <div className="border border-space-border rounded-xl overflow-hidden shadow-2xl bg-black h-[calc(100vh-14rem)]">
        <iframe
          key={iframeKey}
          src={activePage}
          title="ISRO Demo Simulation"
          className="w-full h-full border-none"
        />
      </div>
    </div>
  );
}
