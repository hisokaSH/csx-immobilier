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
  Search,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Building2,
  Bus,
  Bike,
  Coffee,
  Car,
  Fuel,
  Pill,
  Store,
  Landmark,
  Church,
  Info,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// OpenStreetMap POI categories with Overpass tags
const poiCategories = {
  transport: {
    label: 'Transports',
    icon: Train,
    color: '#3b82f6',
    queries: [
      { tag: 'railway=station', label: 'Gare', icon: Train },
      { tag: 'railway=halt', label: 'Arrêt train', icon: Train },
      { tag: 'highway=bus_stop', label: 'Arrêt de bus', icon: Bus },
      { tag: 'amenity=bus_station', label: 'Gare routière', icon: Bus },
      { tag: 'amenity=ferry_terminal', label: 'Ferry', icon: Train },
      { tag: 'amenity=bicycle_rental', label: 'Vélos', icon: Bike },
      { tag: 'amenity=car_rental', label: 'Location voiture', icon: Car },
      { tag: 'amenity=fuel', label: 'Station essence', icon: Fuel },
      { tag: 'amenity=parking', label: 'Parking', icon: Car },
    ]
  },
  schools: {
    label: 'Écoles',
    icon: School,
    color: '#22c55e',
    queries: [
      { tag: 'amenity=school', label: 'École', icon: School },
      { tag: 'amenity=kindergarten', label: 'Maternelle', icon: School },
      { tag: 'amenity=college', label: 'Collège/Lycée', icon: School },
      { tag: 'amenity=university', label: 'Université', icon: School },
      { tag: 'amenity=library', label: 'Bibliothèque', icon: School },
    ]
  },
  shopping: {
    label: 'Commerces',
    icon: ShoppingBag,
    color: '#f59e0b',
    queries: [
      { tag: 'shop=supermarket', label: 'Supermarché', icon: ShoppingBag },
      { tag: 'shop=convenience', label: 'Épicerie', icon: Store },
      { tag: 'shop=bakery', label: 'Boulangerie', icon: Store },
      { tag: 'shop=butcher', label: 'Boucherie', icon: Store },
      { tag: 'shop=mall', label: 'Centre commercial', icon: Building2 },
      { tag: 'amenity=marketplace', label: 'Marché', icon: Store },
      { tag: 'amenity=bank', label: 'Banque', icon: Landmark },
      { tag: 'amenity=atm', label: 'Distributeur', icon: Landmark },
    ]
  },
  restaurants: {
    label: 'Restaurants',
    icon: Utensils,
    color: '#ec4899',
    queries: [
      { tag: 'amenity=restaurant', label: 'Restaurant', icon: Utensils },
      { tag: 'amenity=cafe', label: 'Café', icon: Coffee },
      { tag: 'amenity=fast_food', label: 'Fast-food', icon: Utensils },
      { tag: 'amenity=bar', label: 'Bar', icon: Coffee },
    ]
  },
  parks: {
    label: 'Parcs',
    icon: Trees,
    color: '#10b981',
    queries: [
      { tag: 'leisure=park', label: 'Parc', icon: Trees },
      { tag: 'leisure=garden', label: 'Jardin', icon: Trees },
      { tag: 'leisure=playground', label: 'Aire de jeux', icon: Trees },
      { tag: 'leisure=sports_centre', label: 'Centre sportif', icon: Trees },
      { tag: 'leisure=swimming_pool', label: 'Piscine', icon: Trees },
      { tag: 'natural=beach', label: 'Plage', icon: Trees },
    ]
  },
  healthcare: {
    label: 'Santé',
    icon: Cross,
    color: '#ef4444',
    queries: [
      { tag: 'amenity=hospital', label: 'Hôpital', icon: Cross },
      { tag: 'amenity=clinic', label: 'Clinique', icon: Cross },
      { tag: 'amenity=pharmacy', label: 'Pharmacie', icon: Pill },
      { tag: 'amenity=doctors', label: 'Médecin', icon: Cross },
      { tag: 'amenity=dentist', label: 'Dentiste', icon: Cross },
    ]
  },
  other: {
    label: 'Autres',
    icon: Landmark,
    color: '#8b5cf6',
    queries: [
      { tag: 'amenity=post_office', label: 'Poste', icon: Building2 },
      { tag: 'amenity=police', label: 'Police', icon: Shield },
      { tag: 'amenity=fire_station', label: 'Pompiers', icon: Shield },
      { tag: 'amenity=place_of_worship', label: 'Lieu de culte', icon: Church },
      { tag: 'tourism=hotel', label: 'Hôtel', icon: Building2 },
      { tag: 'tourism=information', label: 'Office tourisme', icon: Info },
    ]
  },
};

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
};

// Format distance for display
const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
};

function NeighborhoodInfo() {
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [neighborhoodData, setNeighborhoodData] = useState(null);
  const [activeCategory, setActiveCategory] = useState('transport');
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [coordinates, setCoordinates] = useState(null);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('listings')
        .select('id, title, location')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data) {
        setListings(data);
      }
    } catch (err) {
      console.error('Error loading listings:', err);
    }
  };

  // Geocode address using Nominatim (OpenStreetMap)
  const geocodeAddress = async (searchAddress) => {
    setLoadingStep('Géocodage de l\'adresse...');
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=1`,
      {
        headers: {
          'User-Agent': 'CSX-Immobilier/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Erreur de géocodage');
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('Adresse non trouvée. Essayez avec plus de détails (ville, code postal).');
    }

    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  };

  // Fetch POIs from Overpass API (OpenStreetMap)
  const fetchPOIs = async (lat, lon, category, radius = 1500) => {
    const categoryData = poiCategories[category];
    if (!categoryData) return [];

    // Build Overpass query for all tags in this category
    const tagQueries = categoryData.queries.map(q => {
      const [key, value] = q.tag.split('=');
      return `node["${key}"="${value}"](around:${radius},${lat},${lon});
              way["${key}"="${value}"](around:${radius},${lat},${lon});`;
    }).join('\n');

    const overpassQuery = `
      [out:json][timeout:25];
      (
        ${tagQueries}
      );
      out center tags;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(overpassQuery)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      console.error('Overpass API error for', category);
      return [];
    }

    const data = await response.json();
    
    // Process results
    const pois = data.elements.map(element => {
      const poiLat = element.lat || element.center?.lat;
      const poiLon = element.lon || element.center?.lon;
      
      if (!poiLat || !poiLon) return null;

      const distance = calculateDistance(lat, lon, poiLat, poiLon);
      
      // Determine POI type
      let poiType = 'Lieu';
      let icon = Landmark;
      
      for (const query of categoryData.queries) {
        const [key, value] = query.tag.split('=');
        if (element.tags && element.tags[key] === value) {
          poiType = query.label;
          icon = query.icon;
          break;
        }
      }

      return {
        id: element.id,
        name: element.tags?.name || element.tags?.['name:fr'] || poiType,
        type: poiType,
        icon,
        distance,
        distanceText: formatDistance(distance),
        lat: poiLat,
        lon: poiLon,
        tags: element.tags || {},
      };
    }).filter(Boolean);

    // Sort by distance and remove duplicates
    const uniquePois = [];
    const seenNames = new Set();
    
    pois.sort((a, b) => a.distance - b.distance);
    
    for (const poi of pois) {
      const key = `${poi.name}-${poi.type}`;
      if (!seenNames.has(key)) {
        seenNames.add(key);
        uniquePois.push(poi);
      }
    }

    return uniquePois.slice(0, 15); // Max 15 per category
  };

  // Analyze neighborhood
  const analyzeNeighborhood = async () => {
    if (!address.trim()) {
      setError('Veuillez entrer une adresse');
      return;
    }

    setIsLoading(true);
    setError(null);
    setNeighborhoodData(null);
    setGeneratedText('');

    try {
      // Step 1: Geocode address
      const coords = await geocodeAddress(address);
      setCoordinates(coords);

      // Step 2: Fetch POIs for all categories
      setLoadingStep('Recherche des points d\'intérêt...');
      
      const results = {};
      const categories = Object.keys(poiCategories);
      
      for (let i = 0; i < categories.length; i++) {
        const cat = categories[i];
        setLoadingStep(`Analyse: ${poiCategories[cat].label} (${i + 1}/${categories.length})...`);
        
        try {
          results[cat] = await fetchPOIs(coords.lat, coords.lon, cat);
        } catch (err) {
          console.error(`Error fetching ${cat}:`, err);
          results[cat] = [];
        }
        
        // Small delay to avoid rate limiting
        if (i < categories.length - 1) {
          await new Promise(r => setTimeout(r, 500));
        }
      }

      // Calculate scores based on real data
      const scores = {};
      for (const [cat, pois] of Object.entries(results)) {
        // Score based on number of nearby POIs and their proximity
        const count = pois.length;
        const avgDistance = count > 0 
          ? pois.reduce((sum, p) => sum + p.distance, 0) / count 
          : 2000;
        
        // Score formula: more POIs nearby = higher score
        let score = Math.min(100, Math.round((count * 8) + (1500 - avgDistance) / 20));
        score = Math.max(0, Math.min(100, score));
        scores[cat] = score;
      }
      
      // Overall score
      const validScores = Object.values(scores).filter(s => s > 0);
      scores.overall = validScores.length > 0
        ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
        : 0;

      setNeighborhoodData({
        address: coords.displayName,
        scores,
        pois: results,
      });

      // Generate description
      generateDescription(coords, results, scores);

    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  // Generate text description based on real data
  const generateDescription = (coords, pois, scores) => {
    const lines = [];
    
    lines.push(`🏠 **Analyse du quartier**`);
    lines.push(`📍 **Localisation** - Score global: ${scores.overall}/100\n`);

    // Transport
    if (pois.transport && pois.transport.length > 0) {
      const nearest = pois.transport[0];
      lines.push(`🚌 **Transports** (${scores.transport}/100)`);
      lines.push(`${pois.transport.length} point(s) de transport à proximité. Le plus proche: ${nearest.name} à ${nearest.distanceText}.\n`);
    } else {
      lines.push(`🚌 **Transports** (0/100)`);
      lines.push(`Aucun transport en commun détecté dans un rayon de 1.5km.\n`);
    }

    // Schools
    if (pois.schools && pois.schools.length > 0) {
      const nearest = pois.schools[0];
      lines.push(`🎓 **Écoles** (${scores.schools}/100)`);
      lines.push(`${pois.schools.length} établissement(s) scolaire(s) à proximité. Le plus proche: ${nearest.name} à ${nearest.distanceText}.\n`);
    } else {
      lines.push(`🎓 **Écoles** (0/100)`);
      lines.push(`Aucun établissement scolaire détecté à proximité.\n`);
    }

    // Shopping
    if (pois.shopping && pois.shopping.length > 0) {
      const nearest = pois.shopping[0];
      lines.push(`🛒 **Commerces** (${scores.shopping}/100)`);
      lines.push(`${pois.shopping.length} commerce(s) à proximité. Le plus proche: ${nearest.name} à ${nearest.distanceText}.\n`);
    } else {
      lines.push(`🛒 **Commerces** (0/100)`);
      lines.push(`Peu de commerces détectés à proximité.\n`);
    }

    // Parks
    if (pois.parks && pois.parks.length > 0) {
      const nearest = pois.parks[0];
      lines.push(`🌳 **Espaces verts** (${scores.parks}/100)`);
      lines.push(`${pois.parks.length} espace(s) vert(s) ou de loisirs. Le plus proche: ${nearest.name} à ${nearest.distanceText}.\n`);
    }

    // Healthcare
    if (pois.healthcare && pois.healthcare.length > 0) {
      const nearest = pois.healthcare[0];
      lines.push(`🏥 **Santé** (${scores.healthcare}/100)`);
      lines.push(`${pois.healthcare.length} service(s) de santé. Le plus proche: ${nearest.name} à ${nearest.distanceText}.\n`);
    }

    setGeneratedText(lines.join('\n'));
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(generatedText.replace(/\*\*/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleSelectListing = (listing) => {
    setSelectedListing(listing);
    setAddress(listing.location || listing.title);
  };

  const getCategoryPOIs = () => {
    if (!neighborhoodData?.pois) return [];
    return neighborhoodData.pois[activeCategory] || [];
  };

  const ScoreCircle = ({ score, label, color }) => {
    const circumference = 2 * Math.PI * 36;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    
    return (
      <div style={{ textAlign: 'center' }}>
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle
            cx="45"
            cy="45"
            r="36"
            fill="none"
            stroke="var(--border-color)"
            strokeWidth="8"
          />
          <circle
            cx="45"
            cy="45"
            r="36"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              transition: 'stroke-dashoffset 0.5s ease',
            }}
          />
          <text
            x="45"
            y="50"
            textAnchor="middle"
            style={{
              fill: 'var(--text-primary)',
              fontSize: '18px',
              fontWeight: '600',
            }}
          >
            {score}
          </text>
        </svg>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{label}</p>
      </div>
    );
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
            <MapPin size={24} style={{ color: 'var(--gold)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Infos Quartier</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Données réelles OpenStreetMap
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
          <MapPin size={14} style={{ color: '#22c55e' }} />
          <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: '500' }}>
            Données OpenStreetMap en temps réel
          </span>
          <a 
            href="https://www.openstreetmap.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#22c55e' }}
          >
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Search Section */}
      <div style={{
        padding: '24px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        marginBottom: '24px',
      }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>
          Adresse à analyser
        </label>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }} />
            <input
              type="text"
              placeholder="Ex: 15 rue de la Paix, 75002 Paris"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && analyzeNeighborhood()}
              style={{
                width: '100%',
                padding: '14px 14px 14px 44px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                color: 'var(--text-primary)',
                fontSize: '14px',
              }}
            />
          </div>
          <button
            onClick={analyzeNeighborhood}
            disabled={isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 24px',
              background: isLoading ? 'var(--bg-tertiary)' : 'var(--gold)',
              border: 'none',
              borderRadius: '10px',
              color: isLoading ? 'var(--text-muted)' : 'var(--bg-primary)',
              fontSize: '14px',
              fontWeight: '600',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                Analyse...
              </>
            ) : (
              <>
                <MapPin size={18} />
                Analyser
              </>
            )}
          </button>
        </div>

        {/* Listings shortcuts */}
        {listings.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Ou sélectionnez un de vos biens :
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {listings.slice(0, 5).map(listing => (
                <button
                  key={listing.id}
                  onClick={() => handleSelectListing(listing)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: selectedListing?.id === listing.id ? 'rgba(212, 175, 55, 0.15)' : 'var(--bg-tertiary)',
                    border: `1px solid ${selectedListing?.id === listing.id ? 'var(--gold)' : 'var(--border-color)'}`,
                    borderRadius: '8px',
                    color: selectedListing?.id === listing.id ? 'var(--gold)' : 'var(--text-secondary)',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <Building2 size={14} />
                  {listing.title?.substring(0, 20) || 'Bien'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && loadingStep && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <Loader2 size={16} style={{ color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
            <span style={{ fontSize: '13px', color: '#3b82f6' }}>{loadingStep}</span>
          </div>
        )}

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
      {neighborhoodData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
          {/* Left Column - Scores & POIs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Score Overview */}
            <div style={{
              padding: '24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
                Score du quartier
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px' }}>
                <ScoreCircle 
                  score={neighborhoodData.scores.overall} 
                  label="Global" 
                  color="var(--gold)" 
                />
                <ScoreCircle 
                  score={neighborhoodData.scores.transport || 0} 
                  label="Transport" 
                  color="#3b82f6" 
                />
                <ScoreCircle 
                  score={neighborhoodData.scores.schools || 0} 
                  label="Écoles" 
                  color="#22c55e" 
                />
                <ScoreCircle 
                  score={neighborhoodData.scores.shopping || 0} 
                  label="Commerces" 
                  color="#f59e0b" 
                />
                <ScoreCircle 
                  score={neighborhoodData.scores.healthcare || 0} 
                  label="Santé" 
                  color="#ef4444" 
                />
                <ScoreCircle 
                  score={neighborhoodData.scores.parks || 0} 
                  label="Parcs" 
                  color="#10b981" 
                />
              </div>
            </div>

            {/* Category Tabs */}
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
            }}>
              {Object.entries(poiCategories).map(([key, cat]) => {
                const Icon = cat.icon;
                const count = neighborhoodData.pois[key]?.length || 0;
                return (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 14px',
                      background: activeCategory === key ? cat.color : 'var(--bg-card)',
                      border: `1px solid ${activeCategory === key ? cat.color : 'var(--border-color)'}`,
                      borderRadius: '10px',
                      color: activeCategory === key ? 'white' : 'var(--text-secondary)',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
                    <Icon size={16} />
                    {cat.label}
                    <span style={{
                      padding: '2px 6px',
                      background: activeCategory === key ? 'rgba(255,255,255,0.2)' : 'var(--bg-tertiary)',
                      borderRadius: '4px',
                      fontSize: '11px',
                    }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* POI List */}
            <div style={{
              padding: '24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>
                {poiCategories[activeCategory]?.label} à proximité
              </h3>
              
              {getCategoryPOIs().length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {getCategoryPOIs().map((poi, idx) => {
                    const Icon = poi.icon || Landmark;
                    return (
                      <div key={poi.id || idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '14px',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '10px',
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: `${poiCategories[activeCategory]?.color}20`,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <Icon size={20} style={{ color: poiCategories[activeCategory]?.color }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '14px', fontWeight: '500' }}>{poi.name}</p>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{poi.type}</p>
                        </div>
                        <div style={{
                          padding: '6px 12px',
                          background: `${poiCategories[activeCategory]?.color}15`,
                          borderRadius: '6px',
                          color: poiCategories[activeCategory]?.color,
                          fontSize: '13px',
                          fontWeight: '600',
                        }}>
                          {poi.distanceText}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                }}>
                  <AlertCircle size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p style={{ fontSize: '14px' }}>
                    Aucun {poiCategories[activeCategory]?.label.toLowerCase()} trouvé dans un rayon de 1.5km
                  </p>
                  <p style={{ fontSize: '12px', marginTop: '8px' }}>
                    Les données proviennent d'OpenStreetMap. Certains lieux peuvent ne pas être référencés.
                  </p>
                </div>
              )}
            </div>

            {/* Map Link */}
            {coordinates && (
              <a
                href={`https://www.openstreetmap.org/?mlat=${coordinates.lat}&mlon=${coordinates.lon}#map=16/${coordinates.lat}/${coordinates.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  textDecoration: 'none',
                }}
              >
                <MapPin size={18} />
                Voir sur OpenStreetMap
                <ExternalLink size={14} />
              </a>
            )}
          </div>

          {/* Right Column - Generated Description */}
          <div style={{
            padding: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            height: 'fit-content',
            position: 'sticky',
            top: '24px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600' }}>Description générée</h3>
              <button
                onClick={handleCopyText}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  background: copied ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-tertiary)',
                  border: `1px solid ${copied ? 'rgba(34, 197, 94, 0.3)' : 'var(--border-color)'}`,
                  borderRadius: '6px',
                  color: copied ? '#22c55e' : 'var(--text-secondary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copié !' : 'Copier'}
              </button>
            </div>

            <div style={{
              padding: '16px',
              background: 'var(--bg-tertiary)',
              borderRadius: '10px',
              maxHeight: '500px',
              overflowY: 'auto',
            }}>
              {generatedText ? (
                <div style={{
                  fontSize: '13px',
                  lineHeight: '1.7',
                  color: 'var(--text-secondary)',
                  whiteSpace: 'pre-wrap',
                }}>
                  {generatedText.split('\n').map((line, idx) => {
                    if (line.includes('**')) {
                      const parts = line.split('**');
                      return (
                        <p key={idx} style={{ marginBottom: '8px' }}>
                          {parts.map((part, i) => 
                            i % 2 === 1 ? <strong key={i} style={{ color: 'var(--text-primary)' }}>{part}</strong> : part
                          )}
                        </p>
                      );
                    }
                    return <p key={idx} style={{ marginBottom: line ? '8px' : '4px' }}>{line}</p>;
                  })}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Analysez une adresse pour générer une description du quartier.
                </p>
              )}
            </div>

            {/* Add to listing button */}
            {generatedText && (
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '14px',
                  marginTop: '16px',
                  background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'var(--bg-primary)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
                onClick={handleCopyText}
              >
                <Check size={18} />
                Ajouter à l'annonce
              </button>
            )}

            {/* Data notice */}
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '8px',
            }}>
              <p style={{ fontSize: '11px', color: '#3b82f6', lineHeight: '1.5' }}>
                ℹ️ Les données proviennent d'OpenStreetMap, une base de données collaborative. 
                La couverture peut varier selon les régions. Les scores sont calculés en fonction 
                du nombre et de la proximité des points d'intérêt détectés.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!neighborhoodData && !isLoading && (
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
            <MapPin size={36} style={{ color: 'var(--gold)' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Analysez un quartier
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '400px', margin: '0 auto' }}>
            Entrez une adresse pour découvrir les transports, commerces, écoles et services à proximité. 
            Toutes les données sont réelles et proviennent d'OpenStreetMap.
          </p>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default NeighborhoodInfo;
