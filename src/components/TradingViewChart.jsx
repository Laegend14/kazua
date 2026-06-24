import React, { useEffect, useRef } from 'react';

let scriptLoadingPromise = null;

function loadTradingViewScript() {
  if (typeof window !== 'undefined' && window.TradingView) {
    return Promise.resolve();
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = 'tradingview-widget-loading-script';
    script.src = 'https://s3.tradingview.com/tv.js';
    script.type = 'text/javascript';
    script.onload = () => {
      resolve();
    };
    script.onerror = (err) => {
      scriptLoadingPromise = null;
      reject(err);
    };
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

export default function TradingViewChart({ 
  symbol = 'BINANCE:BTCUSDT', 
  height = '100%', 
  theme = 'dark',
  interval = '60',
  autosize = true
}) {
  const containerId = useRef(`tv-chart-${Math.random().toString(36).substring(2, 9)}`);
  const widgetRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    loadTradingViewScript()
      .then(() => {
        if (!isMounted || !window.TradingView) return;

        // Clean up previous widget container contents if any
        const container = document.getElementById(containerId.current);
        if (container) {
          container.innerHTML = '';
        }

        widgetRef.current = new window.TradingView.widget({
          autosize: autosize,
          height: height,
          symbol: symbol,
          interval: interval,
          timezone: 'Etc/UTC',
          theme: theme,
          style: '1', // Candlesticks
          locale: 'en',
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: containerId.current,
          studies: [
            'RSI@tv-basicstudies',
            'MASimple@tv-basicstudies'
          ],
          show_popup_button: true,
          popup_width: '1000',
          popup_height: '650',
          // Premium theme matching: dark mode purple/blue accents
          loading_screen: { backgroundColor: '#0d0d1e' },
          overrides: {
            "paneProperties.background": "#0d0d1e",
            "paneProperties.vertGridProperties.color": "rgba(255, 255, 255, 0.03)",
            "paneProperties.horzGridProperties.color": "rgba(255, 255, 255, 0.03)",
            "symbolWatermarkProperties.transparency": 90,
            "scalesProperties.textColor": "#9ca3af"
          }
        });
      })
      .catch((err) => {
        console.error('Failed to load TradingView widget:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [symbol, height, theme, interval, autosize]);

  return (
    <div 
      className="tradingview-widget-container" 
      style={{ 
        width: '100%', 
        height: height === '100%' ? '100%' : `${height}px`,
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--glass-border)',
        background: '#0d0d1e'
      }}
    >
      <div id={containerId.current} style={{ width: '100%', height: '100%' }} />
    </div>
  );
}
