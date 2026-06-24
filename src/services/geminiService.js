// Gemini API Service
// Calls the Gemini 1.5 Flash or Gemini 2.5 Pro API client-side via standard fetch.

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const geminiService = {
  /**
   * Generates a comprehensive market analysis report by ingesting live data 
   * derived from Kiyotaka and Bitget API integrations.
   * 
   * @param {Object} marketState Current state containing balances, prices, funding, liquidations, and settings
   */
  async generateMarketAnalysis(marketState) {
    if (!GEMINI_API_KEY) {
      console.warn("Gemini API key is not configured in .env file.");
      return null;
    }

    // Format current positions for context
    const posSummary = marketState.positions.length > 0
      ? marketState.positions.map(p => `${p.pair} ${p.type} x${p.leverage} (PnL: ${p.pnl} USDT, Margin: ${p.margin} USDT)`).join(', ')
      : 'None';
      
    // Format Kiyotaka on-chain liquidations and whale transfers
    const whaleSummary = marketState.whaleAlerts.length > 0
      ? marketState.whaleAlerts.slice(0, 3).map(w => `[${w.time}] ${w.amount} (${w.type}) via ${w.wallet} to ${w.destination}`).join(', ')
      : 'None';

    const maxLeverage = marketState.agentParams?.maxLeverage || 20;
    const stopLoss = marketState.agentParams?.stopLoss || 5;
    const takeProfit = marketState.agentParams?.takeProfit || 0.5;
    const riskThreshold = marketState.agentParams?.riskThreshold || 50;
    const aggressiveness = marketState.agentParams?.aggressiveness || 'standard';

    const prompt = `You are Kazua, an advanced AI Market Analyst. Your objective is to ingest real-time market intelligence from Kiyotaka (on-chain liquidation alerts, price walk histories, and funding rates) and Bitget (portfolio balances, active leverage metrics, and open positions) and write a comprehensive market analysis report.

User Steering Safeguards / Parameters:
- Max Leverage Tolerance: ${maxLeverage}x
- Risk Sensitivity Threshold: ${riskThreshold}%
- Target Profit Focus: ${takeProfit}%
- Volatility Stance: ${aggressiveness.toUpperCase()}
- Stop Loss Target: ${stopLoss}%

Current Bitget Account & Market State:
- Ticker Price: BTC $${marketState.prices.BTC}, ETH $${marketState.prices.ETH}, SOL $${marketState.prices.SOL}
- Bitget Equity: $${marketState.balance.toFixed(2)} USDT
- Bitget Margin Utilized: $${marketState.marginUsed.toFixed(2)} USDT
- Open Positions: ${posSummary}

Current Kiyotaka On-Chain & Sentiment State:
- Fear & Greed Index: ${marketState.fearGreed}
- Technical Indicators: RSI=${marketState.technicalSummary?.rsi || 50}, MACD/Funding Rate=${marketState.technicalSummary?.macd || 'Neutral'}
- Recent Liquidations & Whale Alert Activity: ${whaleSummary}

Perform an institutional-grade analysis combining the on-chain pressure (Kiyotaka) and trading exposure (Bitget).

YOU MUST RESPOND ONLY WITH A VALID JSON OBJECT. Do not output any markdown formatting, code block markers, quotes, or pre-text/post-text.

JSON Response Schema:
{
  "summary": "A brief 10 to 15 word headline summary of the analysis for a terminal log.",
  "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "kiyotakaInsight": "One sentence analyzing the funding rate, RSI, and liquidation trends from Kiyotaka.",
  "bitgetInsight": "One sentence evaluating the account balance, margin utilization, and risk of active positions on Bitget.",
  "overallAnalysis": "A detailed paragraph (approx 80-120 words) analyzing market structure, indicators, and macro trends.",
  "recommendation": "Strategic guidance for manual execution (e.g., 'Consolidate long positions due to high funding', 'Hedge BTC exposure', or 'Maintain cash waiting for RSI reset')."
}`;

    const startTime = Date.now();
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const latency = Date.now() - startTime;
      
      window.dispatchEvent(new CustomEvent('api-log', {
        detail: {
          id: `gemini-analyst-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toLocaleTimeString(),
          api: 'Gemini',
          method: 'POST',
          endpoint: '/v1beta/models/gemini-2.5-pro:generateContent (Analyst)',
          status: response.status,
          latency: `${latency}ms`
        }
      }));

      const data = await response.json();
      
      if (data && data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
        let text = data.candidates[0].content.parts[0].text.trim();
        
        // Clean markdown JSON wrapper if present
        if (text.startsWith('```')) {
          text = text.replace(/^```json\s*/, '').replace(/```$/, '').trim();
        }
        
        try {
          const analysis = JSON.parse(text);
          return analysis;
        } catch (e) {
          console.error("Failed to parse Gemini Analyst JSON:", text);
          return {
            summary: "Failed to parse analyst report format. Raw text generated.",
            sentiment: "NEUTRAL",
            riskLevel: "MEDIUM",
            kiyotakaInsight: "Data parse failed.",
            bitgetInsight: "Data parse failed.",
            overallAnalysis: "The market analyst engine experienced a JSON parsing error when processing the LLM response.",
            recommendation: "Review parameters or try manual request trigger."
          };
        }
      } else {
        if (data && data.error) {
          console.error("Gemini Analyst API Error Detail:", data.error.message || data.error);
        }
        return null;
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      window.dispatchEvent(new CustomEvent('api-log', {
        detail: {
          id: `gemini-analyst-err-${Date.now()}-${Math.random()}`,
          timestamp: new Date().toLocaleTimeString(),
          api: 'Gemini',
          method: 'POST',
          endpoint: '/v1beta/models/gemini-2.5-pro:generateContent (Analyst)',
          status: 'Failed',
          latency: `${latency}ms`
        }
      }));
      console.error("Gemini Analyst API call failed:", error);
      return null;
    }
  }
};

