import { useState } from 'react';
import { Asset, createDefaultAssets } from '@/lib/portfolio';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { X, Plus, Building, TrendingUp, Shield, Globe, Zap } from 'lucide-react';

interface AssetSelectorProps {
  assets: Asset[];
  onAssetsChange: (assets: Asset[]) => void;
}

// Asset categories for better UX
const ASSET_CATEGORIES = {
  'equity': { icon: TrendingUp, label: 'Equity ETFs', color: 'chart-1' },
  'bond': { icon: Shield, label: 'Fixed Income', color: 'chart-2' },
  'commodity': { icon: Zap, label: 'Commodities', color: 'chart-3' },
  'international': { icon: Globe, label: 'International', color: 'chart-4' },
  'sector': { icon: Building, label: 'Sector ETFs', color: 'chart-5' }
};

// Predefined asset universe with categories
const ASSET_UNIVERSE = [
  { symbol: 'SPY', name: 'S&P 500 ETF', category: 'equity' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF', category: 'equity' },
  { symbol: 'VTI', name: 'Total Stock Market ETF', category: 'equity' },
  { symbol: 'IWM', name: 'Russell 2000 ETF', category: 'equity' },
  { symbol: 'TLT', name: 'Long-Term Treasury ETF', category: 'bond' },
  { symbol: 'IEF', name: 'Intermediate Treasury ETF', category: 'bond' },
  { symbol: 'LQD', name: 'Corporate Bond ETF', category: 'bond' },
  { symbol: 'HYG', name: 'High Yield Bond ETF', category: 'bond' },
  { symbol: 'GLD', name: 'Gold ETF', category: 'commodity' },
  { symbol: 'SLV', name: 'Silver ETF', category: 'commodity' },
  { symbol: 'USO', name: 'Oil ETF', category: 'commodity' },
  { symbol: 'EEM', name: 'Emerging Markets ETF', category: 'international' },
  { symbol: 'EFA', name: 'EAFE ETF', category: 'international' },
  { symbol: 'VNQ', name: 'Real Estate ETF', category: 'sector' },
  { symbol: 'XLF', name: 'Financial Sector ETF', category: 'sector' },
  { symbol: 'XLK', name: 'Technology Sector ETF', category: 'sector' },
];

export const AssetSelector = ({ assets, onAssetsChange }: AssetSelectorProps) => {
  const [customTicker, setCustomTicker] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const addAssetFromUniverse = (assetInfo: typeof ASSET_UNIVERSE[0]) => {
    if (assets.some(a => a.symbol === assetInfo.symbol)) return;
    
    // Create new asset with mock data
    const defaultAssets = createDefaultAssets();
    const template = defaultAssets[0]; // Use as template for price generation
    
    const newAsset: Asset = {
      symbol: assetInfo.symbol,
      name: assetInfo.name,
      prices: template.prices.map(p => p * (0.8 + Math.random() * 0.4)), // Vary prices
      returns: []
    };
    
    // Calculate returns
    newAsset.returns = newAsset.prices.slice(1).map((price, i) => 
      (price - newAsset.prices[i]) / newAsset.prices[i]
    );
    
    onAssetsChange([...assets, newAsset]);
  };

  const addCustomAsset = () => {
    if (!customTicker.trim() || assets.some(a => a.symbol === customTicker.toUpperCase())) return;
    
    const defaultAssets = createDefaultAssets();
    const template = defaultAssets[Math.floor(Math.random() * defaultAssets.length)];
    
    const newAsset: Asset = {
      symbol: customTicker.toUpperCase(),
      name: `${customTicker.toUpperCase()} - Custom Asset`,
      prices: template.prices.map(p => p * (0.5 + Math.random() * 1.5)),
      returns: []
    };
    
    newAsset.returns = newAsset.prices.slice(1).map((price, i) => 
      (price - newAsset.prices[i]) / newAsset.prices[i]
    );
    
    onAssetsChange([...assets, newAsset]);
    setCustomTicker('');
  };

  const removeAsset = (symbol: string) => {
    onAssetsChange(assets.filter(a => a.symbol !== symbol));
  };

  const filteredAssets = selectedCategory 
    ? ASSET_UNIVERSE.filter(a => a.category === selectedCategory)
    : ASSET_UNIVERSE;

  const availableAssets = filteredAssets.filter(a => 
    !assets.some(selected => selected.symbol === a.symbol)
  );

  return (
    <div className="space-y-4">
      {/* Selected Assets */}
      <div>
        <h4 className="text-sm font-medium mb-2">Selected Assets ({assets.length})</h4>
        <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-3 border border-border rounded-lg bg-muted/30">
          {assets.length === 0 ? (
            <span className="text-sm text-muted-foreground">No assets selected</span>
          ) : (
            assets.map(asset => (
              <Badge key={asset.symbol} variant="secondary" className="px-3 py-1">
                <span className="font-semibold">{asset.symbol}</span>
                <button
                  onClick={() => removeAsset(asset.symbol)}
                  className="ml-2 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div>
        <h4 className="text-sm font-medium mb-2">Asset Categories</h4>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            All Assets
          </Button>
          {Object.entries(ASSET_CATEGORIES).map(([key, category]) => {
            const Icon = category.icon;
            return (
              <Button
                key={key}
                variant={selectedCategory === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(key)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {category.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Available Assets */}
      <div>
        <h4 className="text-sm font-medium mb-2">Available Assets</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
          {availableAssets.map(asset => {
            const category = ASSET_CATEGORIES[asset.category as keyof typeof ASSET_CATEGORIES];
            const Icon = category.icon;
            
            return (
              <Button
                key={asset.symbol}
                variant="ghost"
                size="sm"
                onClick={() => addAssetFromUniverse(asset)}
                className="justify-start h-auto p-2 text-left"
              >
                <Icon className={`h-4 w-4 mr-2 text-${category.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{asset.symbol}</div>
                  <div className="text-xs text-muted-foreground truncate">{asset.name}</div>
                </div>
                <Plus className="h-4 w-4 ml-2 opacity-50" />
              </Button>
            );
          })}
        </div>
      </div>

      {/* Custom Asset Input */}
      <div>
        <h4 className="text-sm font-medium mb-2">Add Custom Asset</h4>
        <div className="flex space-x-2">
          <Input
            placeholder="Enter ticker symbol (e.g., AAPL)"
            value={customTicker}
            onChange={(e) => setCustomTicker(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addCustomAsset()}
            className="flex-1"
          />
          <Button 
            onClick={addCustomAsset}
            disabled={!customTicker.trim() || assets.some(a => a.symbol === customTicker.toUpperCase())}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Custom assets use simulated price data for demonstration purposes.
        </p>
      </div>

      {/* Quick Presets */}
      <div>
        <h4 className="text-sm font-medium mb-2">Quick Presets</h4>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const conservative = ASSET_UNIVERSE.filter(a => 
                ['TLT', 'IEF', 'LQD', 'GLD', 'VNQ'].includes(a.symbol)
              );
              const newAssets = conservative.map(asset => {
                const defaultAssets = createDefaultAssets();
                const template = defaultAssets[0];
                const newAsset: Asset = {
                  symbol: asset.symbol,
                  name: asset.name,
                  prices: template.prices.map(p => p * (0.8 + Math.random() * 0.4)),
                  returns: []
                };
                newAsset.returns = newAsset.prices.slice(1).map((price, i) => 
                  (price - newAsset.prices[i]) / newAsset.prices[i]
                );
                return newAsset;
              });
              onAssetsChange(newAssets);
            }}
          >
            Conservative
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const balanced = ASSET_UNIVERSE.filter(a => 
                ['SPY', 'QQQ', 'TLT', 'EFA', 'GLD', 'VNQ'].includes(a.symbol)
              );
              const newAssets = balanced.map(asset => {
                const defaultAssets = createDefaultAssets();
                const template = defaultAssets[0];
                const newAsset: Asset = {
                  symbol: asset.symbol,
                  name: asset.name,
                  prices: template.prices.map(p => p * (0.8 + Math.random() * 0.4)),
                  returns: []
                };
                newAsset.returns = newAsset.prices.slice(1).map((price, i) => 
                  (price - newAsset.prices[i]) / newAsset.prices[i]
                );
                return newAsset;
              });
              onAssetsChange(newAssets);
            }}
          >
            Balanced
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const aggressive = ASSET_UNIVERSE.filter(a => 
                ['QQQ', 'IWM', 'EEM', 'XLK', 'USO', 'SLV'].includes(a.symbol)
              );
              const newAssets = aggressive.map(asset => {
                const defaultAssets = createDefaultAssets();
                const template = defaultAssets[0];
                const newAsset: Asset = {
                  symbol: asset.symbol,
                  name: asset.name,
                  prices: template.prices.map(p => p * (0.8 + Math.random() * 0.4)),
                  returns: []
                };
                newAsset.returns = newAsset.prices.slice(1).map((price, i) => 
                  (price - newAsset.prices[i]) / newAsset.prices[i]
                );
                return newAsset;
              });
              onAssetsChange(newAssets);
            }}
          >
            Aggressive
          </Button>
        </div>
      </div>
    </div>
  );
};
