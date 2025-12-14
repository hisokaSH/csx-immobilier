import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  MapPin,
  Home,
  BarChart3,
  Search,
  Loader2,
  AlertCircle,
  Database,
  ExternalLink,
  Calendar,
  Euro,
  Building2,
  Info
} from 'lucide-react';

// Cities with postal codes for DVF API
const cities = [
  { name: 'Paris', code: '75001', label: 'Paris (75)' },
  { name: 'Lyon', code: '69001', label: 'Lyon (69)' },
  { name: 'Marseille', code: '13001', label: 'Marseille (13)' },
  { name: 'Bordeaux', code: '33000', label: 'Bordeaux (33)' },
  { name: 'Nice', code: '06000', label: 'Nice (06)' },
  { name: 'Toulouse', code: '31000', label: 'Toulouse (31)' },
  { name: 'Nantes', code: '44000', label: 'Nantes (44)' },
  { name: 'Lille', code: '59000', label: 'Lille (59)' },
  { name: 'Strasbourg', code: '67000', label: 'Strasbourg (67)' },
  { name: 'Montpellier', code: '34000', label: 'Montpellier (34)' },
];

const propertyTypes = [
  { value: 'Appartement', label: 'Appartement' },
  { value: 'Maison', label: 'Maison' },
];

function MarketInsights() {
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [selectedType, setSelectedType] = useState('Appartement');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const fetchMarketData = async () => {
    setIsLoading(true);
    setError(null);
    setMarketData(null);
    setTransactions([]);

    try {
      // Fetch from DVF API
      const url = `https://api.cquest.org/dvf?code_postal=${selectedCity.code}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erreur de connexion à l\'API DVF');
      }

      const data = await response.json();

      if (!data.resultats || data.resultats.length === 0) {
        throw new Error('Aucune donnée disponible pour cette ville');
      }

      // Filter by property type
      let filtered = data.resultats.filter(item => {
        if (selectedType === 'Appartement' && item.type_local !== 'Appartement') return false;
        if (selectedType === 'Maison' && item.type_local !== 'Maison') return false;
        if (!item.surface_reelle_bati || !item.valeur_fonciere) return false;
        if (item.surface_reelle_bati < 10 || item.valeur_fonciere < 20000) return false;
        return true;
      });

      if (filtered.length === 0) {
        throw new Error(`Aucune transaction de type "${selectedType}" trouvée`);
      }

      // Calculate statistics
      const prices = filtered.map(t => t.valeur_fonciere);
      const pricesPerSqm = filtered.map(t => t.valeur_fonciere / t.surface_reelle_bati);
      const surfaces = filtered.map(t => t.surface_reelle_bati);

      // Remove outliers
      const sortedPrices = [...pricesPerSqm].sort((a, b) => a - b);
      const q1 = sortedPrices[Math.floor(sortedPrices.length * 0.25)];
      const q3 = sortedPrices[Math.floor(sortedPrices.length * 0.75)];
      const iqr = q3 - q1;
      const validPrices = pricesPerSqm.filter(p => p >= q1 - 1.5 * iqr && p <= q3 + 1.5 * iqr);

      const avgPricePerSqm = Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length);
      const medianPricePerSqm = Math.round(sortedPrices[Math.floor(sortedPrices.length / 2)]);
      const minPrice = Math.round(Math.min(...validPrices));
      const maxPrice = Math.round(Math.max(...validPrices));

      const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
      const avgSurface = Math.round(surfaces.reduce((a, b) => a + b, 0) / surfaces.length);

      // Group by number of rooms
      const byRooms = {};
      filtered.forEach(t => {
        const rooms = t.nombre_pieces_principales || 'N/A';
        if (!byRooms[rooms]) {
          byRooms[rooms] = { count: 0, totalPrice: 0, totalSurface: 0 };
        }
        byRooms[rooms].count++;
        byRooms[rooms].totalPrice += t.valeur_fonciere / t.surface_reelle_bati;
        byRooms[rooms].totalSurface += t.surface_reelle_bati;
      });

      const priceByRooms = Object.entries(byRooms)
        .filter(([k]) => k !== 'N/A' && k !== 'null')
        .map(([rooms, data]) => ({
          rooms: `T${rooms}`,
          avgPrice: Math.round(data.totalPrice / data.count),
          avgSurface: Math.round(data.totalSurface / data.count),
          count: data.count,
        }))
        .sort((a, b) => parseInt(a.rooms.slice(1)) - parseInt(b.rooms.slice(1)));

      // Get date range
      const dates = filtered
        .map(t => t.date_mutation ? new Date(t.date_mutation) : null)
        .filter(d => d && !isNaN(d.getTime()));
      
      const minDate = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
      const maxDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

      setMarketData({
        totalTransactions: filtered.length,
        avgPricePerSqm,
        medianPricePerSqm,
        minPrice,
        maxPrice,
        avgPrice,
        avgSurface,
        priceByRooms,
        dateRange: minDate && maxDate ? {
          from: minDate.toLocaleDateString('fr-FR'),
          to: maxDate.toLocaleDateString('fr-FR'),
        } : null,
      });

      // Store sample transactions
      setTransactions(filtered.slice(0, 10).map(t => ({
        date: t.date_mutation ? new Date(t.date_mutation).toLocaleDateString('fr-FR') : 'N/A',
        address: `${t.adresse_numero || ''} ${t.adresse_nom_voie || ''}`.trim(),
        price: t.valeur_fonciere,
        surface: t.surface_reelle_bati,
        rooms: t.nombre_pieces_principales,
        pricePerSqm: Math.round(t.valeur_fonciere / t.surface_reelle_bati),
      })));

    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
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
          gap: '12px',
          marginBottom: '8px',
        }}>
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
              Statistiques basées sur les transactions DVF réelles
            </p>
          </div>
        </div>
        
        {/* Data source badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: '8px',
          marginTop: '12px',
        }}>
          <Database size={14} style={{ color: '#22c55e' }} />
          <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: '500' }}>
            Données officielles DVF (data.gouv.fr)
          </span>
          <a 
            href="https://app.dvf.etalab.gouv.fr/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#22c55e' }}
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        padding: '24px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>
              <MapPin size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Ville
            </label>
            <select
              value={selectedCity.name}
              onChange={(e) => setSelectedCity(cities.find(c => c.name === e.target.value) || cities[0])}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
              }}
            >
              {cities.map(city => (
                <option key={city.name} value={city.name}>{city.label}</option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1, minWidth: '200px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>
              <Home size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Type de bien
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {propertyTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: selectedType === type.value ? 'var(--gold)' : 'var(--bg-tertiary)',
                    border: '1px solid ' + (selectedType === type.value ? 'var(--gold)' : 'var(--border-color)'),
                    borderRadius: '8px',
                    color: selectedType === type.value ? 'var(--bg-primary)' : 'var(--text-secondary)',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={fetchMarketData}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              background: isLoading ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
              border: 'none',
              borderRadius: '8px',
              color: isLoading ? 'var(--text-muted)' : 'var(--bg-primary)',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              height: '46px',
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Chargement...
              </>
            ) : (
              <>
                <Search size={18} />
                Analyser
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <AlertCircle size={18} style={{ color: '#ef4444' }} />
            <span style={{ color: '#ef4444', fontSize: '14px' }}>{error}</span>
          </div>
        )}
      </div>

      {/* Results */}
      {marketData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Key Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}>
            <div style={{
              padding: '24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Euro size={18} style={{ color: 'var(--gold)' }} />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Prix moyen /m²</span>
              </div>
              <p style={{ fontSize: '28px', fontWeight: '700', color: 'var(--gold)' }}>
                {formatPrice(marketData.avgPricePerSqm)}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Médiane: {formatPrice(marketData.medianPricePerSqm)}/m²
              </p>
            </div>

            <div style={{
              padding: '24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Building2 size={18} style={{ color: '#3b82f6' }} />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Prix moyen</span>
              </div>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#3b82f6' }}>
                {formatPrice(marketData.avgPrice)}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Surface moy.: {marketData.avgSurface} m²
              </p>
            </div>

            <div style={{
              padding: '24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Database size={18} style={{ color: '#22c55e' }} />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Transactions</span>
              </div>
              <p style={{ fontSize: '28px', fontWeight: '700', color: '#22c55e' }}>
                {marketData.totalTransactions}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Ventes analysées
              </p>
            </div>

            <div style={{
              padding: '24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <TrendingUp size={18} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Fourchette</span>
              </div>
              <p style={{ fontSize: '18px', fontWeight: '600', color: '#f59e0b' }}>
                {formatPrice(marketData.minPrice)} - {formatPrice(marketData.maxPrice)}
              </p>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Prix au m² (hors aberrants)
              </p>
            </div>
          </div>

          {/* Date Range */}
          {marketData.dateRange && (
            <div style={{
              padding: '12px 16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Période analysée: {marketData.dateRange.from} → {marketData.dateRange.to}
              </span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Price by Room Type */}
            {marketData.priceByRooms.length > 0 && (
              <div style={{
                padding: '24px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
                  Prix par typologie
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {marketData.priceByRooms.map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '10px',
                    }}>
                      <div>
                        <span style={{ fontSize: '15px', fontWeight: '600' }}>{item.rooms}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                          ({item.count} ventes, ~{item.avgSurface}m²)
                        </span>
                      </div>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--gold)' }}>
                        {formatPrice(item.avgPrice)}/m²
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            {transactions.length > 0 && (
              <div style={{
                padding: '24px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
                  Transactions récentes
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                  {transactions.map((t, idx) => (
                    <div key={idx} style={{
                      padding: '12px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '10px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gold)' }}>
                          {formatPrice(t.price)}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.date}</span>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        {t.address || 'Adresse non précisée'}
                      </p>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <span>{t.surface} m²</span>
                        {t.rooms && <span>{t.rooms} pièces</span>}
                        <span style={{ color: 'var(--gold)' }}>{formatPrice(t.pricePerSqm)}/m²</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* External Links */}
          <div style={{
            padding: '20px 24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
              🔍 Explorer les données
            </h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <a
                href={`https://app.dvf.etalab.gouv.fr/`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: '8px',
                  color: '#22c55e',
                  fontSize: '13px',
                  fontWeight: '500',
                  textDecoration: 'none',
                }}
              >
                DVF Etalab
                <ExternalLink size={14} />
              </a>
              <a
                href={`https://www.meilleursagents.com/prix-immobilier/${selectedCity.name.toLowerCase()}/`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '8px',
                  color: '#3b82f6',
                  fontSize: '13px',
                  fontWeight: '500',
                  textDecoration: 'none',
                }}
              >
                MeilleursAgents
                <ExternalLink size={14} />
              </a>
              <a
                href={`https://www.seloger.com/prix-de-l-immo/vente/${selectedCity.name.toLowerCase()}.htm`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 14px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '8px',
                  color: '#ef4444',
                  fontSize: '13px',
                  fontWeight: '500',
                  textDecoration: 'none',
                }}
              >
                SeLoger
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!marketData && !isLoading && (
        <div style={{
          padding: '60px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(212, 175, 55, 0.1)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <BarChart3 size={36} style={{ color: 'var(--gold)' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Analysez le marché immobilier
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px', margin: '0 auto 24px' }}>
            Sélectionnez une ville et un type de bien pour obtenir des statistiques basées sur les vraies transactions immobilières (DVF).
          </p>
          <div style={{
            padding: '12px 16px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '8px',
            display: 'inline-block',
          }}>
            <p style={{ fontSize: '12px', color: '#3b82f6' }}>
              💡 Les données DVF incluent toutes les ventes immobilières en France depuis 2014
            </p>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default MarketInsights;
