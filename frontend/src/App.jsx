import React, { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import AgentWorkspace from './pages/AgentWorkspace';
import VisualPerceptionStudio from './pages/VisualPerceptionStudio';
import DemoSiteView from './pages/DemoSiteView';
import Benchmarks from './pages/Benchmarks';
import PrivacyAudit from './pages/PrivacyAudit';
import Settings from './pages/Settings';
import TaskHistory from './pages/TaskHistory';
import { api } from './services/api';

export default function App() {
  const [currentTab, setCurrentTab] = useState('landing');
  const [systemStats, setSystemStats] = useState(null);
  const [taskHistory, setTaskHistory] = useState([]);
  const [selectedTask, setSelectedTask] = useState('');
  const [weights, setWeights] = useState({
    visual: 0.30,
    dom: 0.25,
    text: 0.20,
    position: 0.10,
    semantic: 0.15
  });

  // Periodically refresh system telemetry & history
  useEffect(() => {
    const fetchTelemetry = () => {
      api.getSystemStats()
        .then(res => setSystemStats(res))
        .catch(e => console.warn('System telemetry notice:', e.message));

      api.getTasks()
        .then(res => setTaskHistory(res || []))
        .catch(() => {});
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleStartAgentWithTask = (taskText) => {
    if (taskText) {
      setSelectedTask(taskText);
    }
    setCurrentTab('workspace');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070b14] text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* Aerospace Mission Control TopBar */}
      <TopBar systemStats={systemStats} isConnected={true} />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar currentTab={currentTab} setTab={setCurrentTab} />

        {/* Dynamic Main Content Workspace */}
        <main className="flex-1 overflow-y-auto bg-[#070b14] relative">
          {currentTab === 'landing' && (
            <LandingPage onLaunch={() => setCurrentTab('workspace')} />
          )}

          {currentTab === 'dashboard' && (
            <Dashboard 
              stats={systemStats}
              history={taskHistory}
              onStartAgent={handleStartAgentWithTask}
              onNavigate={setCurrentTab}
            />
          )}

          {currentTab === 'workspace' && (
            <AgentWorkspace 
              initialTask={selectedTask}
              weights={weights}
            />
          )}

          {currentTab === 'visual' && (
            <VisualPerceptionStudio />
          )}

          {currentTab === 'browser' && (
            <DemoSiteView />
          )}

          {currentTab === 'history' && (
            <TaskHistory />
          )}

          {currentTab === 'benchmarks' && (
            <Benchmarks />
          )}

          {currentTab === 'privacy' && (
            <PrivacyAudit systemStats={systemStats} />
          )}

          {currentTab === 'settings' && (
            <Settings weights={weights} setWeights={setWeights} />
          )}
        </main>
      </div>
    </div>
  );
}
