import React from 'react';
import { 
  ArrowRight, 
  Terminal, 
  CheckCircle, 
  Brain, 
  TrendingUp, 
  Rocket, 
  Wallet, 
  Network
} from 'lucide-react';
import './LandingPage.css';

export default function LandingPage({ onLaunch }) {
  return (
    <div className="landing-page-container">
      {/* Top Navigation Bar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/kazua_logo.png" alt="Kazua AI Logo" style={{ height: '32px', width: 'auto', borderRadius: '6px' }} />
            <span className="landing-logo-text">KAZUA AI</span>
          </div>
          
          <div className="landing-nav-links">
            <a className="landing-nav-link active" href="#agents">Agents</a>
            <a className="landing-nav-link" href="#risk-engine" onClick={(e) => { e.preventDefault(); onLaunch(); }}>Risk Engine</a>
            <a className="landing-nav-link" href="#on-chain" onClick={(e) => { e.preventDefault(); onLaunch(); }}>On-Chain</a>
            <a className="landing-nav-link" href="#performance" onClick={(e) => { e.preventDefault(); onLaunch(); }}>Performance</a>
          </div>

          <div className="landing-nav-actions">
            <button className="btn-glow-purple" onClick={onLaunch}>
              Launch Portal
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="landing-main">
        
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="system-badge">
              <span className="system-badge-dot"></span>
              <span className="system-badge-text">System Online</span>
            </div>
            
            <h1 className="hero-title">
              Autonomous Market Analysis <br />
              <span className="gradient-text">Orchestrated by Gemini</span>
            </h1>
            
            <p className="hero-desc">
              Let Kazua analyze your BTC market cycles and margin health with real-time on-chain risk scoring, powered by Google Gemini and Kiyotaka intelligence.
            </p>
            
            <div className="hero-actions">
              <button className="btn-glow-purple hero-large-btn" onClick={onLaunch}>
                Launch Control Panel
                <ArrowRight size={18} />
              </button>
              <button className="btn-glass hero-large-btn" onClick={onLaunch}>
                Read API Docs
                <Terminal size={18} />
              </button>
            </div>

            <div className="hero-integrations">
              <div className="integration-item">
                <CheckCircle size={14} />
                <span>Bitget UTA Integrated</span>
              </div>
              <div className="integration-item">
                <Brain size={14} />
                <span>Kiyotaka Intelligence</span>
              </div>
            </div>
          </div>

          {/* Terminal / Mockup Preview */}
          <div className="hero-preview">
            <div className="preview-glow"></div>
            <div className="preview-card">
              <div className="preview-header">
                <div className="window-dot dot-red"></div>
                <div className="window-dot dot-yellow"></div>
                <div className="window-dot dot-green"></div>
                <span className="window-title">kazua_terminal_v2.1.sh</span>
              </div>
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9bgIxzqiLn6IWxzSS9pwZok51fK_PzsJ6NUi0uc8TowXVVojGNanyqAOQP8Sur631EvTNyB19XtelfbQKMxMf6kbfLL8xj_CArf6AlH5ZaYSGPWqsDKR2vIfKEc0kR-8HevTkJWCt_KUptmyXV2AhOIqH7KLp7u0oo95Sn1zAG0OPQ_AffPxU8u-oLnqw9HR_IXZ9eZlaNfu4jiqhjdZfTmQLwEd0w4vaRkpKFuptpP0r-yWFOJwK2DtDsveuC2Jqc9GQUYmE7bKD" 
                alt="Terminal Preview" 
                className="preview-image"
              />
            </div>
          </div>
        </section>

        {/* Features / Agents Section */}
        <section id="agents" className="agents-section">
          <div className="section-header">
            <h2 className="section-title">The Kazua Analyst Suite</h2>
            <p className="section-desc">Specialized AI analysts scanning and reporting on-chain and account risk metrics.</p>
          </div>

          <div className="agents-grid">
            {/* Agent 1 */}
            <div className="agent-card">
              <div className="agent-glow agent-glow-purple"></div>
              <div className="agent-card-header">
                <div className="agent-icon-wrapper">
                  <TrendingUp size={22} className="text-purple" />
                </div>
                <span className="agent-badge agent-badge-active">Active</span>
              </div>
              <h3 className="agent-name">Kazua-1</h3>
              <h4 className="agent-subtitle text-purple">BTC Trend Analyst</h4>
              <p className="agent-desc">
                Utilizes MACD and sophisticated orderbook depth analysis to construct trend strength reports for Bitget futures.
              </p>
            </div>

            {/* Agent 2 */}
            <div className="agent-card">
              <div className="agent-glow agent-glow-cyan"></div>
              <div className="agent-card-header">
                <div className="agent-icon-wrapper">
                  <Rocket size={22} className="text-cyan" />
                </div>
                <span className="agent-badge agent-badge-scanning">Scanning</span>
              </div>
              <h3 className="agent-name">Kazua-2</h3>
              <h4 className="agent-subtitle text-cyan">BTC Volatility Analyst</h4>
              <p className="agent-desc">
                Harnesses Kiyotaka whale alerts and liquidation feeds to detect volatility surges and score on-chain risks.
              </p>
            </div>

            {/* Agent 3 */}
            <div className="agent-card">
              <div className="agent-glow agent-glow-blue"></div>
              <div className="agent-card-header">
                <div className="agent-icon-wrapper">
                  <Wallet size={22} className="text-blue" />
                </div>
                <span className="agent-badge agent-badge-idle">Idle</span>
              </div>
              <h3 className="agent-name">Kazua-3</h3>
              <h4 className="agent-subtitle text-blue">BTC Macro Analyst</h4>
              <p className="agent-desc">
                Ingests macro policy feeds and Kiyotaka funding rates to evaluate basis arbitrage and basis-spread health.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Banner Section */}
        <section className="cta-section">
          <div className="cta-banner">
            <div className="cta-banner-bg-gradient"></div>
            <div className="cta-glow-left"></div>
            <div className="cta-glow-right"></div>
            
            <div className="cta-icon">
              <Network size={36} />
            </div>
            
            <h2 className="cta-title">Take Control of Your Strategy</h2>
            <p className="cta-desc">Deploy institutional-grade AI agents to your personal exchange accounts in minutes.</p>
            
            <button className="btn-glow-purple cta-btn" onClick={onLaunch}>
              Launch Portal
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/kazua_logo.png" alt="Kazua AI Logo" style={{ height: '24px', width: 'auto', borderRadius: '4px' }} />
            <span>KAZUA AI</span>
          </div>
          
          <div className="footer-links">
            <a className="footer-link" href="#privacy">Privacy Policy</a>
            <a className="footer-link" href="#terms">Terms of Service</a>
            <a className="footer-link" href="#docs">Docs</a>
            <a className="footer-link" href="#api">API</a>
          </div>

          <div className="footer-copyright">
            &copy; 2024 Kazua AI. Powered by Google Gemini &amp; Kiyotaka.
          </div>
        </div>
      </footer>
    </div>
  );
}
