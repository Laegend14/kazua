import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Settings, Info, Ban, Zap } from 'lucide-react';

export default function RiskEngine({ data }) {
  const [maxLeverage, setMaxLeverage] = useState(20);
  const [killswitch, setKillswitch] = useState(15); // max drawdown %
  const [blockedPairs, setBlockedPairs] = useState(['DOGE/USDT', 'SHIB/USDT']);
  const [tempBlocked, setTempBlocked] = useState('');

  const score = data.riskScore;

  // Determine Risk Category & Color
  let riskName = 'SAFE';
  let riskColor = 'var(--color-success)';
  let riskBg = 'var(--color-success-bg)';
  let riskGlow = 'rgba(16, 185, 129, 0.3)';
  
  if (score > 70) {
    riskName = 'CRITICAL';
    riskColor = 'var(--color-error)';
    riskBg = 'var(--color-error-bg)';
    riskGlow = 'rgba(239, 68, 68, 0.3)';
  } else if (score > 35) {
    riskName = 'WARNING';
    riskColor = 'var(--color-warning)';
    riskBg = 'var(--color-warning-bg)';
    riskGlow = 'rgba(245, 158, 11, 0.3)';
  }

  // Calculate SVG stroke offset for the gauge circle
  const radius = 60;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Build active risk warning checklist dynamically
  const warnings = [];
  const exposureRatio = data.balance > 0 ? (data.marginUsed / data.balance) * 100 : 0;
  
  if (exposureRatio > 30) {
    warnings.push({ id: 'w-exp', msg: `High Margin Exposure: ${exposureRatio.toFixed(1)}% of capital used.`, severity: 'high' });
  } else if (exposureRatio > 15) {
    warnings.push({ id: 'w-exp', msg: `Moderate Margin Exposure: ${exposureRatio.toFixed(1)}% of capital used.`, severity: 'medium' });
  }

  const hasHighLeverage = data.positions.some(p => p.leverage >= 15);
  if (hasHighLeverage) {
    warnings.push({ id: 'w-lev', msg: "High leverage position detected (>= 15x). Liquidations risks increased.", severity: 'high' });
  }

  const isVolatileSwing = data.positions.some(p => p.pair.includes('BTC') && p.leverage >= 20);
  if (isVolatileSwing) {
    warnings.push({ id: 'w-lev-high', msg: "High leverage BTC futures exposure during volatile hours.", severity: 'medium' });
  }

  const addBlocked = (e) => {
    e.preventDefault();
    if (tempBlocked && !blockedPairs.includes(tempBlocked)) {
      setBlockedPairs([...blockedPairs, tempBlocked.toUpperCase()]);
      setTempBlocked('');
    }
  };

  const removeBlocked = (pair) => {
    setBlockedPairs(blockedPairs.filter(p => p !== pair));
  };

  return (
    <div className="animate-slide-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
      
      {/* LEFT COLUMN: GAUGE & METRICS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Gauge card */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', alignSelf: 'flex-start', color: '#fff' }}>Real-time Risk Score</h2>
          
          <div style={{ position: 'relative', width: radius * 2, height: radius * 2, display: 'flex', alignItems: 'center', justifySelf: 'center' }}>
            <svg height={radius * 2} width={radius * 2}>
              <circle
                stroke="rgba(255,255,255,0.03)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke={riskColor}
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease-in-out', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
            </svg>
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center' 
            }}>
              <span style={{ fontSize: '32px', fontWeight: '800', color: '#fff', lineHeight: '1' }}>{score}</span>
              <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', letterSpacing: '1px', marginTop: '4px' }}>MAX 100</span>
            </div>
          </div>

          <div style={{ 
            padding: '6px 16px', 
            borderRadius: '20px', 
            background: riskBg, 
            color: riskColor,
            fontWeight: '800',
            fontSize: '12px',
            letterSpacing: '1px',
            boxShadow: `0 0 10px ${riskGlow}`,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {riskName === 'SAFE' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
            <span>RISK LEVEL: {riskName}</span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', maxWidth: '280px', lineHeight: '1.4' }}>
            The engine aggregates leverage, margin exposure, asset volatility, and peak-to-trough drawdown to evaluate risk levels in real time.
          </p>
        </div>

        {/* Breakdown details */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>Scoring Components Breakdown</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Component 1: Leverage */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Leverage Factor</span>
                <span style={{ color: '#fff', fontWeight: '600' }}>
                  {data.positions.length > 0 
                    ? `${(data.positions.reduce((sum, p) => sum + p.leverage, 0) / data.positions.length).toFixed(1)}x avg`
                    : '0.0x'}
                </span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  background: 'var(--accent-purple)', 
                  width: `${Math.min(100, (data.positions.reduce((sum, p) => sum + p.leverage, 0) / (data.positions.length || 1)) * 5)}%`,
                  transition: 'var(--transition-smooth)'
                }} />
              </div>
            </div>

            {/* Component 2: Exposure */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Exposure Factor (Margin Used)</span>
                <span style={{ color: '#fff', fontWeight: '600' }}>{exposureRatio.toFixed(1)}%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  background: 'var(--accent-cyan)', 
                  width: `${Math.min(100, exposureRatio * 2)}%`,
                  transition: 'var(--transition-smooth)'
                }} />
              </div>
            </div>

            {/* Component 3: Volatility */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Asset Volatility Index</span>
                <span style={{ color: '#fff', fontWeight: '600' }}>{data.technicalSummary.volatility}</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ 
                  height: '100%', 
                  background: 'var(--color-warning)', 
                  width: data.technicalSummary.volatility === 'High' ? '85%' : data.technicalSummary.volatility === 'Medium' ? '50%' : '20%',
                  transition: 'var(--transition-smooth)'
                }} />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: ALERTS & CONFIGURATOR */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Risk Alerts */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '180px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} color="var(--color-error)" />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>Active Risk Alerts</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
            {warnings.length === 0 ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                padding: '14px', 
                borderRadius: '8px', 
                background: 'var(--color-success-bg)', 
                color: 'var(--color-success)',
                fontSize: '13px'
              }}>
                <ShieldCheck size={16} />
                <span>All safety parameters holding. No risk anomalies detected.</span>
              </div>
            ) : (
              warnings.map((w, idx) => (
                <div 
                  key={idx}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: '10px', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    background: w.severity === 'high' ? 'var(--color-error-bg)' : 'var(--color-warning-bg)', 
                    color: w.severity === 'high' ? 'var(--color-error)' : 'var(--color-warning)',
                    fontSize: '13px',
                    border: `1px solid ${w.severity === 'high' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                  }}
                >
                  <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{w.msg}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Interactive Configuration Panel */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
            <Settings size={18} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>Infra Risk Limits Controls</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Max Leverage */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Max Leverage Limit</span>
                <span style={{ color: 'var(--accent-purple)', fontWeight: 'bold' }}>{maxLeverage}x</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="50" 
                value={maxLeverage} 
                onChange={(e) => setMaxLeverage(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
              />
            </div>

            {/* Drawdown Killswitch */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Drawdown Killswitch Bound</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{killswitch}%</span>
              </div>
              <input 
                type="range" 
                min="2" 
                max="30" 
                value={killswitch} 
                onChange={(e) => setKillswitch(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Deactivates API keys if agent accounts lose {killswitch}% from equity peak.
              </span>
            </div>

            {/* Token Blocklist */}
            <div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
                Blocklisted Pairs (Prevent trading)
              </div>
              <form onSubmit={addBlocked} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input 
                  type="text" 
                  placeholder="e.g. DOGE/USDT" 
                  value={tempBlocked}
                  onChange={(e) => setTempBlocked(e.target.value)}
                  style={{ 
                    flexGrow: 1, 
                    background: 'rgba(255,255,255,0.03)', 
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '12px'
                  }}
                />
                <button 
                  type="submit" 
                  style={{ 
                    background: 'var(--accent-purple)', 
                    color: '#fff', 
                    border: 'none', 
                    borderRadius: '8px', 
                    padding: '0 16px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  Block
                </button>
              </form>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {blockedPairs.map(p => (
                  <span 
                    key={p} 
                    style={{ 
                      fontSize: '11px', 
                      background: 'rgba(239, 68, 68, 0.1)', 
                      color: 'var(--color-error)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: '1px solid rgba(239, 68, 68, 0.2)'
                    }}
                  >
                    <span>{p}</span>
                    <button 
                      onClick={() => removeBlocked(p)} 
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--color-error)', 
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '10px'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
