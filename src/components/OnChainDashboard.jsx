import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Compass, AlertTriangle, ArrowDownRight, ArrowUpRight, TrendingUp, Cpu } from 'lucide-react';
import TradingViewChart from './TradingViewChart';

export default function OnChainDashboard({ data }) {
  const fearGreed = data.fearGreed;

  // Sentiment calculations
  let fgLabel = 'Neutral';
  let fgColor = 'var(--color-warning)';
  if (fearGreed >= 75) {
    fgLabel = 'Extreme Greed';
    fgColor = 'var(--color-success)';
  } else if (fearGreed >= 55) {
    fgLabel = 'Greed';
    fgColor = '#84cc16'; // light green
  } else if (fearGreed <= 25) {
    fgLabel = 'Extreme Fear';
    fgColor = 'var(--color-error)';
  } else if (fearGreed <= 45) {
    fgLabel = 'Fear';
    fgColor = '#ea580c'; // orange
  }

  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Technical Perception Summary - Full Width */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '12px' }}>
          <Cpu size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>Market Intelligence Summary</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>BTC RSI (14)</span>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginTop: '4px' }}>{data.technicalSummary.rsi}</div>
            <span style={{ fontSize: '10px', color: data.technicalSummary.rsi > 70 ? 'var(--color-error)' : data.technicalSummary.rsi < 30 ? 'var(--color-success)' : 'var(--color-text-muted)', fontWeight: '600' }}>
              {data.technicalSummary.rsi > 70 ? 'Overbought' : data.technicalSummary.rsi < 30 ? 'Oversold' : 'Neutral Zone'}
            </span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>MACD Status</span>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-success)', marginTop: '4px' }}>Bullish Cross</div>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>4-Hour timeframe</span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>200 SMA Trend</span>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-success)', marginTop: '4px' }}>Bullish</div>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Trading above $62.1K</span>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>Volatility Index</span>
            <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--color-warning)', marginTop: '4px' }}>{data.technicalSummary.volatility}</div>
            <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Average range: 2.4% / day</span>
          </div>

        </div>
      </div>

      {/* 2. Sentiment Metrics Grid (TradingView Chart, Fear & Greed Index & Whale Alerts Feed) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* Live BTC Market Chart */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '330px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '12px' }}>
            <TrendingUp size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>Live BTC Market</h3>
          </div>
          <div style={{ flexGrow: 1, width: '100%', height: '100%', minHeight: '0' }}>
            <TradingViewChart symbol="BINANCE:BTCUSDT" interval="15" />
          </div>
        </div>

        {/* Fear & Greed Index */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', justifyContent: 'center', height: '330px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '12px' }}>
            <Compass size={18} color="var(--accent-purple)" />
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>Fear & Greed Index</h3>
          </div>
          
          <div style={{ position: 'relative', width: '100%', padding: '10px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', fontWeight: '800', color: fgColor }}>{fearGreed}</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginTop: '4px', textTransform: 'uppercase' }}>{fgLabel}</div>
            
            {/* Horizontal progress bar showing color spectrum */}
            <div style={{ 
              height: '8px', 
              background: 'linear-gradient(90deg, var(--color-error) 0%, var(--color-warning) 50%, var(--color-success) 100%)', 
              borderRadius: '4px',
              marginTop: '16px',
              position: 'relative'
            }}>
              {/* Pointer indicator */}
              <div style={{ 
                position: 'absolute', 
                top: '-4px', 
                left: `${fearGreed}%`, 
                transform: 'translateX(-50%)',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#fff',
                border: `3px solid ${fgColor}`,
                boxShadow: '0 0 10px rgba(255,255,255,0.4)',
                transition: 'left 0.5s ease-in-out'
              }} />
            </div>
          </div>
        </div>

        {/* Whale Alerts Alert Feed */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '330px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} color="var(--color-warning)" />
              <span style={{ fontSize: '15px', fontWeight: '600', color: '#fff' }}>Whale Alerts Feed</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>On-chain data</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', height: '240px' }}>
            {data.whaleAlerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                No active whale alerts. Monitoring on-chain events...
              </div>
            ) : (
              data.whaleAlerts.map(whale => (
                <div 
                  key={whale.id}
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.02)', 
                    border: '1px solid var(--glass-border)',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontWeight: '700', fontSize: '13px', color: '#fff' }}>{whale.amount}</span>
                      <span style={{ 
                        fontSize: '9px', 
                        padding: '2px 6px', 
                        borderRadius: '4px',
                        fontWeight: '800',
                        background: whale.type === 'Deposit' || whale.type === 'Buy' ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                        color: whale.type === 'Deposit' || whale.type === 'Buy' ? 'var(--color-success)' : 'var(--color-error)'
                      }}>
                        {whale.type}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                      {whale.wallet} → {whale.destination}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{whale.time}</span>
                    {whale.type === 'Deposit' || whale.type === 'Buy' ? (
                      <ArrowDownRight size={16} color="var(--color-success)" />
                    ) : (
                      <ArrowUpRight size={16} color="var(--color-error)" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
