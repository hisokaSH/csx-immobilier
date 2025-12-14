import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../lib/supabase';
import {
  Calculator,
  MapPin,
  Home,
  Bed,
  Bath,
  Square,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Info,
  Building2,
  Sparkles,
  Check,
  AlertCircle
} from 'lucide-react';

const propertyTypes = [
  { value: 'apartment', label: 'Appartement' },
  { value: 'house', label: 'Maison' },
  { value: 'villa', label: 'Villa' },
  { value: 'land', label: 'Terrain' },
  { value: 'commercial', label: 'Commercial' },
];

const conditions = [
  { value: 'new', label: 'Neuf', multiplier: 1.15 },
  { value: 'excellent', label: 'Excellent état', multiplier: 1.08 },
  { value: 'good', label: 'Bon état', multiplier: 1.0 },
  { value: 'renovation', label: 'À rénover', multiplier: 0.85 },
  { value: 'major_work', label: 'Gros travaux', multiplier: 0.7 },
];

const features = [
  { id: 'pool', label: 'Piscine', value: 25000 },
  { id: 'garden', label: 'Jardin', value: 15000 },
  { id: 'sea_view', label: 'Vue mer', value: 35000 },
  { id: 'parking', label: 'Parking', value: 10000 },
  { id: 'terrace', label: 'Terrasse', value: 12000 },
  { id: 'garage', label: 'Garage', value: 18000 },
  { id: 'elevator', label: 'Ascenseur', value: 8000 },
  { id: 'security', label: 'Gardiennage', value: 5000 },
];

// Base prices per m² by region (simplified)
const regionPrices = {
  'Paris': 10500,
  'Lyon': 5200,
  'Marseille': 3800,
  'Bordeaux': 4800,
  'Nice': 5500,
  'Guadeloupe': 3200,
  'Martinique': 3400,
  'Saint-Martin': 4500,
  'Guyane': 2200,
  'Réunion': 2800,
  'default': 3000,
};

function PropertyValuation() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const [formData, setFormData] = useState({
    propertyType: 'apartment',
    location: '',
    region: 'default',
    area: '',
    beds: '',
    baths: '',
    condition: 'good',
    yearBuilt: '',
    features: [],
  });

  const handleFeatureToggle = (featureId) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const calculateValuation = async () => {
    if (!formData.area || !formData.location) {
      alert('Veuillez remplir la surface et la localisation');
      return;
    }

    setLoading(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const area = parseFloat(formData.area);
    const basePrice = regionPrices[formData.region] || regionPrices.default;
    
    // Base calculation
    let estimatedPrice = area * basePrice;
    
    // Apply condition multiplier
    const conditionData = conditions.find(c => c.value === formData.condition);
    if (conditionData) {
      estimatedPrice *= conditionData.multiplier;
    }
    
    // Property type adjustments
    if (formData.propertyType === 'villa') estimatedPrice *= 1.2;
    if (formData.propertyType === 'house') estimatedPrice *= 1.1;
    if (formData.propertyType === 'land') estimatedPrice *= 0.4;
    
    // Add feature values
    const featureValue = formData.features.reduce((sum, featureId) => {
      const feature = features.find(f => f.id === featureId);
      return sum + (feature?.value || 0);
    }, 0);
    estimatedPrice += featureValue;
    
    // Room adjustments
    const beds = parseInt(formData.beds) || 0;
    const baths = parseInt(formData.baths) || 0;
    if (beds > 3) estimatedPrice += (beds - 3) * 8000;
    if (baths > 2) estimatedPrice += (baths - 2) * 5000;
    
    // Calculate range (±10%)
    const lowEstimate = Math.round(estimatedPrice * 0.9);
    const highEstimate = Math.round(estimatedPrice * 1.1);
    const midEstimate = Math.round(estimatedPrice);
    
    // Price per m²
    const pricePerSqm = Math.round(midEstimate / area);
    
    // Market comparison (simulated)
    const marketAvg = basePrice;
    const marketComparison = ((pricePerSqm - marketAvg) / marketAvg) * 100;
    
    setResult({
      lowEstimate,
      midEstimate,
      highEstimate,
      pricePerSqm,
      marketAvg,
      marketComparison,
      confidence: 85,
      similarProperties: Math.floor(Math.random() * 20) + 5,
    });
    
    setLoading(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
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
            <Calculator size={24} style={{ color: 'var(--gold)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Estimation IA</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Estimez la valeur d'un bien en quelques clics
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
        {/* Form */}
        <div style={{
          padding: '28px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '24px' }}>
            Caractéristiques du bien
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Property Type */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Type de bien
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {propertyTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setFormData({ ...formData, propertyType: type.value })}
                    style={{
                      padding: '10px 16px',
                      background: formData.propertyType === type.value ? 'var(--gold)' : 'var(--bg-tertiary)',
                      border: '1px solid ' + (formData.propertyType === type.value ? 'var(--gold)' : 'var(--border-color)'),
                      borderRadius: '8px',
                      color: formData.propertyType === type.value ? 'var(--bg-primary)' : 'var(--text-primary)',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Localisation
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }} />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Adresse ou quartier"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Région
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                >
                  {Object.keys(regionPrices).filter(r => r !== 'default').map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Area, Beds, Baths */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Surface (m²)
                </label>
                <div style={{ position: 'relative' }}>
                  <Square size={18} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }} />
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="85"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Chambres
                </label>
                <div style={{ position: 'relative' }}>
                  <Bed size={18} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }} />
                  <input
                    type="number"
                    value={formData.beds}
                    onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                    placeholder="3"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  SdB
                </label>
                <div style={{ position: 'relative' }}>
                  <Bath size={18} style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }} />
                  <input
                    type="number"
                    value={formData.baths}
                    onChange={(e) => setFormData({ ...formData, baths: e.target.value })}
                    placeholder="2"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 40px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Condition */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                État général
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {conditions.map(cond => (
                  <button
                    key={cond.value}
                    onClick={() => setFormData({ ...formData, condition: cond.value })}
                    style={{
                      padding: '10px 16px',
                      background: formData.condition === cond.value ? 'var(--gold)' : 'var(--bg-tertiary)',
                      border: '1px solid ' + (formData.condition === cond.value ? 'var(--gold)' : 'var(--border-color)'),
                      borderRadius: '8px',
                      color: formData.condition === cond.value ? 'var(--bg-primary)' : 'var(--text-primary)',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
                    {cond.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Équipements
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                {features.map(feature => (
                  <button
                    key={feature.id}
                    onClick={() => handleFeatureToggle(feature.id)}
                    style={{
                      padding: '10px 12px',
                      background: formData.features.includes(feature.id) 
                        ? 'rgba(212, 175, 55, 0.15)' 
                        : 'var(--bg-tertiary)',
                      border: '1px solid ' + (formData.features.includes(feature.id) 
                        ? 'rgba(212, 175, 55, 0.3)' 
                        : 'var(--border-color)'),
                      borderRadius: '8px',
                      color: formData.features.includes(feature.id) ? 'var(--gold)' : 'var(--text-secondary)',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {formData.features.includes(feature.id) && <Check size={14} />}
                    {feature.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={calculateValuation}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '16px',
                background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'var(--bg-primary)',
                fontSize: '15px',
                fontWeight: '600',
                cursor: loading ? 'wait' : 'pointer',
                marginTop: '8px',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  Analyse en cours...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Estimer la valeur
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div>
          {result ? (
            <div style={{
              padding: '28px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '24px',
              }}>
                <Sparkles size={18} style={{ color: 'var(--gold)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Estimation</h3>
              </div>

              {/* Main Estimate */}
              <div style={{
                padding: '24px',
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.02) 100%)',
                border: '1px solid rgba(212, 175, 55, 0.2)',
                borderRadius: '12px',
                textAlign: 'center',
                marginBottom: '20px',
              }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Valeur estimée
                </p>
                <p style={{ fontSize: '36px', fontWeight: '700', color: 'var(--gold)', marginBottom: '8px' }}>
                  {formatPrice(result.midEstimate)}
                </p>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {formatPrice(result.lowEstimate)} - {formatPrice(result.highEstimate)}
                </p>
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  padding: '16px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '10px',
                }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Prix/m²</p>
                  <p style={{ fontSize: '18px', fontWeight: '600' }}>{formatPrice(result.pricePerSqm)}</p>
                </div>
                <div style={{
                  padding: '16px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '10px',
                }}>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Moyenne marché</p>
                  <p style={{ fontSize: '18px', fontWeight: '600' }}>{formatPrice(result.marketAvg)}/m²</p>
                </div>
              </div>

              {/* Market Comparison */}
              <div style={{
                padding: '16px',
                background: 'var(--bg-tertiary)',
                borderRadius: '10px',
                marginBottom: '20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>vs. Marché local</span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: result.marketComparison > 0 ? '#22c55e' : result.marketComparison < 0 ? '#ef4444' : 'var(--text-muted)',
                  }}>
                    {result.marketComparison > 0 ? <TrendingUp size={16} /> : 
                     result.marketComparison < 0 ? <TrendingDown size={16} /> : <Minus size={16} />}
                    <span style={{ fontWeight: '600' }}>
                      {result.marketComparison > 0 ? '+' : ''}{result.marketComparison.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div style={{
                  height: '8px',
                  background: 'var(--border-color)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${Math.min(Math.max(50 + result.marketComparison, 10), 90)}%`,
                    height: '100%',
                    background: result.marketComparison > 0 ? '#22c55e' : result.marketComparison < 0 ? '#ef4444' : 'var(--gold)',
                    borderRadius: '4px',
                  }} />
                </div>
              </div>

              {/* Confidence */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.2)',
                borderRadius: '10px',
                marginBottom: '16px',
              }}>
                <Info size={16} style={{ color: '#22c55e' }} />
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '500', color: '#22c55e' }}>
                    Confiance: {result.confidence}%
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Basé sur {result.similarProperties} biens similaires
                  </p>
                </div>
              </div>

              <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                Cette estimation est indicative et ne constitue pas une évaluation officielle.
              </p>
            </div>
          ) : (
            <div style={{
              padding: '40px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              textAlign: 'center',
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'rgba(212, 175, 55, 0.1)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Building2 size={28} style={{ color: 'var(--gold)' }} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                Estimation instantanée
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Remplissez les caractéristiques du bien pour obtenir une estimation basée sur l'IA et les données du marché.
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default PropertyValuation;
