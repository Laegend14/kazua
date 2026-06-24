// Simulation Engine for Kazua AI Agent Dashboard
// Simulates live price updates, agent trades, risk calculations, and on-chain sentiment data.
// Integrates with Kiyotaka Data API and Bitget Agent Hub for live market, account, and positions data.

import { kiyotakaService } from '../services/kiyotakaService';
import { bitgetService } from '../services/bitgetService';
import { geminiService } from '../services/geminiService';

function generateMockAnalystReport(prices, positions, balance, marginUsed, fearGreed, technicalSummary, whaleAlerts, agentParams) {
  const rsi = technicalSummary?.rsi || 58;
  const isBullish = rsi > 55;
  const sentiment = isBullish ? "BULLISH" : rsi < 45 ? "BEARISH" : "NEUTRAL";
  const riskVal = balance > 0 ? (marginUsed / balance * 100) : 0;
  const riskLevel = riskVal > 40 ? "HIGH" : riskVal > 15 ? "MEDIUM" : "LOW";
  const btcPrice = prices.BTC;
  
  const summaries = [
    `BTC consolidates at $${btcPrice.toLocaleString()} with ${sentiment.toLowerCase()} indications.`,
    `On-chain liquidations stabilizing near $${Math.round(btcPrice/1000)}k support zone.`,
    `Kiyotaka funding rates reflect ${isBullish ? 'leveraged long bias' : 'leveraged short bias'}.`
  ];
  
  return {
    summary: summaries[Math.floor(Math.random() * summaries.length)],
    sentiment,
    riskLevel,
    kiyotakaInsight: `Kiyotaka Index: Fear & Greed is at ${fearGreed}, RSI is at ${rsi}. On-chain activity indicates ${whaleAlerts.length > 0 ? 'whale transfers registered' : 'quiet retail liquidations'}.`,
    bitgetInsight: `Bitget Portfolio: margin exposure is at ${riskVal.toFixed(1)}% with ${positions.length} active positions on the account.`,
    overallAnalysis: `The market displays a structural ${sentiment.toLowerCase()} stance. Volatility indicators show moderate fluctuations. Kiyotaka funding rates remain neutral, suggesting that risk of a sudden leverage squeeze is minimal. Bitget positions are well within safety boundaries.`,
    recommendation: sentiment === "BULLISH" 
      ? `Acknowledge bullish structure. Consider long exposure up to ${agentParams?.maxLeverage || 20}x leverage with a profit target of ${agentParams?.takeProfit || 0.5}%.` 
      : sentiment === "BEARISH" 
      ? `Observe bearish continuation. Recommendation is to hedge existing risk or hold cash pending an RSI stabilization.` 
      : `Range-bound trend. Focus on short scalps with tight stop-loss targets of ${agentParams?.stopLoss || 5}% via the execution ticket.`,
    timestamp: new Date().toLocaleTimeString()
  };
}

const THOUGHT_TEMPLATES = [
  "Analyzing order book depth on BTC/USDT futures...",
  "Sentiment Analysis: Fear & Greed index is at {fearGreed}, checking institutional flows.",
  "On-chain alert: {whaleWallet} moved {whaleAmount} BTC to Bitget. Monitoring market pressure.",
  "Checking technical indicators: BTC RSI at {rsi}, MACD crossover detected.",
  "Calculated exposure ratio is {exposure}%. Risk profile is within acceptable limits.",
  "Volatility spiked. Adjusting trailing stop-loss for ETH long position.",
  "Kazua Signal Match: Bullish trend detected on SOL/USDT. Simulating order placement...",
  "Kazua Order Fill: Sim-order filled successfully. Target: SOL Long @ {solPrice} USDT.",
  "Macro Analysis: Fed speech sentiment is slightly hawkish, rebalancing risk weighting.",
  "ETF Net Inflow recorded: +${etfFlow}M today. Bullish narrative holds.",
  "Simulated balance updated. Total Unrealized P&L is {pnl} USDT."
];

const INITIAL_LOGS = [
  { id: 1, timestamp: new Date(Date.now() - 600000).toLocaleTimeString(), text: "System Initialized. Connected to Kazua Core Engine." },
  { id: 2, timestamp: new Date(Date.now() - 500000).toLocaleTimeString(), text: "API Authentication successful. Registered Kazua UID: 7864960146." },
  { id: 3, timestamp: new Date(Date.now() - 400000).toLocaleTimeString(), text: "Setting target risk profile: Moderate (Max Leverage 20x)." },
  { id: 4, timestamp: new Date(Date.now() - 300000).toLocaleTimeString(), text: "Listening to on-chain whale transfers and ETF flows..." },
  { id: 5, timestamp: new Date(Date.now() - 200000).toLocaleTimeString(), text: "Live trading engine started. Waiting for Bitget API connection..." }
];


export class DashboardSimulator {
  constructor(onChange) {
    this.onChange = onChange;
    this.logsCount = INITIAL_LOGS.length;
    this.tickCount = 0;
    this.useRealBitget = false; // Flag to indicate if real Bitget API is active
    
    // Generate simulated history for initial render in case APIs are not connected
    const initialBtcPrice = 65420.50;
    const initialBalance = 10000.00;
    const historyPoints = [];
    const btcPoints = [];
    const now = Date.now();
    for (let i = 15; i >= 0; i--) {
      const timeStr = new Date(now - i * 60000 * 30).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      // Generate slightly random walks for a beautiful starting chart
      const pctChange = (Math.sin((15 - i) * 0.4) * 0.005) + (Math.cos((15 - i) * 0.8) * 0.002);
      const btcPrice = initialBtcPrice * (1 + pctChange * 2.5);
      const nav = initialBalance * (1 + pctChange);
      
      historyPoints.push({ time: timeStr, nav: parseFloat(nav.toFixed(2)) });
      btcPoints.push({ time: timeStr, price: parseFloat(btcPrice.toFixed(2)) });
    }

    // Initial State
    this.state = {
      useRealBitget: false,
      balance: initialBalance,
      initialBalance: initialBalance,
      marginUsed: 0,
      prices: {
        BTC: initialBtcPrice,
        ETH: 3480.20,
        SOL: 145.80
      },
      positions: [],
      trades: [],
      pendingOrders: [],
      agentParams: {
        maxLeverage: 20,
        stopLoss: 5,
        takeProfit: 0.5,
        riskThreshold: 50,
        isAutonomous: false,
        aggressiveness: 'standard',
        maxPositions: 3,
        decisionInterval: 5
      },
      analystReport: {
        summary: "Initializing market analysis based on Kiyotaka and Bitget data streams...",
        sentiment: "NEUTRAL",
        riskLevel: "LOW",
        kiyotakaInsight: "Kiyotaka data stream is currently active and reporting neutral funding rates.",
        bitgetInsight: "Bitget portfolio is active with zero open position exposure.",
        overallAnalysis: "Market structure is stabilizing around key support zones. Awaiting further indicators from Kiyotaka and Bitget portals.",
        recommendation: "Hold cash reserves and monitor RSI thresholds.",
        timestamp: new Date().toLocaleTimeString()
      },
      logs: [...INITIAL_LOGS],
      fearGreed: 54, // Neutral/Greed
      etfFlows: [
        { day: 'Mon', inflow: 120 },
        { day: 'Tue', inflow: -45 },
        { day: 'Wed', inflow: 340 },
        { day: 'Thu', inflow: 150 },
        { day: 'Fri', inflow: 210 },
        { day: 'Sat', inflow: 0 },
        { day: 'Sun', inflow: 0 }
      ],
      whaleAlerts: [],
      technicalSummary: {
        rsi: 58,
        macd: 'Bullish Crossover',
        sma200: 'Bullish Support',
        volatility: 'Medium'
      },
      navHistory: historyPoints,
      btcHistory: btcPoints,
      riskScore: 0
    };

    this.intervalId = null;
  }

  async initializeBitget() {
    this.state.logs.unshift({
      id: ++this.logsCount,
      timestamp: new Date().toLocaleTimeString(),
      text: "🔌 Connecting to Bitget Agent Hub..."
    });
    if (this.onChange) this.onChange(this.state);

    try {
      // 1. Fetch real futures account info
      const realAccount = await bitgetService.getFuturesAccount();
      const realPositions = await bitgetService.getFuturesPositions();
      const realFills = await bitgetService.getRecentFills();
      const realPending = await bitgetService.getPendingOrders();

      if (realAccount) {
        this.useRealBitget = true;
        this.state.useRealBitget = true;
        this.state.balance = realAccount.equity;
        this.state.initialBalance = realAccount.equity; // Reset base P&L calculations to match actual equity
        this.state.marginUsed = realAccount.margin;
        
        // Update navHistory with real initial point
        this.state.navHistory = [
          { time: 'Start', nav: realAccount.equity }
        ];

        // 2. Load Real Positions if available
        if (realPositions) {
          this.state.positions = realPositions;
        }

        // 3. Load Real Fills
        if (realFills && realFills.length > 0) {
          this.state.trades = realFills;
        }

        // 4. Load Pending Orders if available
        if (realPending) {
          this.state.pendingOrders = realPending;
        }

        this.state.logs.unshift({
          id: ++this.logsCount,
          timestamp: new Date().toLocaleTimeString(),
          text: "⚡ Bitget Agent Hub connected. Loaded live balances/positions."
        });
      } else {
        this.useRealBitget = false;
        this.state.useRealBitget = false;
        this.state.logs.unshift({
          id: ++this.logsCount,
          timestamp: new Date().toLocaleTimeString(),
          text: "⚠️ Bitget account connection failed. Check credentials in the .env file."
        });
      }
    } catch (err) {
      console.warn("Bitget Account initialization failed: ", err.message);
      this.useRealBitget = false;
      this.state.useRealBitget = false;
      this.state.logs.unshift({
        id: ++this.logsCount,
        timestamp: new Date().toLocaleTimeString(),
        text: `⚠️ Bitget connection failed: ${err.message}`
      });
    }
  }

  async initializeKiyotaka() {
    this.state.logs.unshift({
      id: ++this.logsCount,
      timestamp: new Date().toLocaleTimeString(),
      text: "🔌 Connecting to Kiyotaka Data API..."
    });
    if (this.onChange) this.onChange(this.state);

    // Initial load from Bitget first
    await this.initializeBitget();

    // Fetch initial live prices
    try {
      const prices = await bitgetService.getLivePrices();
      if (prices) {
        this.state.prices = prices;
      }
    } catch (err) {
      console.warn("Failed to load initial live prices: ", err.message);
    }

    try {
      // 1. Fetch Price History
      const kiyoHistory = await kiyotakaService.getBtcPriceHistory();
      if (kiyoHistory && kiyoHistory.length > 0) {
        const firstPrice = kiyoHistory[0].nav;
        // Normalize Kiyotaka price history relative to our current balance
        if (!this.useRealBitget) {
          this.state.balance = 10000;
          this.state.initialBalance = 10000;
        }
        const baseNav = this.state.balance || 10000;
        const normalizedHistory = kiyoHistory.map(h => ({
          time: h.time,
          nav: parseFloat(((h.nav / firstPrice) * baseNav).toFixed(2))
        }));
        this.state.navHistory = normalizedHistory;
        
        // Store raw BTC price history
        const btcHistory = kiyoHistory.map(h => ({
          time: h.time,
          price: h.nav
        }));
        this.state.btcHistory = btcHistory;
      }

      // 2. Fetch Funding Rate
      const kiyoFunding = await kiyotakaService.getBtcFundingRate();
      if (kiyoFunding) {
        const ratePercent = (kiyoFunding.rate * 100).toFixed(4);
        this.state.technicalSummary = {
          ...this.state.technicalSummary,
          macd: `Live Funding: ${ratePercent}%`,
          sma200: kiyoFunding.rate > 0 ? 'Premium Buy Bias' : 'Discount Sell Bias'
        };
        const baseFG = kiyoFunding.rate > 0.0001 ? 72 : kiyoFunding.rate < 0 ? 28 : 52;
        this.state.fearGreed = Math.round(baseFG);
      }

      // 3. Fetch Liquidations
      const kiyoLiquidations = await kiyotakaService.getRecentLiquidations();
      if (kiyoLiquidations && kiyoLiquidations.length > 0) {
        this.state.whaleAlerts = [...kiyoLiquidations, ...this.state.whaleAlerts].slice(0, 5);
      }

      this.state.logs.unshift({
        id: ++this.logsCount,
        timestamp: new Date().toLocaleTimeString(),
        text: "⚡ Kiyotaka Data API connected. Live market states integrated."
      });
    } catch (e) {
      console.error("Kiyotaka initialization failed: ", e);
      this.state.logs.unshift({
        id: ++this.logsCount,
        timestamp: new Date().toLocaleTimeString(),
        text: "⚠️ Kiyotaka connection failed. Running in isolated mode."
      });
    }

    if (this.onChange) {
      this.onChange(this.state);
    }
  }

  async updateKiyotakaBackground() {
    try {
      const kiyoFunding = await kiyotakaService.getBtcFundingRate();
      if (kiyoFunding) {
        const ratePercent = (kiyoFunding.rate * 100).toFixed(4);
        this.state.technicalSummary = {
          ...this.state.technicalSummary,
          macd: `Live Funding: ${ratePercent}%`,
          sma200: kiyoFunding.rate > 0 ? 'Premium Buy Bias' : 'Discount Sell Bias'
        };
        const baseFG = kiyoFunding.rate > 0.0001 ? 72 : kiyoFunding.rate < 0 ? 28 : 52;
        this.state.fearGreed = Math.round(baseFG);
      }

      const kiyoLiquidations = await kiyotakaService.getRecentLiquidations();
      if (kiyoLiquidations && kiyoLiquidations.length > 0) {
        const existingIds = new Set(this.state.whaleAlerts.map(w => w.id));
        const newAlerts = kiyoLiquidations.filter(w => !existingIds.has(w.id));
        if (newAlerts.length > 0) {
          this.state.whaleAlerts = [...newAlerts, ...this.state.whaleAlerts].slice(0, 5);
          newAlerts.forEach(alert => {
            this.state.logs.unshift({
              id: ++this.logsCount,
              timestamp: new Date().toLocaleTimeString(),
              text: `🐳 On-chain Liquidation: ${alert.amount} liquidated on exchange.`
            });
          });
        }
      }
    } catch (e) {
      console.warn("Background Kiyotaka update failed: ", e.message);
    }
  }

  async syncWithRealBitget() {
    try {
      const realAccount = await bitgetService.getFuturesAccount();
      const realPositions = await bitgetService.getFuturesPositions();
      const realPending = await bitgetService.getPendingOrders();

      if (realAccount) {
        this.state.balance = realAccount.equity;
        this.state.marginUsed = realAccount.margin;
      }
      
      if (realPositions) {
        this.state.positions = realPositions;
      }

      if (realPending) {
        this.state.pendingOrders = realPending;
      }
    } catch (err) {
      console.warn("Bitget sync failed in background: ", err.message);
    }
  }

  updateAgentParams(newParams) {
    const isAutonomousChanged = newParams.isAutonomous !== undefined && newParams.isAutonomous !== this.state.agentParams.isAutonomous;

    this.state.agentParams = {
      ...this.state.agentParams,
      ...newParams
    };

    if (isAutonomousChanged && newParams.isAutonomous) {
      // Force the next tick to trigger Gemini decision immediately
      this.tickCount = 0; // 0 % 5 === 0 is true, so it will call Gemini immediately in the tick
      this.state.logs.unshift({
        id: ++this.logsCount,
        timestamp: new Date().toLocaleTimeString(),
        text: "🤖 Kazua AI: Autonomous mode enabled. Initializing market analysis..."
      });
      // Force a tick immediately after a short delay
      setTimeout(() => {
        this.tick();
      }, 100);
    }

    if (this.onChange) this.onChange(this.state);
  }

  async placeOrder(symbol, side, size, orderType, price = '', tradeSide = 'open') {
    this.state.logs.unshift({
      id: ++this.logsCount,
      timestamp: new Date().toLocaleTimeString(),
      text: `📤 Sending Order Request: ${orderType.toUpperCase()} ${tradeSide.toUpperCase()} ${side.toUpperCase()} ${size} ${symbol} ${price ? '@ $' + price : ''}...`
    });
    if (this.onChange) this.onChange(this.state);

    try {
      const response = await bitgetService.placeFuturesOrder(symbol, side, size, orderType, price, tradeSide);
      if (response) {
        this.state.logs.unshift({
          id: ++this.logsCount,
          timestamp: new Date().toLocaleTimeString(),
          text: `✅ Order Placed: Successfully submitted order. ID: ${response.orderId || 'N/A'}`
        });
        // Immediately sync with Bitget
        await this.syncWithRealBitget();
        await this.syncFillsBackground();
      } else {
        this.state.logs.unshift({
          id: ++this.logsCount,
          timestamp: new Date().toLocaleTimeString(),
          text: `❌ Order Failed: Check API call logs for details or check if parameters are valid.`
        });
      }
    } catch (err) {
      this.state.logs.unshift({
        id: ++this.logsCount,
        timestamp: new Date().toLocaleTimeString(),
        text: `❌ Order Error: ${err.message}`
      });
    }
    if (this.onChange) this.onChange(this.state);
  }

  async cancelOrder(symbol, orderId) {
    this.state.logs.unshift({
      id: ++this.logsCount,
      timestamp: new Date().toLocaleTimeString(),
      text: `📤 Sending Cancel Request for Order ${orderId}...`
    });
    if (this.onChange) this.onChange(this.state);

    try {
      const response = await bitgetService.cancelFuturesOrder(symbol, orderId);
      if (response) {
        this.state.logs.unshift({
          id: ++this.logsCount,
          timestamp: new Date().toLocaleTimeString(),
          text: `✅ Order Cancelled: Order ${orderId} cancelled successfully.`
        });
        // Immediately sync with Bitget
        await this.syncWithRealBitget();
      } else {
        this.state.logs.unshift({
          id: ++this.logsCount,
          timestamp: new Date().toLocaleTimeString(),
          text: `❌ Cancel Failed: Check API call logs for details.`
        });
      }
    } catch (err) {
      this.state.logs.unshift({
        id: ++this.logsCount,
        timestamp: new Date().toLocaleTimeString(),
        text: `❌ Cancel Error: ${err.message}`
      });
    }
    if (this.onChange) this.onChange(this.state);
  }

  async syncFillsBackground() {
    try {
      const realFills = await bitgetService.getRecentFills();
      if (realFills && realFills.length > 0) {
        const existingIds = new Set(this.state.trades.map(t => t.id));
        const newFills = realFills.filter(t => !existingIds.has(t.id));
        if (newFills.length > 0) {
          this.state.trades = realFills;
          newFills.forEach(fill => {
            this.state.logs.unshift({
              id: ++this.logsCount,
              timestamp: new Date().toLocaleTimeString(),
              text: `🛒 Real Trade executed: Filled ${fill.type} on ${fill.pair} @ ${fill.price}.`
            });
          });
        }
      }
    } catch (err) {
      console.warn("Bitget fills sync failed: ", err.message);
    }
  }

  async syncWhalesFromBitget() {
    try {
      const trades = await bitgetService.getRecentMarketTrades('BTCUSDT');
      if (trades && trades.length > 0) {
        // Filter trades for whale size. e.g. size >= 0.15 BTC (~$10k usd)
        const whaleTrades = trades
          .filter(t => parseFloat(t.size) >= 0.15)
          .map(t => {
            const sizeVal = parseFloat(t.size);
            const priceVal = parseFloat(t.price);
            const valueUsdt = sizeVal * priceVal;
            const sideLabel = t.side === 'buy' || t.side === 'Buy' ? 'Buy' : 'Sell';
            
            // Format time nicely
            const date = new Date(parseInt(t.ts));
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            return {
              id: t.tradeId || `bitget-trade-${t.ts}-${Math.random()}`,
              time: timeStr,
              wallet: `Whale-${t.tradeId ? t.tradeId.slice(-6) : 'Trader'}`,
              amount: `${sizeVal.toFixed(3)} BTC`,
              destination: `Bitget ($${valueUsdt.toLocaleString(undefined, { maximumFractionDigits: 0 })})`,
              type: sideLabel
            };
          });
          
        if (whaleTrades.length > 0) {
          this.state.whaleAlerts = whaleTrades.slice(0, 5);
        }
      }
    } catch (err) {
      console.warn("Failed to fetch real whale trades from Bitget: ", err.message);
    }
  }

  start() {
    this.initializeKiyotaka();
    this.syncWhalesFromBitget();
    this.intervalId = setInterval(() => {
      this.tick();
    }, 3000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  async tick() {
    this.tickCount++;

    // 1. Fetch Live Prices from Bitget (every tick, i.e., 3s)
    let newPrices = { ...this.state.prices };
    try {
      const livePrices = await bitgetService.getLivePrices();
      if (livePrices && livePrices.BTC > 0) {
        newPrices = livePrices;
      }
    } catch (e) {
      console.warn("Failed to fetch live prices in tick:", e.message);
    }

    // 2. Periodic Background Syncing with Bitget / Kiyotaka
    if (this.useRealBitget) {
      // Sync Positions & Balance every 6s (2 ticks)
      if (this.tickCount % 2 === 0) {
        await this.syncWithRealBitget();
      }
      // Sync Fills every 15s (5 ticks)
      if (this.tickCount % 5 === 0) {
        await this.syncFillsBackground();
      }
    } else {
      // If we are not using real Bitget, display warning log periodically
      if (this.tickCount % 5 === 0) {
        this.state.logs.unshift({
          id: ++this.logsCount,
          timestamp: new Date().toLocaleTimeString(),
          text: "⚠️ Bitget Demo credentials invalid or missing. Showing empty live state."
        });
      }
    }

    if (this.tickCount % 5 === 0) {
      await this.syncWhalesFromBitget();
    }

    if (this.tickCount % 10 === 0) {
      await this.updateKiyotakaBackground();
    }

    // 3. Update Positions P&L with latest prices
    let unrealizedPnl = 0;
    const newPositions = this.state.positions.map(pos => {
      let currentPrice = newPrices.BTC;
      if (pos.pair.startsWith('ETH')) currentPrice = newPrices.ETH;
      if (pos.pair.startsWith('SOL')) currentPrice = newPrices.SOL;

      let pnl = pos.pnl; // Default to existing P&L
      if (pos.entryPrice > 0) {
        if (pos.type === 'Long') {
          pnl = (currentPrice - pos.entryPrice) * pos.size;
        } else {
          pnl = (pos.entryPrice - currentPrice) * pos.size;
        }
      }
      unrealizedPnl += pnl;

      return {
        ...pos,
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        pnl: parseFloat(pnl.toFixed(2))
      };
    });

    let currentNav = this.state.balance;

    // 4. Update NAV History & BTC Price History
    let newNavHistory = [...this.state.navHistory];
    let newBtcHistory = this.state.btcHistory ? [...this.state.btcHistory] : [];
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (currentNav > 0) {
      if (Math.random() > 0.8) {
        newNavHistory.push({ time: nowStr, nav: currentNav });
        if (newNavHistory.length > 15) newNavHistory.shift();
      } else {
        if (newNavHistory.length > 0) {
          newNavHistory[newNavHistory.length - 1] = {
            ...newNavHistory[newNavHistory.length - 1],
            nav: currentNav
          };
        }
      }
    }

    if (newPrices.BTC > 0) {
      if (Math.random() > 0.8) {
        newBtcHistory.push({ time: nowStr, price: newPrices.BTC });
        if (newBtcHistory.length > 15) newBtcHistory.shift();
      } else {
        if (newBtcHistory.length > 0) {
          newBtcHistory[newBtcHistory.length - 1] = {
            ...newBtcHistory[newBtcHistory.length - 1],
            price: newPrices.BTC
          };
        }
      }
    }

    // 5. Calculate Risk Score based on real positions
    const marginUsed = this.state.marginUsed;
    const exposureRatio = currentNav > 0 ? (marginUsed / currentNav) * 100 : 0;
    const avgLeverage = newPositions.length > 0 
      ? newPositions.reduce((sum, p) => sum + p.leverage, 0) / newPositions.length 
      : 0;
    
    const peakNav = Math.max(...newNavHistory.map(h => h.nav), 0);
    const drawdown = (peakNav > currentNav && peakNav > 0) ? ((peakNav - currentNav) / peakNav) * 100 : 0;

    let computedRisk = Math.round((avgLeverage * 2.5) + (exposureRatio * 0.8) + (drawdown * 5));
    if (computedRisk > 100) computedRisk = 100;
    if (computedRisk < 5 && newPositions.length > 0) computedRisk = 5;
    if (newPositions.length === 0) computedRisk = 0; // 0 risk if no positions

    // 6. Whale Alert and Fear & Greed updates (only using live values from Kiyotaka)
    let newLogs = [...this.state.logs];
    let newWhaleAlerts = [...this.state.whaleAlerts];
    let newFearGreed = this.state.fearGreed;

    // Standard AI Analyst Report / Autonomous updates via Gemini API if key is present
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const interval = this.state.agentParams?.decisionInterval || 5;
    const isGeminiTick = geminiKey && (this.tickCount % interval === 0);
    const shouldUpdateAnalyst = this.state.agentParams?.isAutonomous || (this.tickCount % 10 === 0);

    if (shouldUpdateAnalyst) {
      const currentPayload = {
        prices: newPrices,
        positions: newPositions,
        balance: currentNav,
        marginUsed: this.state.marginUsed,
        fearGreed: newFearGreed,
        technicalSummary: this.state.technicalSummary,
        whaleAlerts: newWhaleAlerts,
        agentParams: this.state.agentParams
      };

      if (isGeminiTick) {
        try {
          const report = await geminiService.generateMarketAnalysis(currentPayload);
          if (report) {
            this.state.analystReport = {
              ...report,
              timestamp: new Date().toLocaleTimeString()
            };
            newLogs.unshift({
              id: ++this.logsCount,
              timestamp: new Date().toLocaleTimeString(),
              text: `🤖 Kazua AI [Analyst]: ${report.summary}`
            });
          }
        } catch (e) {
          console.warn("Failed to generate dynamic analysis from Gemini:", e.message);
        }
      } else {
        // Fallback: generate mock analyst report if offline or off-beat tick
        const isAnalystLogTick = this.state.agentParams?.isAutonomous || (this.tickCount % 15 === 0);
        if (isAnalystLogTick) {
          const mockReport = generateMockAnalystReport(newPrices, newPositions, currentNav, this.state.marginUsed, newFearGreed, this.state.technicalSummary, newWhaleAlerts, this.state.agentParams);
          this.state.analystReport = mockReport;
          newLogs.unshift({
            id: ++this.logsCount,
            timestamp: new Date().toLocaleTimeString(),
            text: `🤖 Kazua AI [Analyst]: ${mockReport.summary}`
          });
        }
      }
    }

    if (newLogs.length > 50) newLogs.pop();

    // 7. Update State and Trigger Callback
    this.state = {
      ...this.state,
      prices: newPrices,
      positions: newPositions,
      balance: currentNav,
      marginUsed: parseFloat(marginUsed.toFixed(2)),
      logs: newLogs,
      navHistory: newNavHistory,
      btcHistory: newBtcHistory,
      riskScore: computedRisk,
      fearGreed: newFearGreed,
      whaleAlerts: newWhaleAlerts
    };
  }

  async triggerManualAnalysis() {
    this.state.logs.unshift({
      id: ++this.logsCount,
      timestamp: new Date().toLocaleTimeString(),
      text: "🤖 Kazua AI: Manually triggering market analyst query..."
    });
    if (this.onChange) this.onChange(this.state);

    const currentPayload = {
      prices: this.state.prices,
      positions: this.state.positions,
      balance: this.state.balance,
      marginUsed: this.state.marginUsed,
      fearGreed: this.state.fearGreed,
      technicalSummary: this.state.technicalSummary,
      whaleAlerts: this.state.whaleAlerts,
      agentParams: this.state.agentParams
    };

    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const report = await geminiService.generateMarketAnalysis(currentPayload);
        if (report) {
          this.state.analystReport = {
            ...report,
            timestamp: new Date().toLocaleTimeString()
          };
          this.state.logs.unshift({
            id: ++this.logsCount,
            timestamp: new Date().toLocaleTimeString(),
            text: `🤖 Kazua AI [Analyst]: ${report.summary}`
          });
        }
      } catch (e) {
        console.warn("Manual analysis query failed:", e.message);
      }
    } else {
      const mockReport = generateMockAnalystReport(this.state.prices, this.state.positions, this.state.balance, this.state.marginUsed, this.state.fearGreed, this.state.technicalSummary, this.state.whaleAlerts, this.state.agentParams);
      this.state.analystReport = mockReport;
      this.state.logs.unshift({
        id: ++this.logsCount,
        timestamp: new Date().toLocaleTimeString(),
        text: `🤖 Kazua AI [Analyst]: ${mockReport.summary}`
      });
    }

    if (this.onChange) this.onChange(this.state);
  }
}
