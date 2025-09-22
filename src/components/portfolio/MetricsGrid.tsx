import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PortfolioMetrics } from '@/lib/portfolio';
import { TrendingUp, TrendingDown, Shield, AlertTriangle, Target, Activity } from 'lucide-react';

interface MetricsGridProps {
  metrics: PortfolioMetrics;
  riskTolerance: 'low' | 'medium' | 'high';
}

export const MetricsGrid = ({ metrics, riskTolerance }: MetricsGridProps) => {
  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;
  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;

  const getReturnStatus = (ret: number) => {
    if (ret > 0.12) return { color: 'success', icon: TrendingUp };
    if (ret > 0.08) return { color: 'warning', icon: TrendingUp };
    return { color: 'destructive', icon: TrendingDown };
  };

  const getRiskStatus = (vol: number, tolerance: string) => {
    const thresholds = { low: 0.12, medium: 0.18, high: 0.25 };
    const threshold = thresholds[tolerance as keyof typeof thresholds];
    
    if (vol <= threshold) return { color: 'success', text: 'Appropriate' };
    if (vol <= threshold * 1.2) return { color: 'warning', text: 'Elevated' };
    return { color: 'destructive', text: 'High' };
  };

  const returnStatus = getReturnStatus(metrics.expectedReturn);
  const riskStatus = getRiskStatus(metrics.volatility, riskTolerance);

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary" />
          <span>Portfolio Performance</span>
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Expected Annual Return</span>
            <div className="flex items-center space-x-2">
              <returnStatus.icon className={`h-4 w-4 text-${returnStatus.color}`} />
              <span className={`font-semibold text-${returnStatus.color}`}>
                {formatPercentage(metrics.expectedReturn)}
              </span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Annual Volatility</span>
            <div className="flex items-center space-x-2">
              <Badge variant={riskStatus.color === 'success' ? 'default' : 'destructive'} className="text-xs">
                {riskStatus.text}
              </Badge>
              <span className="font-semibold">{formatPercentage(metrics.volatility)}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Sharpe Ratio</span>
            <span className={`font-semibold ${metrics.sharpeRatio > 1 ? 'text-success' : metrics.sharpeRatio > 0.5 ? 'text-warning' : 'text-destructive'}`}>
              {metrics.sharpeRatio.toFixed(3)}
            </span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Shield className="h-5 w-5 text-primary" />
          <span>Risk Metrics</span>
        </h3>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Beta (vs Market)</span>
            <div className="flex items-center space-x-2">
              {metrics.beta > 1 ? (
                <AlertTriangle className="h-4 w-4 text-warning" />
              ) : (
                <Shield className="h-4 w-4 text-success" />
              )}
              <span className="font-semibold">{metrics.beta.toFixed(3)}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Value at Risk (95%)</span>
            <span className="font-semibold text-destructive">
              {formatPercentage(Math.abs(metrics.var95))}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Maximum Drawdown</span>
            <span className="font-semibold text-destructive">
              {formatPercentage(metrics.maxDrawdown)}
            </span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Activity className="h-5 w-5 text-primary" />
          <span>Risk Assessment</span>
        </h3>
        
        <div className="space-y-3">
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Risk-Return Profile</span>
              <Badge variant={metrics.sharpeRatio > 1 ? 'default' : 'secondary'}>
                {metrics.sharpeRatio > 1.5 ? 'Excellent' : 
                 metrics.sharpeRatio > 1 ? 'Good' : 
                 metrics.sharpeRatio > 0.5 ? 'Fair' : 'Poor'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.sharpeRatio > 1 
                ? 'Portfolio demonstrates strong risk-adjusted returns suitable for institutional investment.'
                : 'Portfolio may benefit from rebalancing to improve risk-adjusted performance.'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-primary/5 rounded text-center">
              <div className="font-semibold text-primary">Risk Level</div>
              <div className="capitalize">{riskTolerance}</div>
            </div>
            <div className="p-2 bg-success/5 rounded text-center">
              <div className="font-semibold text-success">Diversification</div>
              <div>{metrics.weights.filter(w => w > 0.05).length} Assets</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
