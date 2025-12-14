import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calculator,
  MapPin,
  Home,
  Square,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  Building2,
  Sparkles,
  Check,
  AlertCircle,
  Search,
  Calendar,
  Database,
  ExternalLink,
  Globe,
  Info
} from 'lucide-react';

const propertyTypes = [
  { value: 'Appartement', label: 'Appartement' },
  { value: 'Maison', label: 'Maison' },
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

// DOM-TOM Market Data - Updated December 2025
// Sources: PAP.fr, SeLoger, Netvendeur, efficity, AV-Transaction
const domTomPrices = {
  '971': { // Guadeloupe
    name: 'Guadeloupe',
    appartement: { low: 2521, mid: 3200, high: 3818 },
    maison: { low: 2763, mid: 3100, high: 3532 },
    cities: {
      'Pointe-à-Pitre': { appartement: 2800, maison: 2600 },
      'Les Abymes': { appartement: 2600, maison: 2400 },
      'Le Gosier': { appartement: 3500, maison: 3200 },
      'Sainte-Anne': { appartement: 3800, maison: 3500 },
      'Baie-Mahault': { appartement: 3200, maison: 3000 },
      'Saint-François': { appartement: 4000, maison: 3800 },
    },
    source: 'PAP.fr, SeLoger - Décembre 2025',
    lastUpdate: '2025-12',
  },
  '972': { // Martinique
    name: 'Martinique',
    appartement: { low: 2087, mid: 3300, high: 5313 },
    maison: { low: 1522, mid: 3000, high: 4904 },
    cities: {
      'Fort-de-France': { appartement: 3200, maison: 2800 },
      'Le Lamentin': { appartement: 3000, maison: 2700 },
      'Schoelcher': { appartement: 3500, maison: 3200 },
      'Les Trois-Îlets': { appartement: 4200, maison: 4000 },
      'Le Robert': { appartement: 2800, maison: 2500 },
      'Sainte-Anne': { appartement: 3800, maison: 3500 },
    },
    source: 'efficity, Netvendeur - Novembre 2025',
    lastUpdate: '2025-11',
  },
  '973': { // Guyane
    name: 'Guyane',
    appartement: { low: 2047, mid: 2600, high: 3799 },
    maison: { low: 1655, mid: 2400, high: 3071 },
    cities: {
      'Cayenne': { appartement: 2636, maison: 2504 },
      'Kourou': { appartement: 2400, maison: 2190 },
      'Matoury': { appartement: 2500, maison: 2390 },
      'Remire-Montjoly': { appartement: 3200, maison: 2980 },
      'Saint-Laurent-du-Maroni': { appartement: 2800, maison: 2600 },
    },
    source: 'Orpi, efficity - Novembre 2025',
    lastUpdate: '2025-11',
  },
  '974': { // La Réunion
    name: 'La Réunion',
    appartement: { low: 1978, mid: 2950, high: 5244 },
    maison: { low: 1597, mid: 2800, high: 4415 },
    cities: {
      'Saint-Denis': { appartement: 3200, maison: 3000 },
      'Saint-Pierre': { appartement: 2800, maison: 2600 },
      'Saint-Paul': { appartement: 3000, maison: 2800 },
      'Le Tampon': { appartement: 2500, maison: 2300 },
      'Saint-André': { appartement: 2400, maison: 2200 },
      'Saint-Gilles': { appartement: 4000, maison: 3800 },
    },
    source: 'PAP.fr, AV-Transaction - Décembre 2025',
    lastUpdate: '2025-12',
  },
  '976': { // Mayotte
    name: 'Mayotte',
    appartement: { low: 1671, mid: 2900, high: 7750 },
    maison: { low: 998, mid: 2200, high: 4163 },
    cities: {
      'Mamoudzou': { appartement: 3200, maison: 2500 },
      'Koungou': { appartement: 2800, maison: 2200 },
      'Dzaoudzi': { appartement: 3000, maison: 2400 },
    },
    source: 'Netvendeur - Septembre 2025',
    lastUpdate: '2025-09',
  },
  '978': { // Saint-Martin
    name: 'Saint-Martin',
    appartement: { low: 3472, mid: 4960, high: 6448 },
    maison: { low: 4300, mid: 6142, high: 7900 },
    cities: {
      'Marigot': { appartement: 5000, maison: 6000 },
      'Grand-Case': { appartement: 5500, maison: 6500 },
      'Sandy Ground': { appartement: 5200, maison: 6200 },
      'Quartier d\'Orléans': { appartement: 4500, maison: 5500 },
    },
    source: 'Netvendeur, PAP.fr - Juillet 2025',
    lastUpdate: '2025-07',
  },
};

// Check if postal code is DOM-TOM
const isDomTom = (postalCode) => {
  if (!postalCode) return false;
  const prefix = postalCode.substring(0, 3);
  return ['971', '972', '973', '974', '976', '978'].includes(prefix);
};

const getDomTomCode = (postalCode) => {
  if (!postalCode) return null;
  const prefix = postalCode.substring(0, 3);
  if (['971', '972', '973', '974', '976'].includes(prefix)) return prefix;
  if (postalCode.startsWith('978') || postalCode.startsWith('97150')) return '978';
  return null;
};

// French departments (Metropolitan France)
const departments = [
  { code: '75', name: 'Paris (75)' },
  { code: '92', name: 'Hauts-de-Seine (92)' },
  { code: '93', name: 'Seine-Saint-Denis (93)' },
  { code: '94', name: 'Val-de-Marne (94)' },
  { code: '69', name: 'Rhône - Lyon (69)' },
  { code: '13', name: 'Bouches-du-Rhône (13)' },
  { code: '33', name: 'Gironde - Bordeaux (33)' },
  { code: '06', name: 'Alpes-Maritimes - Nice (06)' },
  { code: '31', name: 'Haute-Garonne - Toulouse (31)' },
  { code: '44', name: 'Loire-Atlantique - Nantes (44)' },
  { code: '59', name: 'Nord - Lille (59)' },
  { code: '67', name: 'Bas-Rhin - Strasbourg (67)' },
  { code: '34', name: 'Hérault - Montpellier (34)' },
  { code: '35', name: 'Ille-et-Vilaine - Rennes (35)' },
  { code: '76', name: 'Seine-Maritime - Rouen (76)' },
  // DOM-TOM
  { code: '971', name: '🌴 Guadeloupe (971)', isDomTom: true },
  { code: '972', name: '🌴 Martinique (972)', isDomTom: true },
  { code: '973', name: '🌴 Guyane (973)', isDomTom: true },
  { code: '974', name: '🌴 La Réunion (974)', isDomTom: true },
  { code: '976', name: '🌴 Mayotte (976)', isDomTom: true },
  { code: '978', name: '🌴 Saint-Martin (978)', isDomTom: true },
];

function PropertyValuation() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [result, setResult] = useState(null);
  const [comparables, setComparables] = useState([]);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    propertyType: 'Appartement',
    postalCode: '',
    city: '',
    department: '75',
    area: '',
    rooms: '',
    condition: 'good',
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

  // Fetch real data from DVF API
  const fetchDVFData = async () => {
    const { postalCode, city, propertyType, area } = formData;
    
    if (!area) {
      setError('Veuillez entrer la surface du bien');
      return null;
    }

    const targetArea = parseFloat(area);
    
    try {
      // Build query URL - DVF API from data.gouv.fr
      let url = 'https://api.cquest.org/dvf?';
      
      if (postalCode && postalCode.length === 5) {
        url += `code_postal=${postalCode}`;
      } else if (city && city.trim()) {
        url += `commune=${encodeURIComponent(city.trim())}`;
      } else {
        // Fallback to some major cities based on department
        const citiesByDept = {
          '75': 'Paris',
          '69': 'Lyon',
          '13': 'Marseille',
          '33': 'Bordeaux',
          '06': 'Nice',
          '31': 'Toulouse',
          '44': 'Nantes',
          '59': 'Lille',
          '67': 'Strasbourg',
          '34': 'Montpellier',
        };
        const defaultCity = citiesByDept[formData.department] || 'Paris';
        url += `commune=${defaultCity}`;
      }

      setLoadingStep('Connexion à la base DVF...');
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Erreur de connexion à l\'API DVF');
      }
      
      const data = await response.json();
      
      if (!data.resultats || data.resultats.length === 0) {
        throw new Error('Aucune transaction trouvée. Essayez un autre code postal ou ville.');
      }

      setLoadingStep(`${data.resultats.length} transactions trouvées, analyse...`);
      
      // Filter by property type and valid data
      let filtered = data.resultats.filter(item => {
        // Match property type
        if (propertyType === 'Appartement' && item.type_local !== 'Appartement') return false;
        if (propertyType === 'Maison' && item.type_local !== 'Maison') return false;
        
        // Must have surface and price
        if (!item.surface_reelle_bati || !item.valeur_fonciere) return false;
        if (item.surface_reelle_bati < 10) return false; // Min 10m²
        if (item.valeur_fonciere < 20000) return false; // Min 20k€
        
        return true;
      });

      if (filtered.length === 0) {
        // Try without property type filter
        filtered = data.resultats.filter(item => {
          if (!item.surface_reelle_bati || !item.valeur_fonciere) return false;
          if (item.surface_reelle_bati < 10) return false;
          if (item.valeur_fonciere < 20000) return false;
          return true;
        });
      }

      // Sort by similarity to target property (closest area first)
      filtered = filtered.map(item => {
        const areaDiff = Math.abs(item.surface_reelle_bati - targetArea);
        return { ...item, similarity: areaDiff };
      }).sort((a, b) => a.similarity - b.similarity);

      // Take top 30 most similar
      const similar = filtered.slice(0, 30);
      
      if (similar.length === 0) {
        throw new Error('Aucun bien comparable trouvé dans cette zone');
      }

      return similar;
      
    } catch (err) {
      console.error('DVF API Error:', err);
      throw err;
    }
  };

  const calculateValuation = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setComparables([]);
    
    try {
      const targetArea = parseFloat(formData.area);
      
      if (!targetArea || targetArea <= 0) {
        throw new Error('Veuillez entrer une surface valide');
      }
      
      // Check if DOM-TOM
      const domTomCode = getDomTomCode(formData.postalCode) || 
        (departments.find(d => d.code === formData.department)?.isDomTom ? formData.department : null);
      
      if (domTomCode && domTomPrices[domTomCode]) {
        // Use DOM-TOM market data
        setLoadingStep('Analyse du marché DOM-TOM...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const marketData = domTomPrices[domTomCode];
        const propertyKey = formData.propertyType === 'Appartement' ? 'appartement' : 'maison';
        const priceData = marketData[propertyKey];
        
        // Check if we have city-specific data
        let avgPricePerSqm = priceData.mid;
        let cityMatch = null;
        
        if (formData.city && marketData.cities) {
          const cityLower = formData.city.toLowerCase().trim();
          for (const [cityName, cityPrices] of Object.entries(marketData.cities)) {
            if (cityName.toLowerCase().includes(cityLower) || cityLower.includes(cityName.toLowerCase())) {
              avgPricePerSqm = cityPrices[propertyKey];
              cityMatch = cityName;
              break;
            }
          }
        }
        
        // Base estimate
        let estimatedPrice = targetArea * avgPricePerSqm;
        
        // Apply condition multiplier
        const conditionData = conditions.find(c => c.value === formData.condition);
        if (conditionData) {
          estimatedPrice *= conditionData.multiplier;
        }
        
        // Add feature values
        const featureValue = formData.features.reduce((sum, featureId) => {
          const feature = features.find(f => f.id === featureId);
          return sum + (feature?.value || 0);
        }, 0);
        estimatedPrice += featureValue;
        
        // Calculate range based on market variance
        const rangePercent = 0.12; // 12% range for DOM-TOM
        const lowEstimate = Math.round(estimatedPrice * (1 - rangePercent));
        const highEstimate = Math.round(estimatedPrice * (1 + rangePercent));
        const midEstimate = Math.round(estimatedPrice);
        
        const pricePerSqm = Math.round(midEstimate / targetArea);
        const marketComparison = ((pricePerSqm - avgPricePerSqm) / avgPricePerSqm) * 100;
        
        setResult({
          lowEstimate,
          midEstimate,
          highEstimate,
          pricePerSqm,
          marketAvg: avgPricePerSqm,
          marketComparison,
          confidence: cityMatch ? 78 : 70,
          totalTransactions: 'N/A (données agrégées)',
          dateRange: { from: marketData.lastUpdate, to: 'Actualisé' },
          isDomTom: true,
          region: marketData.name,
          cityMatch,
          dataSource: marketData.source,
        });
        
        // Generate synthetic comparables based on market data
        setComparables([
          {
            type: 'Marché',
            description: `Prix moyen ${formData.propertyType.toLowerCase()}s en ${marketData.name}`,
            pricePerSqm: priceData.mid,
            range: `${priceData.low.toLocaleString('fr-FR')} - ${priceData.high.toLocaleString('fr-FR')} €/m²`,
          },
          ...(cityMatch ? [{
            type: 'Ville',
            description: `Prix spécifique à ${cityMatch}`,
            pricePerSqm: avgPricePerSqm,
            range: 'Données locales',
          }] : []),
        ]);
        
      } else {
        // Use DVF for metropolitan France
        const dvfData = await fetchDVFData();
        
        if (!dvfData || dvfData.length === 0) {
          throw new Error('Impossible de récupérer les données DVF');
        }

        setLoadingStep('Calcul de l\'estimation...');
        
        // Calculate price per m² from real transactions
        const pricesPerSqm = dvfData.map(item => item.valeur_fonciere / item.surface_reelle_bati);
        
        // Remove outliers using IQR method
        const sorted = [...pricesPerSqm].sort((a, b) => a - b);
        const q1 = sorted[Math.floor(sorted.length * 0.25)];
        const q3 = sorted[Math.floor(sorted.length * 0.75)];
        const iqr = q3 - q1;
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;
        
        const filteredPrices = pricesPerSqm.filter(p => p >= lowerBound && p <= upperBound);
        
        // Calculate median and mean
        const sortedFiltered = [...filteredPrices].sort((a, b) => a - b);
        const median = sortedFiltered[Math.floor(sortedFiltered.length / 2)];
        const mean = filteredPrices.reduce((a, b) => a + b, 0) / filteredPrices.length;
        
        // Use weighted average of median and mean
        const avgPricePerSqm = (median * 0.6 + mean * 0.4);
        
        // Base estimate
        let estimatedPrice = targetArea * avgPricePerSqm;
        
        // Apply condition multiplier
        const conditionData = conditions.find(c => c.value === formData.condition);
        if (conditionData) {
          estimatedPrice *= conditionData.multiplier;
        }
        
        // Add feature values
        const featureValue = formData.features.reduce((sum, featureId) => {
          const feature = features.find(f => f.id === featureId);
          return sum + (feature?.value || 0);
        }, 0);
        estimatedPrice += featureValue;
        
        // Calculate confidence based on data quality
        const dataQuality = Math.min(100, dvfData.length * 3);
        const areaMatch = dvfData.filter(d => Math.abs(d.surface_reelle_bati - targetArea) < targetArea * 0.3).length;
        const areaMatchBonus = Math.min(20, areaMatch * 2);
        const confidence = Math.min(95, 40 + dataQuality / 2 + areaMatchBonus);
        
        // Calculate range based on price variance
        const variance = filteredPrices.reduce((sum, p) => sum + Math.pow(p - avgPricePerSqm, 2), 0) / filteredPrices.length;
        const stdDev = Math.sqrt(variance);
        const coeffVar = stdDev / avgPricePerSqm;
        
        const rangePercent = Math.max(0.08, Math.min(0.18, coeffVar));
        
        const lowEstimate = Math.round(estimatedPrice * (1 - rangePercent));
        const highEstimate = Math.round(estimatedPrice * (1 + rangePercent));
        const midEstimate = Math.round(estimatedPrice);
        
        const pricePerSqm = Math.round(midEstimate / targetArea);
        const marketAvg = Math.round(avgPricePerSqm);
        const marketComparison = ((pricePerSqm - marketAvg) / marketAvg) * 100;
        
        // Get date range
        const dates = dvfData
          .map(d => d.date_mutation ? new Date(d.date_mutation) : null)
          .filter(d => d && !isNaN(d.getTime()));
        
        const minDate = dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
        const maxDate = dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;
        
        setResult({
          lowEstimate,
          midEstimate,
          highEstimate,
          pricePerSqm,
          marketAvg,
          marketComparison,
          confidence: Math.round(confidence),
          totalTransactions: dvfData.length,
          dateRange: minDate && maxDate ? {
            from: minDate.toLocaleDateString('fr-FR'),
            to: maxDate.toLocaleDateString('fr-FR'),
          } : null,
          isDomTom: false,
          dataSource: 'DVF (data.gouv.fr)',
        });
        
        // Store top 5 comparables for display
        setComparables(dvfData.slice(0, 5).map(item => ({
          date: item.date_mutation ? new Date(item.date_mutation).toLocaleDateString('fr-FR') : 'N/A',
          address: `${item.adresse_numero || ''} ${item.adresse_nom_voie || ''}, ${item.code_postal || ''} ${item.nom_commune || ''}`.trim(),
          price: item.valeur_fonciere,
          area: item.surface_reelle_bati,
          rooms: item.nombre_pieces_principales,
          pricePerSqm: Math.round(item.valeur_fonciere / item.surface_reelle_bati),
          type: item.type_local,
        })));
      }
      
    } catch (err) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
      setLoadingStep('');
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
            <Calculator size={24} style={{ color: 'var(--gold)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Estimation IA</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Estimation basée sur les transactions DVF réelles
            </p>
          </div>
        </div>
        
        {/* Data Source Badge */}
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '32px' }}>
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
              <div style={{ display: 'flex', gap: '8px' }}>
                {propertyTypes.map(type => (
                  <button
                    key={type.value}
                    onClick={() => setFormData({ ...formData, propertyType: type.value })}
                    style={{
                      padding: '12px 24px',
                      background: formData.propertyType === type.value ? 'var(--gold)' : 'var(--bg-tertiary)',
                      border: '1px solid ' + (formData.propertyType === type.value ? 'var(--gold)' : 'var(--border-color)'),
                      borderRadius: '8px',
                      color: formData.propertyType === type.value ? 'var(--bg-primary)' : 'var(--text-secondary)',
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

            {/* Location */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                <MapPin size={14} style={{ display: 'inline', marginRight: '6px' }} />
                Localisation
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Code postal"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value.replace(/\D/g, '').slice(0, 5) })}
                  style={{
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
                <input
                  type="text"
                  placeholder="Ville (ex: Paris, Lyon, Marseille)"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  style={{
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                Entrez un code postal OU une ville pour rechercher les transactions
              </p>
            </div>

            {/* Area & Rooms */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  <Square size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  Surface (m²) *
                </label>
                <input
                  type="number"
                  placeholder="75"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  <Home size={14} style={{ display: 'inline', marginRight: '6px' }} />
                  Pièces
                </label>
                <input
                  type="number"
                  placeholder="3"
                  value={formData.rooms}
                  onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                />
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
                      padding: '10px 14px',
                      background: formData.condition === cond.value ? 'var(--gold)' : 'var(--bg-tertiary)',
                      border: '1px solid ' + (formData.condition === cond.value ? 'var(--gold)' : 'var(--border-color)'),
                      borderRadius: '8px',
                      color: formData.condition === cond.value ? 'var(--bg-primary)' : 'var(--text-secondary)',
                      fontSize: '12px',
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
                Équipements (ajustent l'estimation)
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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

            {/* Error */}
            {error && (
              <div style={{
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

            {/* Submit */}
            <button
              onClick={calculateValuation}
              disabled={loading || !formData.area}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '16px',
                background: loading || !formData.area 
                  ? 'var(--bg-tertiary)' 
                  : 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                border: 'none',
                borderRadius: '12px',
                color: loading || !formData.area ? 'var(--text-muted)' : 'var(--bg-primary)',
                fontSize: '15px',
                fontWeight: '600',
                cursor: loading || !formData.area ? 'not-allowed' : 'pointer',
                marginTop: '8px',
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  {loadingStep || 'Analyse en cours...'}
                </>
              ) : (
                <>
                  <Search size={20} />
                  Rechercher et estimer
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        <div>
          {result ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Main Estimate Card */}
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
                  marginBottom: '20px',
                }}>
                  <Sparkles size={18} style={{ color: 'var(--gold)' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Estimation</h3>
                  {result.isDomTom && (
                    <span style={{
                      padding: '4px 8px',
                      background: 'rgba(34, 197, 94, 0.1)',
                      borderRadius: '4px',
                      fontSize: '11px',
                      color: '#22c55e',
                    }}>
                      🌴 {result.region}
                    </span>
                  )}
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

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '10px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Prix/m²</p>
                    <p style={{ fontSize: '18px', fontWeight: '600' }}>{formatPrice(result.pricePerSqm)}</p>
                  </div>
                  <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '10px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                      {result.isDomTom ? 'Moyenne région' : 'Moyenne DVF'}
                    </p>
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
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>vs. Prix moyen local</span>
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
                  <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(Math.max(50 + result.marketComparison, 10), 90)}%`,
                      height: '100%',
                      background: result.marketComparison > 0 ? '#22c55e' : result.marketComparison < 0 ? '#ef4444' : 'var(--gold)',
                      borderRadius: '4px',
                    }} />
                  </div>
                </div>

                {/* Confidence & Data Source */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  background: result.isDomTom ? 'rgba(59, 130, 246, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                  border: `1px solid ${result.isDomTom ? 'rgba(59, 130, 246, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`,
                  borderRadius: '10px',
                  marginBottom: '12px',
                }}>
                  {result.isDomTom ? <Globe size={16} style={{ color: '#3b82f6' }} /> : <Database size={16} style={{ color: '#22c55e' }} />}
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: result.isDomTom ? '#3b82f6' : '#22c55e' }}>
                      Confiance: {result.confidence}%
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {result.isDomTom 
                        ? `Source: ${result.dataSource}` 
                        : `Basé sur ${result.totalTransactions} transactions réelles`}
                    </p>
                  </div>
                </div>

                {result.cityMatch && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    background: 'rgba(212, 175, 55, 0.1)',
                    borderRadius: '8px',
                    marginBottom: '12px',
                  }}>
                    <MapPin size={14} style={{ color: 'var(--gold)' }} />
                    <span style={{ fontSize: '12px', color: 'var(--gold)' }}>
                      Prix ajusté pour {result.cityMatch}
                    </span>
                  </div>
                )}

                {result.dateRange && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                  }}>
                    <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {result.isDomTom 
                        ? `Mise à jour: ${result.dateRange.from}` 
                        : `Données: ${result.dateRange.from} → ${result.dateRange.to}`}
                    </span>
                  </div>
                )}
              </div>

              {/* Comparable Sales / Market Data */}
              {comparables.length > 0 && (
                <div style={{
                  padding: '24px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>
                    {result.isDomTom ? '📊 Données du marché' : '🏠 Ventes comparables (données réelles)'}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {result.isDomTom ? (
                      // DOM-TOM market data display
                      comparables.map((comp, idx) => (
                        <div key={idx} style={{
                          padding: '14px',
                          background: 'var(--bg-tertiary)',
                          borderRadius: '10px',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>
                              {comp.type}
                            </span>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gold)' }}>
                              {formatPrice(comp.pricePerSqm)}/m²
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {comp.description}
                          </p>
                          {comp.range && (
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                              Fourchette: {comp.range}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      // DVF real transactions display
                      comparables.map((comp, idx) => (
                        <div key={idx} style={{
                          padding: '14px',
                          background: 'var(--bg-tertiary)',
                          borderRadius: '10px',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--gold)' }}>
                              {formatPrice(comp.price)}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {comp.date}
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                            {comp.address}
                          </p>
                          <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text-muted)' }}>
                            <span>{comp.area} m²</span>
                            {comp.rooms && <span>{comp.rooms} pièces</span>}
                            <span style={{ color: 'var(--gold)' }}>{formatPrice(comp.pricePerSqm)}/m²</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Live Search Links */}
              <div style={{
                padding: '24px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
              }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '12px' }}>
                  🔍 Comparer avec les annonces actuelles
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  Vérifiez les prix réels sur les sites d'annonces immobilières
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[
                    { 
                      name: 'SeLoger', 
                      url: `https://www.seloger.com/list.htm?types=${formData.propertyType === 'Appartement' ? '1' : '2'}&places=[{ci:${formData.postalCode || formData.city}}]&surface=${formData.area || 50}/${parseInt(formData.area || 50) + 30}`,
                      color: '#e4002b'
                    },
                    { 
                      name: 'LeBonCoin', 
                      url: `https://www.leboncoin.fr/recherche?category=9&locations=${encodeURIComponent(formData.city || 'France')}&real_estate_type=${formData.propertyType === 'Appartement' ? '1' : '2'}&square=${formData.area || 50}-${parseInt(formData.area || 50) + 30}`,
                      color: '#ff6e14'
                    },
                    { 
                      name: 'PAP', 
                      url: `https://www.pap.fr/annonce/vente-${formData.propertyType === 'Appartement' ? 'appartement' : 'maison'}-${formData.city ? formData.city.toLowerCase().replace(/\s/g, '-') : 'france'}`,
                      color: '#0066cc'
                    },
                    { 
                      name: 'Bien\'ici', 
                      url: `https://www.bienici.com/recherche/achat/${formData.city ? formData.city.toLowerCase().replace(/\s/g, '-') : 'france'}/${formData.propertyType === 'Appartement' ? 'appartement' : 'maison'}?surface-min=${formData.area || 50}`,
                      color: '#00a19a'
                    },
                    ...(result.isDomTom ? [
                      { 
                        name: 'Immo DOM-TOM', 
                        url: `https://www.netvendeur.com/prix/region-outre-mer-23/`,
                        color: '#9333ea'
                      }
                    ] : [
                      { 
                        name: 'DVF Officiel', 
                        url: `https://app.dvf.etalab.gouv.fr/`,
                        color: '#22c55e'
                      }
                    ]),
                  ].map((site, idx) => (
                    <a
                      key={idx}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '10px 14px',
                        background: `${site.color}15`,
                        border: `1px solid ${site.color}30`,
                        borderRadius: '8px',
                        color: site.color,
                        fontSize: '13px',
                        fontWeight: '500',
                        textDecoration: 'none',
                        transition: 'all 0.2s',
                      }}
                    >
                      {site.name}
                      <ExternalLink size={14} />
                    </a>
                  ))}
                </div>
              </div>
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
                <Database size={28} style={{ color: 'var(--gold)' }} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                Estimation basée sur données réelles
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '16px' }}>
                Entrez les caractéristiques du bien pour obtenir une estimation basée sur les vraies transactions immobilières.
              </p>
              <div style={{
                padding: '12px',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '8px',
              }}>
                <p style={{ fontSize: '12px', color: '#3b82f6' }}>
                  💡 Les données DVF contiennent toutes les ventes immobilières en France depuis 2014
                </p>
              </div>
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
