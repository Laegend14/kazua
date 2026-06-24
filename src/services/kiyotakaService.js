// Kiyotaka Data API Service
// Fetches real market and sentiment data from api.kiyotaka.ai

const API_KEY = import.meta.env.VITE_KIYOTAKA_API_KEY;
const BASE_URL = '/api/kiyotaka/v1';

async function kiyotakaFetch(endpoint) {
  if (!API_KEY) {
    console.warn("Kiyotaka API key not found in environment variables.");
    return null;
  }
  
  const startTime = Date.now();
  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      headers: {
        'X-Kiyotaka-Key': API_KEY,
        'Accept': 'application/json'
      }
    });
    
    const latency = Date.now() - startTime;
    window.dispatchEvent(new CustomEvent('api-log', {
      detail: {
        id: `kiyo-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        api: 'Kiyotaka',
        method: 'GET',
        endpoint: '/' + endpoint.split('?')[0],
        status: response.status,
        latency: `${latency}ms`
      }
    }));

    if (!response.ok) {
      throw new Error(`Kiyotaka API returned status ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    const latency = Date.now() - startTime;
    window.dispatchEvent(new CustomEvent('api-log', {
      detail: {
        id: `kiyo-err-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        api: 'Kiyotaka',
        method: 'GET',
        endpoint: '/' + endpoint.split('?')[0],
        status: 'Failed',
        latency: `${latency}ms`
      }
    }));
    console.error("Failed to fetch from Kiyotaka API, falling back to simulation:", error.message);
    return null;
  }
}

export const kiyotakaService = {
  // Fetch BTC candles for the NAV/Equity line chart
  async getBtcPriceHistory() {
    const now = Math.floor(Date.now() / 1000);
    const sevenDaysAgo = now - (86400 * 7);
    
    // type=TRADE_SIDE_AGNOSTIC_AGG for standard candles
    const endpoint = `points?type=TRADE_SIDE_AGNOSTIC_AGG&exchange=BINANCE_FUTURES&rawSymbol=BTCUSDT&interval=HOUR&from=${sevenDaysAgo}&period=3600`;
    const data = await kiyotakaFetch(endpoint);
    
    if (!data || !data.points) return null;
    
    // Parse into chart-friendly format
    return data.points.map(pt => ({
      time: new Date(pt.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      nav: pt.close || pt.price // Map BTC price as the baseline NAV
    }));
  },

  // Fetch real BTC funding rates to feed the sentiment metrics
  async getBtcFundingRate() {
    const now = Math.floor(Date.now() / 1000);
    const oneDayAgo = now - 86400;
    
    const endpoint = `points?type=FUNDING_RATE_AGG&exchange=BINANCE_FUTURES&rawSymbol=BTCUSDT&interval=HOUR&from=${oneDayAgo}&period=3600`;
    const data = await kiyotakaFetch(endpoint);
    
    if (!data || !data.points || data.points.length === 0) return null;
    
    // Get the latest funding rate point
    const latest = data.points[data.points.length - 1];
    return {
      rate: latest.fundingRate || latest.value || 0.0001,
      predictedRate: latest.predictedFundingRate || 0.0001
    };
  },

  // Fetch recent liquidation events to feed the Whale / Liquidation Alerts list
  async getRecentLiquidations() {
    const now = Math.floor(Date.now() / 1000);
    const oneDayAgo = now - 86400;
    
    // Using HYPERLIQUID_LIQUIDATION_AGG for clustered liquidations
    const endpoint = `points?type=LIQUIDATION_AGG&exchange=BINANCE_FUTURES&coin=BTC&interval=HOUR&from=${oneDayAgo}&period=3600`;
    const data = await kiyotakaFetch(endpoint);
    
    if (!data || !data.points) return null;
    
    // Map points to WhaleAlert structures
    return data.points
      .filter(pt => (pt.buyVolume || pt.sellVolume || pt.volume) > 0)
      .slice(-5) // Take last 5
      .map((pt, index) => {
        const isBuy = pt.buyVolume > pt.sellVolume;
        const volume = pt.buyVolume || pt.sellVolume || pt.volume || 0;
        return {
          id: `kiyo-liq-${index}-${pt.timestamp}`,
          time: new Date(pt.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          wallet: `Liquidator-${isBuy ? 'Long' : 'Short'}`,
          amount: `${(volume / 67000).toFixed(3)} BTC`, // approximate BTC volume
          destination: 'Binance Liquidation',
          type: isBuy ? 'Deposit' : 'Withdrawal' // visual matching
        };
      });
  }
};
