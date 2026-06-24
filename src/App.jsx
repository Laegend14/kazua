import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AgentMonitor from './components/AgentMonitor';
import RiskEngine from './components/RiskEngine';
import OnChainDashboard from './components/OnChainDashboard';
import StrategyEvaluator from './components/StrategyEvaluator';
import LandingPage from './components/LandingPage';
import { DashboardSimulator } from './mock/simulationEngine';
import { RefreshCw, Play, Pause } from 'lucide-react';

const AGENT_PROFILES = {
  aegis: {
    id: "aegis",
    name: "Kazua-1 (BTC Trend Analyst)",
    model: "Google Gemini 3.5 Flash",
    subAccount: "8353658951-A",
    target: "BTC Market Analysis",
    desc: "Scans MACD crossovers and orderbook depth on BTC/USDT, analyzed in real-time by Gemini."
  },
  sentinel: {
    id: "sentinel",
    name: "Kazua-2 (BTC Volatility Analyst)",
    model: "Google Gemini 3.5 Flash",
    subAccount: "8353658951-B",
    target: "Volatility Sentiment",
    desc: "Monitors on-chain whale liquidation events and trade momentum to capture short-term BTC swings."
  },
  playbook: {
    id: "playbook",
    name: "Kazua-3 (BTC Macro Analyst)",
    model: "Google Gemini 3.5 Flash",
    subAccount: "8353658951-C",
    target: "Macro Indicators",
    desc: "Evaluates global macro indicators and funding rate arbitrage to balance long-term BTC positions."
  }
};


export default function App() {
  const [view, setView] = useState('landing');
  const [activeTab, setActiveTab] = useState('agent');
  const [selectedAgent, setSelectedAgent] = useState('aegis');
  const [simData, setSimData] = useState(null);
  const [isSimRunning, setIsSimRunning] = useState(true);
  const [simulator, setSimulator] = useState(null);
  const [apiLogs, setApiLogs] = useState([]);

  // Initialize Simulator
  useEffect(() => {
    const sim = new DashboardSimulator((updatedState) => {
      setSimData(updatedState);
    });
    
    // Set initial state
    setSimData(sim.state);
    
    if (isSimRunning) {
      sim.start();
    }
    
    setSimulator(sim);

    return () => {
      sim.stop();
    };
  }, []);

  // Listen to custom api-log events from services
  useEffect(() => {
    const handleApiLog = (e) => {
      setApiLogs(prev => [e.detail, ...prev].slice(0, 15));
    };
    window.addEventListener('api-log', handleApiLog);
    return () => window.removeEventListener('api-log', handleApiLog);
  }, []);

  // Handle Pause/Play Toggle
  const toggleSimulation = () => {
    if (!simulator) return;
    if (isSimRunning) {
      simulator.stop();
    } else {
      simulator.start();
    }
    setIsSimRunning(!isSimRunning);
  };

  if (view === 'landing') {
    return <LandingPage onLaunch={() => setView('dashboard')} />;
  }

  if (!simData) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        width: '100vw',
        background: 'var(--bg-primary)',
        color: 'var(--accent-purple)',
        fontFamily: 'var(--font-sans)',
        fontSize: '20px',
        fontWeight: 'bold'
      }}>
        Initializing Bitget AI Agent Portal...
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onBackToHome={() => setView('landing')} />

      {/* Main Panel Content */}
      <main className="main-content">
        
        {/* Portal Header */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          borderBottom: '1px solid var(--glass-border)',
          paddingBottom: '20px',
          marginBottom: '8px'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff' }}>
              Market Analyst Control Panel
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '4px' }}>
              Manage AI Analyst parameters, check Kiyotaka & Bitget data streams, and view analyst reports.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Agent Dropdown Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', fontWeight: 'bold', letterSpacing: '0.5px' }}>ACTIVE ANALYST ROUTINE</span>
              <select 
                value={selectedAgent} 
                onChange={(e) => setSelectedAgent(e.target.value)}
                style={{
                  background: 'rgba(105, 156, 255, 0.1)',
                  border: '1px solid var(--glass-border)',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: '600',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="aegis" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Kazua-1 (BTC Trend Analyst)</option>
                <option value="sentinel" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Kazua-2 (BTC Volatility Analyst)</option>
                <option value="playbook" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Kazua-3 (BTC Macro Analyst)</option>
              </select>
            </div>

            {/* Live Indicator */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'rgba(255, 255, 255, 0.03)', 
              border: '1px solid var(--glass-border)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              marginTop: '14px'
            }}>
              <div style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: isSimRunning ? 'var(--color-success)' : 'var(--color-text-muted)',
                boxShadow: isSimRunning ? '0 0 8px var(--color-success)' : 'none',
                transition: 'var(--transition-smooth)'
              }} />
              <span style={{ color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                {isSimRunning ? 'LIVE ENGINE ACTIVE' : 'LIVE ENGINE PAUSED'}
              </span>
            </div>

            {/* Play/Pause Button */}
            <button 
              onClick={toggleSimulation}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                background: isSimRunning ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                border: `1px solid ${isSimRunning ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                color: isSimRunning ? 'var(--color-error)' : 'var(--color-success)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                marginTop: '14px'
              }}
            >
              {isSimRunning ? <Pause size={14} /> : <Play size={14} />}
              <span>{isSimRunning ? 'Pause Engine' : 'Resume Engine'}</span>
            </button>

            {/* Direct Refresh */}
            <button 
              onClick={() => simulator?.tick()}
              disabled={!isSimRunning}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid var(--glass-border)',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                cursor: isSimRunning ? 'pointer' : 'not-allowed',
                opacity: isSimRunning ? 1 : 0.5,
                transition: 'var(--transition-smooth)',
                marginTop: '14px'
              }}
              title="Force Update Tick"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </header>

        {/* Dynamic Panels */}
        {activeTab === 'agent' && (
          <AgentMonitor 
            data={simData} 
            agentInfo={AGENT_PROFILES[selectedAgent]} 
            onPlaceOrder={(symbol, side, size, orderType, price, tradeSide) => simulator?.placeOrder(symbol, side, size, orderType, price, tradeSide)}
            onCancelOrder={(symbol, orderId) => simulator?.cancelOrder(symbol, orderId)}
            onUpdateAgentParams={(params) => simulator?.updateAgentParams(params)}
            onTriggerManualAnalysis={() => simulator?.triggerManualAnalysis()}
          />
        )}
        {activeTab === 'risk' && <RiskEngine data={simData} />}
        {activeTab === 'onchain' && <OnChainDashboard data={simData} />}
        {activeTab === 'evaluator' && <StrategyEvaluator />}

        {/* Integration API Call Audit Logs */}
        <div className="glass-panel" style={{ marginTop: '24px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RefreshCw size={16} color="var(--accent-purple)" />
              <span style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>Integration API Call Audit Log</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '4px' }}>
                Calls Captured: {apiLogs.length}
              </span>
              <button 
                onClick={() => setApiLogs([])}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600'
                }}
              >
                Clear Audit
              </button>
            </div>
          </div>

          <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
                  <th style={{ padding: '6px 4px' }}>Timestamp</th>
                  <th style={{ padding: '6px 4px' }}>Target API</th>
                  <th style={{ padding: '6px 4px' }}>Method</th>
                  <th style={{ padding: '6px 4px' }}>Endpoint</th>
                  <th style={{ padding: '6px 4px' }}>Status</th>
                  <th style={{ padding: '6px 4px' }}>Latency</th>
                </tr>
              </thead>
              <tbody>
                {apiLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-text-muted)' }}>
                      No active API queries recorded. Ensure credentials are valid and simulator is running.
                    </td>
                  </tr>
                ) : (
                  apiLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', color: '#fff' }}>
                      <td style={{ padding: '6px 4px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{log.timestamp}</td>
                      <td style={{ padding: '6px 4px' }}>
                        <span style={{ 
                          padding: '2px 6px', 
                          borderRadius: '4px',
                          fontWeight: '800',
                          fontSize: '9px',
                          color: log.api === 'Bitget' ? '#fff' : '#000',
                          background: log.api === 'Bitget' ? 'var(--accent-blue)' : 'var(--accent-cyan)'
                        }}>
                          {log.api.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '6px 4px', fontWeight: 'bold' }}>{log.method}</td>
                      <td style={{ padding: '6px 4px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}>{log.endpoint}</td>
                      <td style={{ padding: '6px 4px' }}>
                        <span style={{ 
                          color: log.status === 'Failed' || log.status >= 400 ? 'var(--color-error)' : 'var(--color-success)',
                          fontWeight: '600'
                        }}>
                          {log.status}
                        </span>
                      </td>
                      <td style={{ padding: '6px 4px', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>{log.latency}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
