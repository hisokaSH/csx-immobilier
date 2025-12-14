import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  MapPin,
  Home,
  DollarSign,
  Clock,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

const regions = [
  'Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Nice', 
  'Guadeloupe', 'Martinique', 'Saint-Martin', 'Guyane', 'Réunion'
];

const propertyTypes = ['Appartement', 'Maison', 'Villa', 'Terrain', 'Commercial'];

function MarketInsights() {
  const [selectedRegion, setSelectedRegion] = useState('Nice');
  const [selectedType, setSelectedType] = useState('Appartement');
  const [timeRange, setTimeRange] = useState('6m');

  // Simulated market data
  const marketData = {
    avgPrice: 5200,
    priceChange: 3.2,
    avgDaysOnMarket: 45,
    daysChange: -8,
    totalListings: 1247,
    listingsChange: 12,
    salesVolume: 89,
    salesChange: 5,
    priceHistory: [4800, 4900, 5000, 5100, 5150, 5200],
    demandIndex: 78,
    supplyIndex: 62,
    neighborhoods: [
      { name: 'Vieux Nice', avgPrice: 6200, change: 4.1 },
      { name: 'Cimiez', avgPrice: 5800, change: 2.8 },
      { name: 'Port', avgPrice: 5500, change: 3.5 },
      { name: 'Libération', avgPrice: 4800, change: 1.9 },
      { name: 'Arenas', avgPrice: 4200, change: 5.2 },
    ],
    priceByType: [
      { type: 'Studio', price: 4200 },
      { type: 'T2', price: 4800 },
      { type: 'T3', price: 5200 },
      { type: 'T4', price: 5800 },
      { type: 'T5+', price: 6500 },
    ],
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.05) 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <BarChart3 size={24} style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Analyse de marché</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Tendances et statistiques immobilières
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '14px',
              cursor: 'pointer',
            }}>
              <RefreshCw size={16} />
              Actualiser
            </button>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '14px',
              cursor: 'pointer',
            }}>
              <Download size={16} />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          style={{
            padding: '10px 16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '14px',
          }}
        >
          {regions.map(region => (
            <option key={region} value={region}>{region}</option>
          ))}
        </select>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{
            padding: '10px 16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '14px',
          }}
        >
          {propertyTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <div style={{ display: 'flex', gap: '4px', padding: '4px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          {['1m', '3m', '6m', '1y'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: '6px 12px',
                background: timeRange === range ? 'var(--gold)' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: timeRange === range ? 'var(--bg-primary)' : 'var(--text-secondary)',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {[
          { 
            label: 'Prix moyen /m²', 
            value: formatPrice(marketData.avgPrice), 
            change: marketData.priceChange,
            icon: DollarSign,
            color: '#22c55e'
          },
          { 
            label: 'Délai moyen de vente', 
            value: `${marketData.avgDaysOnMarket} jours`, 
            change: marketData.daysChange,
            icon: Clock,
            color: '#3b82f6',
            invertChange: true
          },
          { 
            label: 'Annonces actives', 
            value: marketData.totalListings.toLocaleString(), 
            change: marketData.listingsChange,
            icon: Home,
            color: 'var(--gold)'
          },
          { 
            label: 'Ventes ce mois', 
            value: marketData.salesVolume, 
            change: marketData.salesChange,
            icon: TrendingUp,
            color: '#8b5cf6'
          },
        ].map((metric, idx) => (
          <div key={idx} style={{
            padding: '20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: `${metric.color}15`,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <metric.icon size={20} style={{ color: metric.color }} />
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: (metric.invertChange ? metric.change < 0 : metric.change > 0) ? '#22c55e' : '#ef4444',
                fontSize: '13px',
                fontWeight: '600',
              }}>
                {(metric.invertChange ? metric.change < 0 : metric.change > 0) ? (
                  <ArrowUpRight size={16} />
                ) : (
                  <ArrowDownRight size={16} />
                )}
                {Math.abs(metric.change)}%
              </div>
            </div>
            <p style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{metric.value}</p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{metric.label}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Price Chart */}
        <div style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
            Évolution des prix
          </h3>
          <div style={{ height: '250px', position: 'relative' }}>
            {/* Simple chart visualization */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: '100%',
              paddingBottom: '30px',
            }}>
              {marketData.priceHistory.map((price, idx) => {
                const maxPrice = Math.max(...marketData.priceHistory);
                const minPrice = Math.min(...marketData.priceHistory);
                const height = ((price - minPrice) / (maxPrice - minPrice)) * 180 + 40;
                const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
                
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{
                      width: '100%',
                      maxWidth: '60px',
                      height: `${height}px`,
                      background: `linear-gradient(180deg, var(--gold) 0%, rgba(212, 175, 55, 0.3) 100%)`,
                      borderRadius: '8px 8px 0 0',
                      position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '-25px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        whiteSpace: 'nowrap',
                      }}>
                        {formatPrice(price)}
                      </div>
                    </div>
                    <span style={{
                      marginTop: '8px',
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                    }}>
                      {months[idx]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Supply/Demand */}
        <div style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
            Offre vs Demande
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Demande</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>{marketData.demandIndex}%</span>
              </div>
              <div style={{
                height: '12px',
                background: 'var(--bg-tertiary)',
                borderRadius: '6px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${marketData.demandIndex}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                  borderRadius: '6px',
                }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Offre</span>
                <span style={{ fontSize: '14px', fontWeight: '600' }}>{marketData.supplyIndex}%</span>
              </div>
              <div style={{
                height: '12px',
                background: 'var(--bg-tertiary)',
                borderRadius: '6px',
                overflow: 'hidden',
              }}>
                <div style={{
                  width: `${marketData.supplyIndex}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
                  borderRadius: '6px',
                }} />
              </div>
            </div>
            <div style={{
              padding: '16px',
              background: marketData.demandIndex > marketData.supplyIndex 
                ? 'rgba(34, 197, 94, 0.1)' 
                : 'rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              <p style={{
                fontSize: '14px',
                fontWeight: '600',
                color: marketData.demandIndex > marketData.supplyIndex ? '#22c55e' : '#ef4444',
              }}>
                {marketData.demandIndex > marketData.supplyIndex 
                  ? '🔥 Marché vendeur' 
                  : '📉 Marché acheteur'}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                La demande est {marketData.demandIndex > marketData.supplyIndex ? 'supérieure' : 'inférieure'} à l'offre
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Neighborhoods */}
      <div style={{
        marginTop: '24px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
      }}>
        <div style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
            Prix par quartier
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {marketData.neighborhoods.map((neighborhood, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'var(--bg-tertiary)',
                borderRadius: '8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: `hsl(${45 + idx * 15}, 70%, 50%)`,
                  }} />
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{neighborhood.name}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>
                    {formatPrice(neighborhood.avgPrice)}/m²
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: neighborhood.change > 0 ? '#22c55e' : '#ef4444',
                    fontWeight: '500',
                  }}>
                    {neighborhood.change > 0 ? '+' : ''}{neighborhood.change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
            Prix par type de bien
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {marketData.priceByType.map((item, idx) => {
              const maxPrice = Math.max(...marketData.priceByType.map(p => p.price));
              const width = (item.price / maxPrice) * 100;
              
              return (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{item.type}</span>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{formatPrice(item.price)}/m²</span>
                  </div>
                  <div style={{
                    height: '8px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${width}%`,
                      height: '100%',
                      background: 'var(--gold)',
                      borderRadius: '4px',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MarketInsights;
