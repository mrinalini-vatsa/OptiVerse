import { Card } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Asset } from '@/lib/portfolio';
import { PieChartIcon, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface AllocationChartProps {
  assets: Asset[];
  weights: number[];
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
];

export const AllocationChart = ({ assets, weights }: AllocationChartProps) => {
  const [viewType, setViewType] = useState<'pie' | 'bar'>('pie');

  const allocationData = assets.map((asset, index) => ({
    name: asset.symbol,
    fullName: asset.name,
    weight: weights[index],
    percentage: weights[index] * 100,
    color: COLORS[index % COLORS.length]
  })).filter(item => item.weight > 0.001) // Filter out very small allocations
     .sort((a, b) => b.weight - a.weight); // Sort by weight descending

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <div className="space-y-1">
            <div className="font-semibold">{data.name}</div>
            <div className="text-sm text-muted-foreground">{data.fullName}</div>
            <div className="text-sm">
              <span className="font-semibold text-primary">{data.percentage.toFixed(2)}%</span>
              <span className="text-muted-foreground"> allocation</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderLabel = (entry: any) => {
    if (entry.percentage < 3) return ''; // Don't show labels for very small slices
    return `${entry.name}\n${entry.percentage.toFixed(1)}%`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <PieChartIcon className="h-5 w-5 text-primary" />
          <span>Portfolio Allocation</span>
        </h3>
        
        <div className="flex space-x-2">
          <Button
            variant={viewType === 'pie' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('pie')}
          >
            <PieChartIcon className="h-4 w-4 mr-2" />
            Pie
          </Button>
          <Button
            variant={viewType === 'bar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('bar')}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Bar
          </Button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        {viewType === 'pie' ? (
          <PieChart>
            <Pie
              data={allocationData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="percentage"
              stroke="hsl(var(--background))"
              strokeWidth={2}
            >
              {allocationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        ) : (
          <BarChart data={allocationData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis 
              tickFormatter={(value) => `${value.toFixed(1)}%`}
              label={{ value: 'Allocation %', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
              {allocationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>

      {/* Allocation Table */}
      <div className="mt-6 space-y-2">
        <h4 className="font-semibold text-sm text-muted-foreground">Portfolio Weights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {allocationData.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <div>
                  <div className="font-semibold text-sm">{item.name}</div>
                  <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {item.fullName}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-sm">{item.percentage.toFixed(2)}%</div>
                <div className="text-xs text-muted-foreground">
                  ${(10000 * item.weight / 100).toFixed(0)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 p-4 bg-muted/30 rounded-lg">
        <p className="text-sm text-muted-foreground">
          Allocation weights are optimized for maximum Sharpe ratio. Dollar amounts shown for a $10,000 portfolio.
          Diversification across {allocationData.length} assets reduces concentration risk.
        </p>
      </div>
    </Card>
  );
};
