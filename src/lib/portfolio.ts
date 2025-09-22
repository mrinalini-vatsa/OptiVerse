export interface Asset {
  symbol: string;
  name: string;
  prices: number[];
  returns: number[];
  weight?: number;
}

export interface PortfolioMetrics {
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  beta: number;
  var95: number;
  maxDrawdown: number;
  weights: number[];
}

export interface EfficientFrontierPoint {
  return: number;
  volatility: number;
  sharpeRatio: number;
  weights: number[];
}

// Generate realistic historical price data for demonstration
export const generateMockPriceData = (initialPrice: number, days: number = 252): number[] => {
  const prices = [initialPrice];
  
  for (let i = 1; i < days; i++) {
    // Random walk with drift
    const drift = 0.0004; // ~10% annual return
    const volatility = 0.015; // ~24% annual volatility
    const randomShock = (Math.random() - 0.5) * 2 * volatility;
    const nextPrice = prices[i - 1] * (1 + drift + randomShock);
    prices.push(Math.max(nextPrice, 0.01)); // Prevent negative prices
  }
  
  return prices;
};

// Calculate daily returns from price data
export const calculateReturns = (prices: number[]): number[] => {
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }
  return returns;
};

// Calculate covariance matrix
export const calculateCovarianceMatrix = (returns: number[][]): number[][] => {
  const n = returns.length;
  const m = returns[0].length;
  const covMatrix: number[][] = [];
  
  // Calculate means
  const means = returns.map(assetReturns => 
    assetReturns.reduce((sum, ret) => sum + ret, 0) / assetReturns.length
  );
  
  for (let i = 0; i < n; i++) {
    covMatrix[i] = [];
    for (let j = 0; j < n; j++) {
      let covariance = 0;
      for (let k = 0; k < m; k++) {
        covariance += (returns[i][k] - means[i]) * (returns[j][k] - means[j]);
      }
      covMatrix[i][j] = covariance / (m - 1) * 252; // Annualized
    }
  }
  
  return covMatrix;
};

// Calculate portfolio metrics
export const calculatePortfolioMetrics = (
  assets: Asset[],
  weights: number[],
  marketReturns: number[]
): PortfolioMetrics => {
  const returns = assets.map(asset => asset.returns);
  const meanReturns = returns.map(assetReturns => 
    assetReturns.reduce((sum, ret) => sum + ret, 0) / assetReturns.length * 252
  );
  
  const covMatrix = calculateCovarianceMatrix(returns);
  
  // Portfolio expected return
  const expectedReturn = weights.reduce((sum, weight, i) => sum + weight * meanReturns[i], 0);
  
  // Portfolio volatility
  let portfolioVariance = 0;
  for (let i = 0; i < weights.length; i++) {
    for (let j = 0; j < weights.length; j++) {
      portfolioVariance += weights[i] * weights[j] * covMatrix[i][j];
    }
  }
  const volatility = Math.sqrt(portfolioVariance);
  
  // Sharpe ratio (assuming 2% risk-free rate)
  const riskFreeRate = 0.02;
  const sharpeRatio = (expectedReturn - riskFreeRate) / volatility;
  
  // Beta calculation vs market
  const portfolioReturns = calculatePortfolioReturns(returns, weights);
  const beta = calculateBeta(portfolioReturns, marketReturns);
  
  // Value at Risk (95% confidence)
  const var95 = -1.645 * volatility / Math.sqrt(252); // Daily VaR
  
  // Maximum drawdown
  const maxDrawdown = calculateMaxDrawdown(assets, weights);
  
  return {
    expectedReturn,
    volatility,
    sharpeRatio,
    beta,
    var95,
    maxDrawdown,
    weights
  };
};

// Calculate portfolio returns given asset returns and weights
const calculatePortfolioReturns = (returns: number[][], weights: number[]): number[] => {
  const portfolioReturns = [];
  const numPeriods = returns[0].length;
  
  for (let i = 0; i < numPeriods; i++) {
    let periodReturn = 0;
    for (let j = 0; j < weights.length; j++) {
      periodReturn += weights[j] * returns[j][i];
    }
    portfolioReturns.push(periodReturn);
  }
  
  return portfolioReturns;
};

// Calculate beta vs market
const calculateBeta = (portfolioReturns: number[], marketReturns: number[]): number => {
  const portfolioMean = portfolioReturns.reduce((sum, ret) => sum + ret, 0) / portfolioReturns.length;
  const marketMean = marketReturns.reduce((sum, ret) => sum + ret, 0) / marketReturns.length;
  
  let covariance = 0;
  let marketVariance = 0;
  
  for (let i = 0; i < portfolioReturns.length; i++) {
    const portfolioDeviation = portfolioReturns[i] - portfolioMean;
    const marketDeviation = marketReturns[i] - marketMean;
    
    covariance += portfolioDeviation * marketDeviation;
    marketVariance += marketDeviation * marketDeviation;
  }
  
  return covariance / marketVariance;
};

// Calculate maximum drawdown
const calculateMaxDrawdown = (assets: Asset[], weights: number[]): number => {
  // Calculate portfolio value over time
  const portfolioValues = [];
  const numPeriods = assets[0].prices.length;
  
  for (let i = 0; i < numPeriods; i++) {
    let portfolioValue = 0;
    for (let j = 0; j < assets.length; j++) {
      portfolioValue += weights[j] * assets[j].prices[i];
    }
    portfolioValues.push(portfolioValue);
  }
  
  let maxDrawdown = 0;
  let peak = portfolioValues[0];
  
  for (let i = 1; i < portfolioValues.length; i++) {
    if (portfolioValues[i] > peak) {
      peak = portfolioValues[i];
    }
    const drawdown = (peak - portfolioValues[i]) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  return maxDrawdown;
};

// Optimize portfolio for maximum Sharpe ratio using simplified optimization
export const optimizePortfolio = (assets: Asset[]): PortfolioMetrics => {
  const numAssets = assets.length;
  let bestSharpe = -Infinity;
  let bestWeights: number[] = [];
  
  // Simplified optimization: try many random weight combinations
  for (let iteration = 0; iteration < 10000; iteration++) {
    // Generate random weights
    const weights = Array.from({ length: numAssets }, () => Math.random());
    const sum = weights.reduce((acc, w) => acc + w, 0);
    const normalizedWeights = weights.map(w => w / sum);
    
    const metrics = calculatePortfolioMetrics(assets, normalizedWeights, assets[0].returns);
    
    if (metrics.sharpeRatio > bestSharpe) {
      bestSharpe = metrics.sharpeRatio;
      bestWeights = normalizedWeights;
    }
  }
  
  return calculatePortfolioMetrics(assets, bestWeights, assets[0].returns);
};

// Generate efficient frontier
export const generateEfficientFrontier = (assets: Asset[], numPoints: number = 50): EfficientFrontierPoint[] => {
  const frontierPoints: EfficientFrontierPoint[] = [];
  
  // Generate points along the efficient frontier
  for (let i = 0; i < numPoints; i++) {
    const targetReturn = 0.05 + (i / (numPoints - 1)) * 0.25; // 5% to 30% target returns
    
    // Find optimal weights for target return (simplified)
    let bestVolatility = Infinity;
    let bestWeights: number[] = [];
    
    for (let iteration = 0; iteration < 1000; iteration++) {
      const weights = Array.from({ length: assets.length }, () => Math.random());
      const sum = weights.reduce((acc, w) => acc + w, 0);
      const normalizedWeights = weights.map(w => w / sum);
      
      const metrics = calculatePortfolioMetrics(assets, normalizedWeights, assets[0].returns);
      
      // Check if return is close to target (within 1%)
      if (Math.abs(metrics.expectedReturn - targetReturn) < 0.01 && metrics.volatility < bestVolatility) {
        bestVolatility = metrics.volatility;
        bestWeights = normalizedWeights;
      }
    }
    
    if (bestWeights.length > 0) {
      const metrics = calculatePortfolioMetrics(assets, bestWeights, assets[0].returns);
      frontierPoints.push({
        return: metrics.expectedReturn,
        volatility: metrics.volatility,
        sharpeRatio: metrics.sharpeRatio,
        weights: bestWeights
      });
    }
  }
  
  return frontierPoints.sort((a, b) => a.volatility - b.volatility);
};

// Default asset universe for demonstration
export const createDefaultAssets = (): Asset[] => {
  const assetData = [
    { symbol: 'SPY', name: 'S&P 500 ETF', basePrice: 450, volatility: 0.015 },
    { symbol: 'QQQ', name: 'Nasdaq ETF', basePrice: 380, volatility: 0.020 },
    { symbol: 'TLT', name: 'Long-Term Treasury', basePrice: 100, volatility: 0.012 },
    { symbol: 'GLD', name: 'Gold ETF', basePrice: 180, volatility: 0.018 },
    { symbol: 'EEM', name: 'Emerging Markets', basePrice: 50, volatility: 0.022 },
    { symbol: 'VNQ', name: 'Real Estate ETF', basePrice: 90, volatility: 0.016 },
    { symbol: 'EFA', name: 'EAFE ETF', basePrice: 75, volatility: 0.017 },
    { symbol: 'VTI', name: 'Total Stock Market', basePrice: 230, volatility: 0.015 }
  ];
  
  return assetData.map(asset => {
    const prices = generateMockPriceData(asset.basePrice, 252);
    const returns = calculateReturns(prices);
    
    return {
      symbol: asset.symbol,
      name: asset.name,
      prices,
      returns
    };
  });
};
