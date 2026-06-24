import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, BarChart2, Shield, Play } from 'lucide-react';

// Simulated 30-day performance data for benchmarking comparison
const BENCHMARK_HISTORY = Array.from({ length: 30 }, (_, idx) => {
  const day = idx + 1;
  // Dynamic growth math representing different strategies
  const btcBase = 100 + Math.sin(day * 0.4) * 8 + day * 1.5;
  const k1Base = 100 + Math.sin(day * 0.3) * 5 + day * 4.2;
  const k2Base = 100 + Math.cos(day * 0.6) * 20 + day * 8.5;
  const k3Base = 100 + Math.sin(day * 0.2) * 3 + day * 2.8;

  return {
    day: `Day ${day}`,
    'Buy & Hold BTC': parseFloat(btcBase.toFixed(1)),
    'Kazua-1 (BTC Trend)': parseFloat(k1Base.toFixed(1)),
    'Kazua-2 (SOL Meme)': parseFloat(k2Base.toFixed(1)),
    'Kazua-3 (ETH Macro)': parseFloat(k3Base.toFixed(1)),
  };
});

const STRATEGY_DETAILS = {
  k1: {
    name: "Kazua-1 (BTC Trend-Follower)",
    desc: "Uses MACD crossovers and moving averages on high-liquidity contracts. Designed for stable growth and capital preservation.",
    color: "var(--accent-purple)",
    stats: {
      return: "+124.0%",
      sharpe: "2.42",
      winRate: "68.4%",
      maxDD: "-12.4%",
      trades: "142",
      profitFactor: "2.12"
    }
  },
  k2: {
    name: "Kazua-2 (SOL Meme Momentum)",
    desc: "High-risk strategy targeting on-chain liquidity surges and whale wallet transfers. Maximum leverage allowed for rapid expansion.",
    color: "var(--accent-cyan)",
    stats: {
      return: "+245.0%",
      sharpe: "1.78",
      winRate: "54.2%",
      maxDD: "-28.6%",
      trades: "512",
      profitFactor: "1.68"
    }
  },
  k3: {
    name: "Kazua-3 (ETH Macro Rebalancer)",
    desc: "Evaluates funding rate shifts, ETF flows, and macroeconomic briefings to rebalance spot and futures exposure dynamically.",
    color: "var(--color-warning)",
    stats: {
      return: "+84.0%",
      sharpe: "2.81",
      winRate: "72.1%",
      maxDD: "-8.2%",
      trades: "64",
      profitFactor: "2.54"
    }
  },
  btc: {
    name: "Buy & Hold BTC Baseline",
    desc: "Standard benchmark strategy holding spot Bitcoin without leverage or rebalancing.",
    color: "var(--color-text-secondary)",
    stats: {
      return: "+48.0%",
      sharpe: "1.20",
      winRate: "N/A",
      maxDD: "-18.5%",
      trades: "1",
      profitFactor: "N/A"
    }
  }
};

export default function StrategyEvaluator() {
  const [selectedStrategy, setSelectedStrategy] = useState('k1');

  const activeStrategy = STRATEGY_DETAILS[selectedStrategy];

  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Tab Header Overview */}
      <div className="glass-panel" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)', borderLeft: '4px solid var(--accent-purple)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Award size={20} color="var(--accent-purple)" />
          <span>Strategy Evaluation & Benchmarking Matrix</span>
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', marginTop: '6px', lineHeight: '1.5' }}>
          Compare performance metrics, Sharpe ratios, and cumulative returns across the three active Kazua Agent profiles against a passive Buy-and-Hold Bitcoin benchmark. All historical backtest data covers the last 30-day trading interval.
        </p>
      </div>

      {/* Grid of Strategy Overview Selectors */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {Object.entries(STRATEGY_DETAILS).map(([key, strat]) => {
          const isActive = selectedStrategy === key;
          return (
            <div 
              key={key}
              onClick={() => setSelectedStrategy(key)}
              className="glass-panel"
              style={{
                cursor: 'pointer',
                borderColor: isActive ? strat.color : 'var(--glass-border)',
                background: isActive ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.01)',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? `0 0 12px ${strat.color}22` : 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: isActive ? '#fff' : 'var(--color-text-secondary)' }}>
                  {key === 'btc' ? 'Baseline' : `Profile: ${key.toUpperCase()}`}
                </span>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  background: strat.color 
                }} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '800', color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {strat.name.split(' (')[0]}
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '6px', color: strat.stats.return.startsWith('+') ? 'var(--color-success)' : '#fff' }}>
                  {strat.stats.return}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                Sharpe Ratio: <strong style={{ color: '#fff' }}>{strat.stats.sharpe}</strong> | Max Drawdown: <strong style={{ color: '#fff' }}>{strat.stats.maxDD}</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* 30-Day Cumulative Returns Line Chart */}
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '380px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={18} color="var(--accent-cyan)" />
              <span>30-Day Performance Comparison Chart</span>
            </span>
            <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Relative growth indexed from base value of 100 USDT.
            </p>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--accent-purple)', background: 'rgba(168, 85, 247, 0.08)', padding: '4px 8px', borderRadius: '6px', fontWeight: '700' }}>
            Cumulative Returns (%)
          </span>
        </div>

        <div style={{ flexGrow: 1, width: '100%', height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={BENCHMARK_HISTORY} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="day" stroke="var(--color-text-muted)" style={{ fontSize: 11 }} />
              <YAxis stroke="var(--color-text-muted)" style={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--glass-border)', color: '#fff', borderRadius: '8px' }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
              <Line type="monotone" dataKey="Kazua-1 (BTC Trend)" stroke="var(--accent-purple)" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Kazua-2 (SOL Meme)" stroke="var(--accent-cyan)" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Kazua-3 (ETH Macro)" stroke="var(--color-warning)" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Buy & Hold BTC" stroke="var(--color-text-secondary)" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Selected Strategy Deep-dive Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Deep Dive Metadata */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Strategy Spotlight</span>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#fff', marginTop: '4px' }}>{activeStrategy.name}</h3>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
            {activeStrategy.desc}
          </p>
          <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
            <Shield size={16} color={activeStrategy.color} />
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
              Risk rating: <strong style={{ color: '#fff' }}>{selectedStrategy === 'k2' ? 'High Risk' : selectedStrategy === 'k1' ? 'Moderate' : 'Low Risk'}</strong>
            </span>
          </div>
        </div>

        {/* Backtest Statistics Table */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>Backtest Statistical Summary</span>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
            
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>CUMULATIVE RETURN</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-success)', marginTop: '4px' }}>{activeStrategy.stats.return}</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>SHARPE RATIO</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginTop: '4px' }}>{activeStrategy.stats.sharpe}</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>HISTORICAL WIN RATE</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginTop: '4px' }}>{activeStrategy.stats.winRate}</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>MAX DRAWDOWN</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--color-error)', marginTop: '4px' }}>{activeStrategy.stats.maxDD}</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>PROFIT FACTOR</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginTop: '4px' }}>{activeStrategy.stats.profitFactor}</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>TOTAL TRADES FILLED</div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginTop: '4px' }}>{activeStrategy.stats.trades}</div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
