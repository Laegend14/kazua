// Bitget API Service
// Communicates with Bitget V2 endpoints via local dev proxy.
// Generates HMAC SHA256 signatures using standard Web Crypto API.

const API_KEY = import.meta.env.VITE_BITGET_API_KEY;
const SECRET_KEY = import.meta.env.VITE_BITGET_SECRET_KEY;
const PASSPHRASE = import.meta.env.VITE_BITGET_PASSPHRASE;

const PROXY_PREFIX = '/api/bitget';

// Browser-compatible HMAC-SHA256 signature generator using Web Crypto API
async function signHmacSha256(secret, message) {
  const encoder = new TextEncoder();
  const secretKeyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    secretKeyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await window.crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    messageData
  );

  // Convert ArrayBuffer to Base64
  const hashArray = new Uint8Array(signatureBuffer);
  let binary = '';
  for (let i = 0; i < hashArray.byteLength; i++) {
    binary += String.fromCharCode(hashArray[i]);
  }
  return window.btoa(binary);
}

async function bitgetFetch(method, requestPath, params = {}, bodyObject = null) {
  if (!API_KEY || !SECRET_KEY || !PASSPHRASE) {
    console.warn("Bitget API Credentials not fully configured in environment.");
    return null;
  }

  const queryParams = new URLSearchParams(params).toString();
  const queryString = queryParams ? `?${queryParams}` : '';
  
  const timestamp = Date.now().toString();
  const bodyString = bodyObject ? JSON.stringify(bodyObject) : '';
  const message = `${timestamp}${method.toUpperCase()}${requestPath}${queryString}${bodyString}`;
  
  const startTime = Date.now();
  try {
    const signature = await signHmacSha256(SECRET_KEY, message);

    const url = `${PROXY_PREFIX}${requestPath}${queryString}`;
    const headers = {
      'ACCESS-KEY': API_KEY,
      'ACCESS-SIGN': signature,
      'ACCESS-TIMESTAMP': timestamp,
      'ACCESS-PASSPHRASE': PASSPHRASE,
      'Content-Type': 'application/json',
      'paptrading': '1'
    };

    const fetchOptions = {
      method: method.toUpperCase(),
      headers
    };

    if (bodyObject) {
      fetchOptions.body = bodyString;
    }

    const response = await fetch(url, fetchOptions);
    const latency = Date.now() - startTime;
    
    // Dispatch log
    window.dispatchEvent(new CustomEvent('api-log', {
      detail: {
        id: `bitget-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        api: 'Bitget',
        method: method.toUpperCase(),
        endpoint: requestPath,
        status: response.status,
        latency: `${latency}ms`
      }
    }));

    const data = await response.json();
    
    if (data && data.code === '00000') {
      return data.data;
    } else {
      console.warn("Bitget API Response Error:", data?.msg || data?.code || data);
      return null;
    }
  } catch (error) {
    const latency = Date.now() - startTime;
    window.dispatchEvent(new CustomEvent('api-log', {
      detail: {
        id: `bitget-err-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        api: 'Bitget',
        method: method.toUpperCase(),
        endpoint: requestPath,
        status: 'Failed',
        latency: `${latency}ms`
      }
    }));
    console.error("Failed to query Bitget API, falling back:", error.message);
    return null;
  }
}

export const bitgetService = {
  // Fetch active futures positions
  async getFuturesPositions() {
    const requestPath = '/api/v3/position/current-position';
    const params = { category: 'USDT-FUTURES' };
    
    const data = await bitgetFetch('GET', requestPath, params);
    if (!data) return [];
    
    const list = Array.isArray(data) ? data : (Array.isArray(data.list) ? data.list : []);
    
    // Map Bitget position fields to our dashboard format
    return list.map((pos, idx) => {
      const type = (pos.posSide || pos.holdSide || 'long').toLowerCase() === 'long' ? 'Long' : 'Short';
      return {
        id: pos.positionId || `${pos.symbol}-${pos.posSide || pos.holdSide || idx}`,
        pair: pos.symbol, // e.g. BTCUSDT
        type: type,
        entryPrice: parseFloat(pos.avgPrice || pos.openPrice || 0),
        currentPrice: parseFloat(pos.markPrice || pos.marketPrice || pos.price || 0),
        size: parseFloat(pos.total || pos.positionBalance || pos.available || 0),
        leverage: parseInt(pos.leverage || 10),
        margin: parseFloat(pos.margin || pos.positionBalance || 0),
        pnl: parseFloat(pos.unrealisedPnl || pos.unrealizedPL || 0)
      };
    });
  },

  // Fetch futures account balances
  async getFuturesAccount() {
    const requestPath = '/api/v3/account/assets';
    const params = { category: 'USDT-FUTURES' };
    
    const data = await bitgetFetch('GET', requestPath, params);
    if (!data) return null;
    
    if (Array.isArray(data)) {
      // Direct array fallback
      let totalEquity = 0;
      let totalMargin = 0;
      data.forEach(acc => {
        totalEquity += parseFloat(acc.totalEq || acc.equity || acc.balance || 0);
        totalMargin += parseFloat(acc.frozen || acc.locked || acc.margin || 0);
      });
      return {
        equity: totalEquity,
        margin: totalMargin
      };
    } else {
      // UTA object format
      return {
        equity: parseFloat(data.accountEquity || data.usdtEquity || data.effEquity || 0),
        margin: parseFloat(data.imr || data.margin || 0)
      };
    }
  },

  // Fetch recent trade fills
  async getRecentFills() {
    const requestPath = '/api/v3/trade/fills';
    const params = { category: 'USDT-FUTURES', limit: '10' };
    
    const data = await bitgetFetch('GET', requestPath, params);
    if (!data) return [];
    
    const list = Array.isArray(data) ? data : (Array.isArray(data.list) ? data.list : []);

    // Map fields to our trade history format
    return list.map((fill, idx) => {
      const isBuy = fill.side === 'buy' || fill.side === 'Buy';
      const pnl = fill.pnl || fill.realizedPnl || fill.profit || null;
      return {
        id: fill.execId || fill.fillId || `bitget-fill-${idx}`,
        timestamp: new Date(parseInt(fill.cTime || fill.execTime || Date.now())).toLocaleTimeString(),
        pair: fill.symbol,
        type: isBuy ? 'Long' : 'Short',
        price: parseFloat(fill.execPrice || fill.price || 0),
        size: parseFloat(fill.execQty || fill.size || 0).toFixed(2),
        status: 'Filled',
        pnl: pnl ? `${parseFloat(pnl) >= 0 ? '+' : ''}${parseFloat(pnl).toFixed(2)} USDT` : '--'
      };
    });
  },

  // Fetch live market prices for BTC, ETH, and SOL in one call (keep using v2 mix tickers as it's public and robust)
  async getLivePrices() {
    const requestPath = '/api/v2/mix/market/tickers';
    const params = { productType: 'USDT-FUTURES' };
    
    const data = await bitgetFetch('GET', requestPath, params);
    if (!data || !Array.isArray(data)) return null;
    
    const prices = { BTC: 0, ETH: 0, SOL: 0 };
    data.forEach(t => {
      if (t.symbol === 'BTCUSDT') prices.BTC = parseFloat(t.lastPr || 0);
      if (t.symbol === 'ETHUSDT') prices.ETH = parseFloat(t.lastPr || 0);
      if (t.symbol === 'SOLUSDT') prices.SOL = parseFloat(t.lastPr || 0);
    });
    return prices;
  },

  // Fetch pending (open) futures orders
  async getPendingOrders() {
    const requestPath = '/api/v3/trade/unfilled-orders';
    const params = { category: 'USDT-FUTURES' };
    
    const data = await bitgetFetch('GET', requestPath, params);
    if (!data) return [];
    
    const list = Array.isArray(data) ? data : (Array.isArray(data.list) ? data.list : []);
    
    return list.map((ord, idx) => ({
      id: ord.orderId || `bitget-ord-${idx}`,
      symbol: ord.symbol,
      side: ord.side, // buy / sell
      tradeSide: ord.tradeSide || 'open', // open / close
      price: parseFloat(ord.price || 0),
      size: parseFloat(ord.qty || ord.size || 0),
      orderType: ord.orderType || ord.type || 'limit', // limit / market
      timestamp: new Date(parseInt(ord.cTime || Date.now())).toLocaleTimeString()
    }));
  },

  // Place a futures order
  async placeFuturesOrder(symbol, side, size, orderType, price = '', tradeSide = 'open') {
    const requestPath = '/api/v3/trade/place-order';
    
    // Map posSide for Hedge Mode (required by some V3 markets)
    let posSide = '';
    if (tradeSide === 'open') {
      posSide = side === 'buy' ? 'long' : 'short';
    } else if (tradeSide === 'close') {
      posSide = side === 'buy' ? 'short' : 'long';
    }

    const body = {
      symbol,
      category: 'USDT-FUTURES',
      marginCoin: 'USDT',
      side,
      orderType,
      qty: size.toString(),
      tradeSide,
      posSide
    };
    if (orderType === 'limit' && price) {
      body.price = price.toString();
    }
    return await bitgetFetch('POST', requestPath, {}, body);
  },

  // Cancel a pending futures order
  async cancelFuturesOrder(symbol, orderId) {
    const requestPath = '/api/v3/trade/cancel-order';
    const body = {
      symbol,
      category: 'USDT-FUTURES',
      orderId: orderId.toString()
    };
    return await bitgetFetch('POST', requestPath, {}, body);
  },

  // Fetch recent market fills (trades) for a symbol
  async getRecentMarketTrades(symbol) {
    const requestPath = '/api/v2/mix/market/fills';
    const params = { symbol, productType: 'USDT-FUTURES', limit: '100' };
    const data = await bitgetFetch('GET', requestPath, params);
    if (!data) return [];
    return data;
  }
};
