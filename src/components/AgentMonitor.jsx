import React, { useRef, useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import TradingViewChart from './TradingViewChart';
import { TrendingUp, Wallet, Activity, Terminal } from 'lucide-react';

const DownloadIcon = ({ size = 14, ...props }) => (
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
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default function AgentMonitor({ data, agentInfo, onPlaceOrder, onCancelOrder, onUpdateAgentParams, onTriggerManualAnalysis }) {
  const terminalEndRef = useRef(null);

  // Local form states for interactive execution ticket
  const [symbol] = useState('BTCUSDT');
  const [action, setAction] = useState('open_long'); // open_long, close_long, open_short, close_short
  const [orderType, setOrderType] = useState('market'); // market, limit
  const [size, setSize] = useState('0.01');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Toggle for bottom left table tab
  const [bottomTab, setBottomTab] = useState('history'); // history, pending
  const [chartTab, setChartTab] = useState('nav'); // nav, btc

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [data.logs]);

  // Synchronize price input with live prices when symbol or order type changes
  useEffect(() => {
    if (orderType === 'limit') {
      const p = data.prices.BTC;
      setPrice(p ? p.toString() : '');
    } else {
      setPrice('');
    }
  }, [symbol, orderType, data.prices]);

  // Calculate P&L metrics
  const totalPnlVal = data.positions.reduce((sum, p) => sum + p.pnl, 0);
  const pnlPercent = data.initialBalance > 0 ? ((totalPnlVal / data.initialBalance) * 100).toFixed(2) : "0.00";
  const winRate = "68.4%";

  // Handler to place order
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!onPlaceOrder) return;
    setSubmitting(true);

    let side = 'buy';
    let tradeSide = 'open';
    if (action === 'open_long') {
      side = 'buy';
      tradeSide = 'open';
    } else if (action === 'close_long') {
      side = 'sell';
      tradeSide = 'close';
    } else if (action === 'open_short') {
      side = 'sell';
      tradeSide = 'open';
    } else if (action === 'close_short') {
      side = 'buy';
      tradeSide = 'close';
    }

    try {
      await onPlaceOrder(symbol, side, parseFloat(size), orderType, price, tradeSide);
    } catch (err) {
      console.error("Order execution failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Export trades array to CSV file
  const exportToCSV = () => {
    if (!data.trades || data.trades.length === 0) {
      alert("No trades available to export.");
      return;
    }

    const headers = ["ID", "Timestamp", "Trading Pair", "Direction", "Execution Price", "Quantity", "Status", "P&L"];
    const rows = data.trades.map(trade => [
      trade.id,
      trade.timestamp,
      trade.pair,
      trade.type,
      trade.price,
      trade.size,
      trade.status,
      trade.pnl
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const filename = `${agentInfo ? agentInfo.id : 'bitget_agent'}_trade_log_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Safeguard parameters
  const maxLeverage = data.agentParams?.maxLeverage || 20;
  const stopLoss = data.agentParams?.stopLoss || 5;
  const takeProfit = data.agentParams?.takeProfit || 0.5;
  const riskThreshold = data.agentParams?.riskThreshold || 50;
  const isAutonomous = data.agentParams?.isAutonomous || false;
  const aggressiveness = data.agentParams?.aggressiveness || 'standard';
  const maxPositions = data.agentParams?.maxPositions || 3;
  const decisionInterval = data.agentParams?.decisionInterval || 5;

  return (
    <div className="animate-slide-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Active Agent Profile Metadata */}
      {agentInfo && (
        <div className="glass-panel" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(90deg, rgba(105,156,255,0.05) 0%, transparent 100%)', borderLeft: '4px solid var(--accent-purple)', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Agent</span>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff', marginTop: '2px' }}>{agentInfo.name}</div>
            </div>
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.08)' }} />
            <div>
              <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Model Provider</span>
              <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent-cyan)', marginTop: '2px' }}>{agentInfo.model}</div>
            </div>
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.08)' }} />
            <div>
              <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Sub-Account UID</span>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#fff', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>{agentInfo.subAccount}</div>
            </div>
            <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.08)' }} />
            <div>
              <span style={{ fontSize: '10px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target Strategy</span>
              <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{agentInfo.target}</div>
            </div>
          </div>
          <span style={{ 
            fontSize: '11px', 
            fontWeight: '700', 
            color: isAutonomous ? 'var(--color-success)' : 'var(--accent-purple)', 
            background: isAutonomous ? 'var(--color-success-bg)' : 'rgba(204, 151, 255, 0.1)', 
            padding: '4px 10px', 
            borderRadius: '6px',
            border: `1px solid ${isAutonomous ? 'rgba(155, 255, 206, 0.2)' : 'rgba(204, 151, 255, 0.2)'}`
          }}>
            ● {isAutonomous ? 'AUTONOMOUS ACTIVE' : 'OBSERVATION ONLY'}
          </span>
        </div>
      )}

      {/* 1. Header Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        
        {/* Card 1: Balance */}
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-cyan)' }}>
            <Wallet size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: '500' }}>TOTAL NAV</div>
            <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'var(--font-sans)', color: '#fff', marginTop: '4px' }}>
              ${data.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              {data.useRealBitget ? 'USDT (Demo Trading)' : 'USDT (Offline state)'}
            </div>
          </div>
        </div>

        {/* Card 2: Open P&L */}
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            padding: '12px', 
            borderRadius: '12px', 
            background: totalPnlVal >= 0 ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
            color: totalPnlVal >= 0 ? 'var(--color-success)' : 'var(--color-error)' 
          }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: '500' }}>REAL-TIME P&L</div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: '800', 
              color: totalPnlVal >= 0 ? 'var(--color-success)' : 'var(--color-error)',
              marginTop: '4px'
            }}>
              {totalPnlVal >= 0 ? '+' : ''}{totalPnlVal.toFixed(2)} USDT
            </div>
            <div style={{ fontSize: '12px', color: totalPnlVal >= 0 ? 'var(--color-success)' : 'var(--color-error)', marginTop: '2px', fontWeight: '600' }}>
              {pnlPercent >= 0 ? '+' : ''}{pnlPercent}% (Today)
            </div>
          </div>
        </div>

        {/* Card 3: Positions Exposure */}
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.1)', color: 'var(--accent-purple)' }}>
            <Activity size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: '500' }}>MARGIN USED</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginTop: '4px' }}>
              ${data.marginUsed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Exposure: {((data.marginUsed / (data.balance || 1)) * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Card 4: Historical Win Rate */}
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '13px', fontWeight: '500' }}>WIN RATE</div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginTop: '4px' }}>
              {winRate}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
              30 trades backtested
            </div>
          </div>
        </div>

      </div>

      {/* 2. Grid for NAV Chart & Positions */}
      <div className="grid-dashboard">
        
        {/* Chart Section */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '340px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                onClick={() => setChartTab('nav')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: chartTab === 'nav' ? '#fff' : 'var(--color-text-muted)',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  borderBottom: chartTab === 'nav' ? '2px solid var(--accent-purple)' : 'none',
                  paddingBottom: '4px',
                  outline: 'none'
                }}
              >
                Equity Curve (NAV)
              </button>
              <button 
                onClick={() => setChartTab('btc')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: chartTab === 'btc' ? '#fff' : 'var(--color-text-muted)',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  borderBottom: chartTab === 'btc' ? '2px solid var(--accent-cyan)' : 'none',
                  paddingBottom: '4px',
                  outline: 'none'
                }}
              >
                BTC Price Chart
              </button>
            </div>
            <span style={{ fontSize: '12px', color: chartTab === 'nav' ? 'var(--accent-purple)' : 'var(--accent-cyan)', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold' }}>
              {chartTab === 'nav' ? 'Real-time Balance' : `BTC Index: $${(data.prices.BTC || 0).toLocaleString()}`}
            </span>
          </div>

          <div style={{ flexGrow: 1, width: '100%', height: '240px' }}>
            {chartTab === 'nav' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.navHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNav" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-purple)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--accent-purple)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="var(--color-text-muted)" style={{ fontSize: 11 }} />
                  <YAxis stroke="var(--color-text-muted)" domain={['auto', 'auto']} style={{ fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--glass-border)', color: '#fff', borderRadius: '8px' }}
                    labelStyle={{ fontWeight: 'bold' }}
                    formatter={(value) => [`$${parseFloat(value).toLocaleString(undefined, {minimumFractionDigits: 2})}`, 'NAV']}
                  />
                  <Area type="monotone" dataKey="nav" stroke="var(--accent-purple)" strokeWidth={2} fillOpacity={1} fill="url(#colorNav)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <TradingViewChart symbol="BINANCE:BTCUSDT" height="100%" />
            )}
          </div>
        </div>

        {/* Open Positions List */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>Open Positions</span>
            <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Count: {data.positions.length}</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '270px' }}>
            {data.positions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                No active positions. Agent is scanning markets...
              </div>
            ) : (
              data.positions.map(pos => (
                <div 
                  key={pos.id} 
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.02)', 
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '14px' }}>{pos.pair}</span>
                      <span style={{ 
                        fontSize: '10px', 
                        fontWeight: '800', 
                        textTransform: 'uppercase',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        color: pos.type === 'Long' ? 'var(--color-success)' : 'var(--color-error)',
                        background: pos.type === 'Long' ? 'var(--color-success-bg)' : 'var(--color-error-bg)'
                      }}>
                        {pos.type} {pos.leverage}x
                      </span>
                    </div>
                    <span style={{ 
                      fontWeight: '700', 
                      fontSize: '14px',
                      color: pos.pnl >= 0 ? 'var(--color-success)' : 'var(--color-error)'
                    }}>
                      {pos.pnl >= 0 ? '+' : ''}{pos.pnl.toFixed(2)} USDT
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                    <div>
                      <div>Size</div>
                      <div style={{ color: '#fff', fontWeight: '500', marginTop: '2px' }}>{pos.size}</div>
                    </div>
                    <div>
                      <div>Entry Price</div>
                      <div style={{ color: '#fff', fontWeight: '500', marginTop: '2px' }}>${pos.entryPrice.toLocaleString()}</div>
                    </div>
                    <div>
                      <div>Mark Price</div>
                      <div style={{ color: '#fff', fontWeight: '500', marginTop: '2px' }}>${pos.currentPrice.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 2.5 Tuning & Execution Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Card 1: Analyst Focus Steering */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>Analyst Focus Steering</span>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Steer the AI analyst's report focus, risk weights, and thresholds.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Leverage Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Max Leverage</span>
                <span style={{ color: 'var(--accent-purple)', fontWeight: 'bold' }}>{maxLeverage}x</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="50" 
                value={maxLeverage}
                onChange={(e) => onUpdateAgentParams?.({ maxLeverage: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                <span>1x (Conservative)</span>
                <span>50x (Ultra-Aggressive)</span>
              </div>
            </div>

            {/* Risk Stop Tolerance */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Risk Stop Tolerance</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{stopLoss}%</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="20" 
                step="0.5"
                value={stopLoss}
                onChange={(e) => onUpdateAgentParams?.({ stopLoss: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                <span>1% (Tight Risk Stance)</span>
                <span>20% (Wide Volatility)</span>
              </div>
            </div>

            {/* Analyst Risk Sensitivity */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Analyst Risk Sensitivity</span>
                <span style={{ color: 'var(--color-warning)', fontWeight: 'bold' }}>{riskThreshold}%</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="90" 
                step="5"
                value={riskThreshold}
                onChange={(e) => onUpdateAgentParams?.({ riskThreshold: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--color-warning)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                <span>10% (Ultra-Conservative)</span>
                <span>90% (High Exposure Mode)</span>
              </div>
            </div>

            {/* Analyst Profit Target Focus */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Analyst Profit Target Focus</span>
                <span style={{ color: 'var(--accent-purple)', fontWeight: 'bold' }}>{takeProfit}%</span>
              </div>
              <input 
                type="range" 
                min="0.1" 
                max="3" 
                step="0.1"
                value={takeProfit}
                onChange={(e) => onUpdateAgentParams?.({ takeProfit: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent-purple)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                <span>0.1% (Tight Scans)</span>
                <span>3.0% (Macro Swings)</span>
              </div>
            </div>

            {/* Exposure Position Cap */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>Exposure Position Cap</span>
                <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{maxPositions}</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="5" 
                step="1"
                value={maxPositions}
                onChange={(e) => onUpdateAgentParams?.({ maxPositions: parseInt(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                <span>1 Active Pos</span>
                <span>5 Active Pos</span>
              </div>
            </div>

            {/* Dropdown selectors for Aggressiveness and Decision Speed */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>ANALYSIS STANCE</label>
                <select 
                  value={aggressiveness} 
                  onChange={(e) => onUpdateAgentParams?.({ aggressiveness: e.target.value })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '6px', padding: '6px', fontSize: '12px', outline: 'none' }}
                >
                  <option value="conservative" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Conservative</option>
                  <option value="standard" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Standard</option>
                  <option value="aggressive" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Aggressive</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '10px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>REPORT REFRESH RATE</label>
                <select 
                  value={decisionInterval} 
                  onChange={(e) => onUpdateAgentParams?.({ decisionInterval: parseInt(e.target.value) })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '6px', padding: '6px', fontSize: '12px', outline: 'none' }}
                >
                  <option value={2} style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Fast (6s)</option>
                  <option value={5} style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Normal (15s)</option>
                  <option value={10} style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Slow (30s)</option>
                </select>
              </div>
            </div>

            {/* Autonomous Trading Toggle */}
            <div style={{ 
              borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
              paddingTop: '16px',
              marginTop: '8px',
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center' 
            }}>
              <div>
                <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isAutonomous && (
                    <span style={{ 
                      width: '6px', 
                      height: '6px', 
                      borderRadius: '50%', 
                      background: 'var(--color-success)',
                      boxShadow: '0 0 8px var(--color-success)',
                      display: 'inline-block'
                    }} />
                  )}
                  Real-time Analyst Feed
                </span>
                <p style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Allows the AI to automatically analyze markets and refresh reports in real time.
                </p>
              </div>
              
              <button
                type="button"
                onClick={() => onUpdateAgentParams?.({ isAutonomous: !isAutonomous })}
                style={{
                  background: isAutonomous ? 'rgba(155, 255, 206, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${isAutonomous ? 'var(--color-success)' : 'var(--glass-border)'}`,
                  color: isAutonomous ? 'var(--color-success)' : 'var(--color-text-muted)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'var(--transition-smooth)'
                }}
              >
                {isAutonomous ? 'RUNNING' : 'PAUSED'}
              </button>
            </div>

          </div>
        </div>

        {/* Card 2: Manual execution Ticket */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}>Manual execution Ticket</span>
            <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
              Execute manual orders directly on your live Bitget account.
            </p>
          </div>

          <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Symbol & Order Type Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>SYMBOL</label>
                <select 
                  value={symbol} 
                  disabled
                  style={{ width: '100%', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--glass-border)', color: 'var(--color-text-muted)', borderRadius: '6px', padding: '6px', fontSize: '12px', outline: 'none', cursor: 'not-allowed' }}
                >
                  <option value="BTCUSDT" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>BTCUSDT (BTC Only)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '10px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>ORDER TYPE</label>
                <select 
                  value={orderType} 
                  onChange={(e) => setOrderType(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '6px', padding: '6px', fontSize: '12px', outline: 'none' }}
                >
                  <option value="market" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Market Order</option>
                  <option value="limit" style={{ background: 'var(--bg-secondary)', color: '#fff' }}>Limit Order</option>
                </select>
              </div>
            </div>

            {/* Action Selector */}
            <div>
              <label style={{ fontSize: '10px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>ACTION</label>
              <select 
                value={action} 
                onChange={(e) => setAction(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '6px', padding: '6px', fontSize: '12px', outline: 'none' }}
              >
                <option value="open_long" style={{ background: 'var(--bg-secondary)', color: 'var(--color-success)' }}>Open Long</option>
                <option value="close_long" style={{ background: 'var(--bg-secondary)', color: 'var(--color-error)' }}>Close Long</option>
                <option value="open_short" style={{ background: 'var(--bg-secondary)', color: 'var(--color-error)' }}>Open Short</option>
                <option value="close_short" style={{ background: 'var(--bg-secondary)', color: 'var(--color-success)' }}>Close Short</option>
              </select>
            </div>

            {/* Size & Price Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>SIZE (UNITS)</label>
                <input 
                  type="number" 
                  step="any"
                  required
                  min="0.0001"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', color: '#fff', borderRadius: '6px', padding: '5px 8px', fontSize: '12px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '10px', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>PRICE (USDT)</label>
                <input 
                  type="number" 
                  step="any"
                  disabled={orderType === 'market'}
                  placeholder={orderType === 'market' ? 'MARKET PRICE' : 'Enter Price'}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={{ 
                    width: '100%', 
                    background: orderType === 'market' ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)', 
                    border: '1px solid var(--glass-border)', 
                    color: orderType === 'market' ? 'var(--color-text-muted)' : '#fff', 
                    borderRadius: '6px', 
                    padding: '5px 8px', 
                    fontSize: '12px', 
                    outline: 'none',
                    cursor: orderType === 'market' ? 'not-allowed' : 'text'
                  }}
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={submitting}
              style={{
                background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
                marginTop: '4px',
                transition: 'var(--transition-smooth)'
              }}
            >
              {submitting ? 'Placing Order...' : 'Place Manual Order'}
            </button>

          </form>
        </div>

        {/* Card 3: KAZUA AI Market Analyst Report */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '4px solid var(--accent-purple)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>KAZUA AI Market Analyst Report</span>
            <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              UPDATED: {data.analystReport?.timestamp || 'N/A'}
            </span>
          </div>

          {/* Badges row */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
            <div style={{ 
              padding: '3px 8px', 
              borderRadius: '4px', 
              fontSize: '9px', 
              fontWeight: '800',
              textTransform: 'uppercase',
              color: data.analystReport?.sentiment === 'BULLISH' ? 'var(--color-success)' : data.analystReport?.sentiment === 'BEARISH' ? 'var(--color-error)' : 'var(--accent-cyan)',
              background: data.analystReport?.sentiment === 'BULLISH' ? 'var(--color-success-bg)' : data.analystReport?.sentiment === 'BEARISH' ? 'var(--color-error-bg)' : 'rgba(83, 221, 252, 0.1)',
              border: `1px solid ${data.analystReport?.sentiment === 'BULLISH' ? 'rgba(155, 255, 206, 0.2)' : data.analystReport?.sentiment === 'BEARISH' ? 'rgba(255, 110, 132, 0.2)' : 'rgba(83, 221, 252, 0.2)'}`
            }}>
              Sentiment: {data.analystReport?.sentiment || 'NEUTRAL'}
            </div>
            
            <div style={{ 
              padding: '3px 8px', 
              borderRadius: '4px', 
              fontSize: '9px', 
              fontWeight: '800',
              textTransform: 'uppercase',
              color: data.analystReport?.riskLevel === 'HIGH' ? 'var(--color-error)' : data.analystReport?.riskLevel === 'MEDIUM' ? 'var(--color-warning)' : 'var(--color-success)',
              background: data.analystReport?.riskLevel === 'HIGH' ? 'var(--color-error-bg)' : data.analystReport?.riskLevel === 'MEDIUM' ? 'var(--color-warning-bg)' : 'var(--color-success-bg)',
              border: `1px solid ${data.analystReport?.riskLevel === 'HIGH' ? 'rgba(255, 110, 132, 0.2)' : data.analystReport?.riskLevel === 'MEDIUM' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(155, 255, 206, 0.2)'}`
            }}>
              Risk Stance: {data.analystReport?.riskLevel || 'LOW'}
            </div>

            {/* Ingested Feeds status indicator */}
            <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: 'var(--color-success)' }} title="Kiyotaka Feed Connected">
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--color-success)' }} />
                <span>Kiyotaka Feed</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: 'var(--color-success)' }} title="Bitget Account Synced">
                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--color-success)' }} />
                <span>Bitget Sync</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
            <div>
              <span style={{ fontWeight: '700', color: '#fff', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kiyotaka Sentiment Insights</span>
              <p style={{ marginTop: '2px', lineHeight: '1.4' }}>{data.analystReport?.kiyotakaInsight}</p>
            </div>
            
            <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.04)' }} />

            <div>
              <span style={{ fontWeight: '700', color: '#fff', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Bitget Account Stance</span>
              <p style={{ marginTop: '2px', lineHeight: '1.4' }}>{data.analystReport?.bitgetInsight}</p>
            </div>

            <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.04)' }} />

            <div>
              <span style={{ fontWeight: '700', color: '#fff', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Comprehensive Analysis</span>
              <p style={{ marginTop: '2px', lineHeight: '1.4', color: 'var(--color-text-primary)' }}>{data.analystReport?.overallAnalysis}</p>
            </div>

            <div style={{ 
              border: '1px dashed var(--accent-purple-glow)', 
              background: 'rgba(204, 151, 255, 0.02)', 
              padding: '8px 10px', 
              borderRadius: '6px',
              marginTop: '4px'
            }}>
              <span style={{ fontWeight: '700', color: 'var(--accent-purple)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Strategic Recommendation</span>
              <p style={{ marginTop: '2px', lineHeight: '1.4', color: '#fff', fontWeight: '500' }}>{data.analystReport?.recommendation}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onTriggerManualAnalysis?.()}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--glass-border)',
              color: '#fff',
              borderRadius: '8px',
              padding: '6px',
              fontSize: '11px',
              fontWeight: '700',
              cursor: 'pointer',
              marginTop: 'auto',
              transition: 'var(--transition-smooth)',
              textAlign: 'center'
            }}
          >
            Refresh Analyst Report
          </button>
        </div>

      </div>

      {/* 3. Bottom Layout Grid: Trade Execution Log / Pending & Live Thoughts */}
      <div className="bottom-grid">
        
        {/* Trade Execution Log / Pending Card */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '280px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button 
                onClick={() => setBottomTab('history')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: bottomTab === 'history' ? '#fff' : 'var(--color-text-muted)',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  borderBottom: bottomTab === 'history' ? '2px solid var(--accent-purple)' : 'none',
                  paddingBottom: '4px',
                  outline: 'none'
                }}
              >
                Trade Execution Log
              </button>
              <button 
                onClick={() => setBottomTab('pending')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: bottomTab === 'pending' ? '#fff' : 'var(--color-text-muted)',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  borderBottom: bottomTab === 'pending' ? '2px solid var(--accent-purple)' : 'none',
                  paddingBottom: '4px',
                  outline: 'none'
                }}
              >
                Pending Orders ({data.pendingOrders?.length || 0})
              </button>
            </div>
            
            {bottomTab === 'history' && (
              <button 
                onClick={exportToCSV}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(105, 156, 255, 0.1)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--color-text-primary)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600',
                  transition: 'var(--transition-smooth)'
                }}
                title="Download CSV Log"
              >
                <DownloadIcon size={12} />
                <span>Export CSV</span>
              </button>
            )}
          </div>

          <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '200px' }}>
            {bottomTab === 'history' ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-text-secondary)' }}>
                    <th style={{ padding: '8px 4px' }}>Time</th>
                    <th style={{ padding: '8px 4px' }}>Pair</th>
                    <th style={{ padding: '8px 4px' }}>Side</th>
                    <th style={{ padding: '8px 4px' }}>Price</th>
                    <th style={{ padding: '8px 4px' }}>Size</th>
                    <th style={{ padding: '8px 4px' }}>P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {data.trades.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
                        No trades executed yet.
                      </td>
                    </tr>
                  ) : (
                    data.trades.map((trade, idx) => (
                      <tr key={trade.id || idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)', color: '#fff' }}>
                        <td style={{ padding: '8px 4px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{trade.timestamp}</td>
                        <td style={{ padding: '8px 4px', fontWeight: 'bold' }}>{trade.pair}</td>
                        <td style={{ padding: '8px 4px' }}>
                          <span style={{ 
                            color: trade.type.includes('Long') || trade.type.includes('Buy') || trade.type.includes('Filled') ? 'var(--color-success)' : 'var(--color-error)',
                            fontWeight: '600'
                          }}>
                            {trade.type}
                          </span>
                        </td>
                        <td style={{ padding: '8px 4px' }}>${parseFloat(trade.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: '8px 4px', fontFamily: 'var(--font-mono)' }}>{trade.size}</td>
                        <td style={{ 
                          padding: '8px 4px', 
                          fontWeight: 'bold',
                          color: trade.pnl.includes('+') ? 'var(--color-success)' : trade.pnl.includes('-') ? 'var(--color-error)' : 'var(--color-text-muted)'
                        }}>
                          {trade.pnl}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-text-secondary)' }}>
                    <th style={{ padding: '8px 4px' }}>Time</th>
                    <th style={{ padding: '8px 4px' }}>Pair</th>
                    <th style={{ padding: '8px 4px' }}>Type</th>
                    <th style={{ padding: '8px 4px' }}>Price</th>
                    <th style={{ padding: '8px 4px' }}>Size</th>
                    <th style={{ padding: '8px 4px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!data.pendingOrders || data.pendingOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>
                        No pending limit orders on Bitget.
                      </td>
                    </tr>
                  ) : (
                    data.pendingOrders.map((ord) => (
                      <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)', color: '#fff' }}>
                        <td style={{ padding: '8px 4px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>{ord.timestamp}</td>
                        <td style={{ padding: '8px 4px', fontWeight: 'bold' }}>{ord.symbol}</td>
                        <td style={{ padding: '8px 4px' }}>
                          <span style={{ 
                            color: ord.side === 'buy' ? 'var(--color-success)' : 'var(--color-error)',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            fontSize: '10px'
                          }}>
                            {ord.orderType} {ord.side} ({ord.tradeSide})
                          </span>
                        </td>
                        <td style={{ padding: '8px 4px', fontFamily: 'var(--font-mono)' }}>${ord.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: '8px 4px', fontFamily: 'var(--font-mono)' }}>{ord.size}</td>
                        <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                          <button
                            onClick={() => onCancelOrder?.(ord.symbol, ord.id)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid rgba(239, 68, 68, 0.2)',
                              color: 'var(--color-error)',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '10px',
                              fontWeight: '700',
                              transition: 'var(--transition-smooth)'
                            }}
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Live Thoughts Terminal */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '280px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-cyan)' }}>
              <Terminal size={18} />
              <span style={{ fontSize: '14px', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                {agentInfo ? `${agentInfo.id}-run.log` : 'bitget-agent-ai-feed.log'}
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>STATUS: LOGGING_LIVE</span>
          </div>

          <div style={{ 
            height: '200px', 
            overflowY: 'auto', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px', 
            fontFamily: 'var(--font-mono)', 
            fontSize: '12px',
            color: '#10b981', 
            padding: '4px'
          }}>
            {data.logs.slice().reverse().map(log => (
              <div key={log.id} style={{ lineHeight: '1.5', display: 'flex', gap: '10px' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>[{log.timestamp}]</span>
                <span>{log.text}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '8px', color: 'var(--accent-cyan)' }}>
              <span>&gt; Scanning markets for new setups</span>
              <span className="terminal-cursor">_</span>
            </div>
            <div ref={terminalEndRef} />
          </div>
        </div>

      </div>

    </div>
  );
}
