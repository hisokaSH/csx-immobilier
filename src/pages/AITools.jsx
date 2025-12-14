import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Sparkles,
  Wand2,
  Copy,
  Check,
  RefreshCw,
  Building2,
  MapPin,
  Euro,
  Bed,
  Bath,
  Square,
  AlertCircle,
  Loader2
} from 'lucide-react';

const propertyTypes = [
  { value: 'apartment', label: 'Appartement' },
  { value: 'house', label: 'Maison' },
  { value: 'villa', label: 'Villa' },
  { value: 'land', label: 'Terrain' },
  { value: 'commercial', label: 'Commercial' },
];

const priceTypes = [
  { value: 'sale', label: 'Vente' },
  { value: 'rent', label: 'Location' },
  { value: 'vacation', label: 'Saisonnière' },
];

const toneOptions = [
  { value: 'professional', label: 'Professionnel', desc: 'Factuel et informatif' },
  { value: 'luxury', label: 'Luxe', desc: 'Prestigieux et raffiné' },
  { value: 'friendly', label: 'Chaleureux', desc: 'Accueillant et convivial' },
];

const features = [
  'Piscine', 'Jardin', 'Terrasse', 'Balcon', 'Parking', 'Garage',
  'Vue mer', 'Vue montagne', 'Proche plage', 'Climatisation'
];

function AITools() {
  const [formData, setFormData] = useState({
    propertyType: 'apartment',
    priceType: 'sale',
    price: '',
    location: '',
    beds: '',
    baths: '',
    area: '',
    features: [],
    tone: 'professional',
  });

  const [generatedDescription, setGeneratedDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleFeature = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setGeneratedDescription('');

    try {
      const { data, error } = await supabase.functions.invoke('generate-description', {
        body: formData,
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setGeneratedDescription(data.description);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err.message || 'Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDescription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(168, 85, 247, 0.05) 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Sparkles size={24} style={{ color: '#a855f7' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Outils IA</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
              Générez des descriptions professionnelles avec Claude
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Input Form */}
        <div style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
            Détails du bien
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Property Type & Price Type */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Type de bien
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => handleChange('propertyType', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                >
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Transaction
                </label>
                <select
                  value={formData.priceType}
                  onChange={(e) => handleChange('priceType', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                >
                  {priceTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price & Location */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Prix (€)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                  placeholder="350000"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Localisation
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Fort-de-France, Martinique"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>

            {/* Beds, Baths, Area */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Chambres
                </label>
                <input
                  type="number"
                  value={formData.beds}
                  onChange={(e) => handleChange('beds', e.target.value)}
                  placeholder="3"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  SdB
                </label>
                <input
                  type="number"
                  value={formData.baths}
                  onChange={(e) => handleChange('baths', e.target.value)}
                  placeholder="2"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Surface (m²)
                </label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => handleChange('area', e.target.value)}
                  placeholder="85"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
              </div>
            </div>

            {/* Features */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: 'var(--text-muted)' }}>
                Équipements
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {features.map(feature => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => toggleFeature(feature)}
                    style={{
                      padding: '6px 12px',
                      background: formData.features.includes(feature)
                        ? 'rgba(168, 85, 247, 0.1)'
                        : 'var(--bg-tertiary)',
                      border: `1px solid ${formData.features.includes(feature) ? '#a855f7' : 'var(--border-color)'}`,
                      borderRadius: '6px',
                      color: formData.features.includes(feature) ? '#a855f7' : 'var(--text-secondary)',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>

            {/* Tone */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: 'var(--text-muted)' }}>
                Ton de la description
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {toneOptions.map(tone => (
                  <button
                    key={tone.value}
                    type="button"
                    onClick={() => handleChange('tone', tone.value)}
                    style={{
                      padding: '12px',
                      background: formData.tone === tone.value
                        ? 'rgba(168, 85, 247, 0.1)'
                        : 'var(--bg-tertiary)',
                      border: `1px solid ${formData.tone === tone.value ? '#a855f7' : 'var(--border-color)'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    <p style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: formData.tone === tone.value ? '#a855f7' : 'var(--text-primary)',
                      marginBottom: '2px',
                    }}>{tone.label}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tone.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '14px',
                background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                border: 'none',
                borderRadius: '10px',
                color: 'white',
                fontSize: '15px',
                fontWeight: '600',
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.7 : 1,
                marginTop: '8px',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Wand2 size={18} />
                  Générer la description
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output */}
        <div style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>
              Description générée
            </h3>
            {generatedDescription && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-secondary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={14} />
                  Régénérer
                </button>
                <button
                  onClick={handleCopy}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: copied ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-tertiary)',
                    border: `1px solid ${copied ? '#22c55e' : 'var(--border-color)'}`,
                    borderRadius: '8px',
                    color: copied ? '#22c55e' : 'var(--text-secondary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copié !' : 'Copier'}
                </button>
              </div>
            )}
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '10px',
              marginBottom: '16px',
            }}>
              <AlertCircle size={18} style={{ color: 'var(--error)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <p style={{ color: 'var(--error)', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Erreur de génération
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{error}</p>
              </div>
            </div>
          )}

          <div style={{
            flex: 1,
            padding: '16px',
            background: 'var(--bg-tertiary)',
            borderRadius: '10px',
            minHeight: '300px',
          }}>
            {loading ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: '16px',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  border: '3px solid var(--border-color)',
                  borderTopColor: '#a855f7',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  Claude génère votre description...
                </p>
              </div>
            ) : generatedDescription ? (
              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: 'var(--text-primary)',
                whiteSpace: 'pre-wrap',
              }}>
                {generatedDescription}
              </p>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                textAlign: 'center',
                color: 'var(--text-muted)',
              }}>
                <Sparkles size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p style={{ fontSize: '14px', marginBottom: '8px' }}>
                  Remplissez les détails du bien
                </p>
                <p style={{ fontSize: '13px', opacity: 0.7 }}>
                  et cliquez sur "Générer" pour créer une description
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AITools;
