import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin,
  School,
  Train,
  ShoppingBag,
  Utensils,
  Trees,
  Cross,
  Shield,
  TrendingUp,
  Star,
  Search,
  Plus,
  Check,
  RefreshCw,
  Copy,
  ExternalLink,
  Building2,
  Car,
  Bike,
  Bus,
  Coffee
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const categoryIcons = {
  schools: School,
  transport: Train,
  shopping: ShoppingBag,
  restaurants: Utensils,
  parks: Trees,
  healthcare: Cross,
  safety: Shield,
};

const mockNeighborhoodData = {
  scores: {
    overall: 85,
    transport: 92,
    schools: 78,
    shopping: 88,
    safety: 82,
    parks: 75,
  },
  transport: [
    { name: 'Métro Châtelet', type: 'metro', distance: '200m', lines: ['1', '4', '7', '11', '14'] },
    { name: 'RER Châtelet-Les Halles', type: 'rer', distance: '300m', lines: ['A', 'B', 'D'] },
    { name: 'Bus Rivoli', type: 'bus', distance: '50m', lines: ['67', '69', '76'] },
    { name: 'Vélib Station', type: 'bike', distance: '100m', bikes: 12 },
  ],
  schools: [
    { name: 'École Maternelle Saint-Merri', type: 'Maternelle', distance: '400m', rating: 4.2 },
    { name: 'École Élémentaire Renard', type: 'Primaire', distance: '350m', rating: 4.5 },
    { name: 'Collège Charlemagne', type: 'Collège', distance: '600m', rating: 4.1 },
    { name: 'Lycée Henri IV', type: 'Lycée', distance: '1.2km', rating: 4.8 },
  ],
  shopping: [
    { name: 'Forum des Halles', type: 'Centre commercial', distance: '500m' },
    { name: 'BHV Marais', type: 'Grand magasin', distance: '400m' },
    { name: 'Monoprix Rivoli', type: 'Supermarché', distance: '150m' },
    { name: 'Marché des Enfants Rouges', type: 'Marché', distance: '800m' },
  ],
  restaurants: [
    { name: 'Café de Flore', type: 'Café', distance: '200m', rating: 4.3 },
    { name: 'Le Comptoir', type: 'Bistrot', distance: '300m', rating: 4.5 },
    { name: 'Sushi Shop', type: 'Japonais', distance: '100m', rating: 4.0 },
  ],
  parks: [
    { name: 'Jardin des Tuileries', type: 'Parc', distance: '800m', area: '25 hectares' },
    { name: 'Square du Temple', type: 'Square', distance: '600m', area: '1.3 hectares' },
    { name: 'Place des Vosges', type: 'Place', distance: '700m' },
  ],
  healthcare: [
    { name: 'Hôpital Hôtel-Dieu', type: 'Hôpital', distance: '800m' },
    { name: 'Pharmacie du Marais', type: 'Pharmacie', distance: '100m', open24h: true },
    { name: 'Dr. Martin - Généraliste', type: 'Médecin', distance: '200m' },
  ],
  safety: {
    crimeIndex: 'Faible',
    policeStation: '300m',
    fireStation: '1.2km',
    nightSafety: 4,
  },
};

function NeighborhoodInfo() {
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [neighborhoodData, setNeighborhoodData] = useState(null);
  const [activeCategory, setActiveCategory] = useState('transport');
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setListings(data);
    }
  };

  const analyzeNeighborhood = async (searchAddress) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setNeighborhoodData(mockNeighborhoodData);
    generateDescription(mockNeighborhoodData);
    setIsLoading(false);
  };

  const selectListing = (listing) => {
    setSelectedListing(listing);
    const fullAddress = `${listing.address}, ${listing.city}, ${listing.postal_code}`;
    setAddress(fullAddress);
    analyzeNeighborhood(fullAddress);
  };

  const generateDescription = (data) => {
    const text = `🏠 **Quartier d'exception**

📍 **Situation idéale** - Score global: ${data.scores.overall}/100

🚇 **Transports** (${data.scores.transport}/100)
Excellente desserte avec le métro à 200m (lignes 1, 4, 7, 11, 14), RER à 300m et nombreuses lignes de bus. Station Vélib à proximité immédiate.

🎓 **Écoles** (${data.scores.schools}/100)
Établissements réputés à proximité : maternelle et primaire à moins de 400m, collège et lycée prestigieux accessibles à pied.

🛍️ **Commerces** (${data.scores.shopping}/100)
Forum des Halles et BHV à quelques minutes. Supermarché et marché couvert pour le quotidien.

🌳 **Espaces verts** (${data.scores.parks}/100)
Jardin des Tuileries à 800m, Place des Vosges et Square du Temple pour des balades agréables.

🏥 **Santé**
Hôpital Hôtel-Dieu à 800m, pharmacie ouverte 24h/24 à 100m, médecins généralistes dans le quartier.

🛡️ **Sécurité**
Quartier calme avec indice de criminalité faible. Commissariat à 300m.

*Un emplacement premium pour une qualité de vie exceptionnelle.*`;
    
    setGeneratedText(text);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ScoreCircle = ({ score, label, color }) => (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: `conic-gradient(${color} ${score}%, var(--bg-primary) 0%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 8px',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--bg-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{ fontSize: '20px', fontWeight: '700', color }}>{score}</span>
        </div>
      </div>
      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Link 
          to="/tools" 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: 'var(--text-muted)', 
            textDecoration: 'none',
            marginBottom: '16px',
            fontSize: '14px',
          }}
        >
          <ArrowLeft size={16} />
          Retour aux outils
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <MapPin size={24} style={{ color: '#3b82f6' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Infos Quartier</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Analysez l'environnement de vos biens automatiquement
            </p>
          </div>
        </div>
      </div>

      {/* Address Input or Listing Selection */}
      <div style={{
        padding: '24px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              marginBottom: '8px' 
            }}>
              Adresse à analyser
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
              }}>
                <Search size={18} style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Entrez une adresse..."
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
              <button
                onClick={() => analyzeNeighborhood(address)}
                disabled={!address || isLoading}
                style={{
                  padding: '12px 24px',
                  background: !address || isLoading 
                    ? 'var(--bg-secondary)' 
                    : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: !address || isLoading ? 'var(--text-muted)' : 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: !address || isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Analyse...
                  </>
                ) : (
                  <>
                    <MapPin size={16} />
                    Analyser
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Quick Select from Listings */}
        {listings.length > 0 && (
          <div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Ou sélectionnez un de vos biens :
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {listings.slice(0, 5).map(listing => (
                <button
                  key={listing.id}
                  onClick={() => selectListing(listing)}
                  style={{
                    padding: '8px 16px',
                    background: selectedListing?.id === listing.id 
                      ? 'rgba(59, 130, 246, 0.1)' 
                      : 'var(--bg-primary)',
                    border: selectedListing?.id === listing.id 
                      ? '1px solid #3b82f6' 
                      : '1px solid var(--border-color)',
                    borderRadius: '20px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Building2 size={14} />
                  {listing.title.substring(0, 25)}{listing.title.length > 25 ? '...' : ''}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {neighborhoodData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
          {/* Main Content */}
          <div>
            {/* Scores Overview */}
            <div style={{
              padding: '24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              marginBottom: '24px',
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>
                Score du quartier
              </h2>
              <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                flexWrap: 'wrap',
                gap: '16px',
              }}>
                <ScoreCircle score={neighborhoodData.scores.overall} label="Global" color="var(--gold)" />
                <ScoreCircle score={neighborhoodData.scores.transport} label="Transport" color="#3b82f6" />
                <ScoreCircle score={neighborhoodData.scores.schools} label="Écoles" color="#8b5cf6" />
                <ScoreCircle score={neighborhoodData.scores.shopping} label="Commerces" color="#f97316" />
                <ScoreCircle score={neighborhoodData.scores.safety} label="Sécurité" color="#22c55e" />
                <ScoreCircle score={neighborhoodData.scores.parks} label="Parcs" color="#10b981" />
              </div>
            </div>

            {/* Category Tabs */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '16px',
              overflowX: 'auto',
              paddingBottom: '8px',
            }}>
              {Object.entries(categoryIcons).map(([key, Icon]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  style={{
                    padding: '10px 20px',
                    background: activeCategory === key 
                      ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
                      : 'var(--bg-card)',
                    border: activeCategory === key 
                      ? 'none' 
                      : '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: activeCategory === key ? 'white' : 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Icon size={16} />
                  {key === 'schools' ? 'Écoles' :
                   key === 'transport' ? 'Transports' :
                   key === 'shopping' ? 'Commerces' :
                   key === 'restaurants' ? 'Restaurants' :
                   key === 'parks' ? 'Parcs' :
                   key === 'healthcare' ? 'Santé' :
                   key === 'safety' ? 'Sécurité' : key}
                </button>
              ))}
            </div>

            {/* Category Content */}
            <div style={{
              padding: '24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
            }}>
              {activeCategory === 'transport' && (
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                    Transports à proximité
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {neighborhoodData.transport.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '16px',
                          background: 'var(--bg-primary)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: item.type === 'metro' ? '#003DA5' :
                                       item.type === 'rer' ? '#1E90FF' :
                                       item.type === 'bus' ? '#20B2AA' :
                                       '#22c55e',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            {item.type === 'metro' ? <Train size={20} style={{ color: 'white' }} /> :
                             item.type === 'rer' ? <Train size={20} style={{ color: 'white' }} /> :
                             item.type === 'bus' ? <Bus size={20} style={{ color: 'white' }} /> :
                             <Bike size={20} style={{ color: 'white' }} />}
                          </div>
                          <div>
                            <p style={{ fontWeight: '600', fontSize: '14px' }}>{item.name}</p>
                            {item.lines && (
                              <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                                {item.lines.map(line => (
                                  <span
                                    key={line}
                                    style={{
                                      padding: '2px 8px',
                                      background: 'var(--bg-card)',
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      fontWeight: '600',
                                    }}
                                  >
                                    {line}
                                  </span>
                                ))}
                              </div>
                            )}
                            {item.bikes && (
                              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                {item.bikes} vélos disponibles
                              </p>
                            )}
                          </div>
                        </div>
                        <span style={{
                          padding: '6px 12px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          color: '#3b82f6',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '600',
                        }}>
                          {item.distance}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeCategory === 'schools' && (
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                    Établissements scolaires
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {neighborhoodData.schools.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '16px',
                          background: 'var(--bg-primary)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(139, 92, 246, 0.1)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <School size={20} style={{ color: '#8b5cf6' }} />
                          </div>
                          <div>
                            <p style={{ fontWeight: '600', fontSize: '14px' }}>{item.name}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {item.type}
                              </span>
                              <span style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '2px',
                                fontSize: '12px',
                                color: 'var(--gold)',
                              }}>
                                <Star size={12} fill="var(--gold)" />
                                {item.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span style={{
                          padding: '6px 12px',
                          background: 'rgba(139, 92, 246, 0.1)',
                          color: '#8b5cf6',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '600',
                        }}>
                          {item.distance}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeCategory === 'shopping' && (
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                    Commerces
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {neighborhoodData.shopping.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '16px',
                          background: 'var(--bg-primary)',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'rgba(249, 115, 22, 0.1)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <ShoppingBag size={20} style={{ color: '#f97316' }} />
                          </div>
                          <div>
                            <p style={{ fontWeight: '600', fontSize: '14px' }}>{item.name}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.type}</p>
                          </div>
                        </div>
                        <span style={{
                          padding: '6px 12px',
                          background: 'rgba(249, 115, 22, 0.1)',
                          color: '#f97316',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '600',
                        }}>
                          {item.distance}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar structure for other categories */}
              {activeCategory === 'restaurants' && (
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Restaurants</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {neighborhoodData.restaurants.map((item, idx) => (
                      <div key={idx} style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', background: 'rgba(236, 72, 153, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Coffee size={20} style={{ color: '#ec4899' }} />
                          </div>
                          <div>
                            <p style={{ fontWeight: '600', fontSize: '14px' }}>{item.name}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.type}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '12px', color: 'var(--gold)' }}>
                                <Star size={12} fill="var(--gold)" />{item.rating}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span style={{ padding: '6px 12px', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>{item.distance}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeCategory === 'parks' && (
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Espaces verts</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {neighborhoodData.parks.map((item, idx) => (
                      <div key={idx} style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Trees size={20} style={{ color: '#10b981' }} />
                          </div>
                          <div>
                            <p style={{ fontWeight: '600', fontSize: '14px' }}>{item.name}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.type} {item.area && `· ${item.area}`}</p>
                          </div>
                        </div>
                        <span style={{ padding: '6px 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>{item.distance}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeCategory === 'healthcare' && (
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Santé</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {neighborhoodData.healthcare.map((item, idx) => (
                      <div key={idx} style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Cross size={20} style={{ color: '#ef4444' }} />
                          </div>
                          <div>
                            <p style={{ fontWeight: '600', fontSize: '14px' }}>{item.name}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.type} {item.open24h && '· Ouvert 24h/24'}</p>
                          </div>
                        </div>
                        <span style={{ padding: '6px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '20px', fontSize: '13px', fontWeight: '600' }}>{item.distance}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeCategory === 'safety' && (
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Sécurité</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ padding: '20px', background: 'var(--bg-primary)', borderRadius: '12px', textAlign: 'center' }}>
                      <Shield size={32} style={{ color: '#22c55e', marginBottom: '8px' }} />
                      <p style={{ fontSize: '24px', fontWeight: '700', color: '#22c55e' }}>{neighborhoodData.safety.crimeIndex}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Indice criminalité</p>
                    </div>
                    <div style={{ padding: '20px', background: 'var(--bg-primary)', borderRadius: '12px', textAlign: 'center' }}>
                      <Building2 size={32} style={{ color: '#3b82f6', marginBottom: '8px' }} />
                      <p style={{ fontSize: '24px', fontWeight: '700' }}>{neighborhoodData.safety.policeStation}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Commissariat</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Generated Text */}
          <div style={{
            padding: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            height: 'fit-content',
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
              <button
                onClick={copyToClipboard}
                style={{
                  padding: '8px 16px',
                  background: copied ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: copied ? '#22c55e' : 'var(--text-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copié !' : 'Copier'}
              </button>
            </div>
            <div style={{
              padding: '16px',
              background: 'var(--bg-primary)',
              borderRadius: '12px',
              whiteSpace: 'pre-wrap',
              fontSize: '13px',
              lineHeight: '1.7',
              maxHeight: '500px',
              overflowY: 'auto',
            }}>
              {generatedText}
            </div>
            <button
              style={{
                width: '100%',
                marginTop: '16px',
                padding: '14px',
                background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                border: 'none',
                borderRadius: '10px',
                color: 'black',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <Plus size={16} />
              Ajouter à l'annonce
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default NeighborhoodInfo;
