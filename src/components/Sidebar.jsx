import { LayoutDashboard, ShieldAlert, Database, Send, TrendingUp, Home } from 'lucide-react';

const GithubIcon = ({ size = 16, ...props }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    stroke="currentColor" 
    strokeWidth="2" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export default function Sidebar({ activeTab, setActiveTab, onBackToHome }) {
  return (
    <aside className="sidebar">
      <div>
        <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
          <img src="/kazua_logo.png" alt="Kazua AI Logo" style={{ height: '36px', width: 'auto', borderRadius: '8px', boxShadow: '0 0 15px rgba(168, 85, 247, 0.4)' }} />
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: 'var(--color-text-primary)' }}>KAZUA</span>
            <span style={{ color: 'var(--accent-cyan)', marginLeft: '4px' }}>AI</span>
          </div>
        </div>

        <nav className="nav-links">
          <button
            className="nav-item"
            onClick={onBackToHome}
            style={{ 
              background: 'none', 
              border: 'none', 
              width: '100%', 
              textAlign: 'left', 
              marginBottom: '12px', 
              borderBottom: '1px solid var(--glass-border)',
              borderRadius: '0',
              paddingBottom: '12px',
              color: 'var(--accent-cyan)'
            }}
          >
            <Home size={18} />
            <span>Back to Home</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'agent' ? 'active' : ''}`}
            onClick={() => setActiveTab('agent')}
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
          >
            <LayoutDashboard size={18} />
            <span>Agent Monitor</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'risk' ? 'active' : ''}`}
            onClick={() => setActiveTab('risk')}
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
          >
            <ShieldAlert size={18} />
            <span>Risk scoring engine</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'onchain' ? 'active' : ''}`}
            onClick={() => setActiveTab('onchain')}
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
          >
            <Database size={18} />
            <span>On-Chain & Sentiment</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'evaluator' ? 'active' : ''}`}
            onClick={() => setActiveTab('evaluator')}
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}
          >
            <TrendingUp size={18} />
            <span>Strategy Evaluator</span>
          </button>
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="uid-badge">
          <span>UID</span>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>7864960146</span>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '5px' }}>
          <a 
            href="https://github.com/Laegend14/kazua" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center' }}
            title="GitHub Repository"
          >
            <GithubIcon size={16} />
          </a>
          <a 
            href="https://bitget-ai.gitbook.io/hackathon" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center' }}
            title="Documentation"
          >
            <Send size={16} />
          </a>
        </div>
      </div>
    </aside>
  );
}
