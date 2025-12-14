import React, { useState } from 'react';
import {
  Languages,
  Loader2,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Globe,
  ArrowRight
} from 'lucide-react';

const languages = [
  { code: 'en', name: 'Anglais', flag: '🇬🇧' },
  { code: 'es', name: 'Espagnol', flag: '🇪🇸' },
  { code: 'pt', name: 'Portugais', flag: '🇵🇹' },
  { code: 'it', name: 'Italien', flag: '🇮🇹' },
  { code: 'de', name: 'Allemand', flag: '🇩🇪' },
  { code: 'nl', name: 'Néerlandais', flag: '🇳🇱' },
  { code: 'ru', name: 'Russe', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinois', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabe', flag: '🇸🇦' },
];

const sampleListing = `Magnifique appartement T3 de 75m² situé au cœur de Nice, à deux pas de la Promenade des Anglais. 

Ce bien d'exception offre :
- Un séjour lumineux de 30m² avec balcon vue mer
- Une cuisine équipée moderne
- Deux chambres spacieuses avec placards intégrés
- Une salle de bain refaite à neuf
- Un parking en sous-sol

Idéalement placé, proche commerces, transports et plages. Parfait pour résidence principale ou investissement locatif.

DPE : C | GES : B | Charges : 150€/mois`;

function MultiLanguageTranslation() {
  const [sourceText, setSourceText] = useState(sampleListing);
  const [selectedLanguages, setSelectedLanguages] = useState(['en', 'es']);
  const [translations, setTranslations] = useState({});
  const [translating, setTranslating] = useState(false);
  const [copied, setCopied] = useState(null);

  const toggleLanguage = (code) => {
    setSelectedLanguages(prev =>
      prev.includes(code)
        ? prev.filter(c => c !== code)
        : [...prev, code]
    );
  };

  const translateAll = async () => {
    if (!sourceText.trim() || selectedLanguages.length === 0) return;
    
    setTranslating(true);
    
    // Simulate AI translation
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const mockTranslations = {
      en: `Magnificent 3-room apartment of 75m² located in the heart of Nice, steps from the Promenade des Anglais.

This exceptional property offers:
- A bright 30m² living room with sea view balcony
- A modern fitted kitchen
- Two spacious bedrooms with built-in closets
- A newly renovated bathroom
- Underground parking

Ideally located, close to shops, transport and beaches. Perfect for primary residence or rental investment.

EPC: C | GHG: B | Charges: €150/month`,
      es: `Magnífico apartamento de 3 habitaciones de 75m² situado en el corazón de Niza, a pocos pasos de la Promenade des Anglais.

Esta propiedad excepcional ofrece:
- Un luminoso salón de 30m² con balcón con vistas al mar
- Una cocina moderna equipada
- Dos amplios dormitorios con armarios empotrados
- Un baño renovado
- Aparcamiento subterráneo

Ubicación ideal, cerca de comercios, transporte y playas. Perfecto para residencia principal o inversión de alquiler.

DPE: C | GES: B | Gastos: 150€/mes`,
      pt: `Magnífico apartamento T3 de 75m² situado no coração de Nice, a poucos passos da Promenade des Anglais.

Esta propriedade excepcional oferece:
- Uma sala luminosa de 30m² com varanda vista mar
- Uma cozinha moderna equipada
- Dois quartos espaçosos com roupeiros embutidos
- Uma casa de banho renovada
- Estacionamento subterrâneo

Localização ideal, perto de comércio, transportes e praias. Perfeito para residência principal ou investimento para arrendamento.

DPE: C | GES: B | Encargos: 150€/mês`,
    };
    
    const newTranslations = {};
    selectedLanguages.forEach(lang => {
      newTranslations[lang] = mockTranslations[lang] || `[Traduction ${lang}] ${sourceText}`;
    });
    
    setTranslations(newTranslations);
    setTranslating(false);
  };

  const copyTranslation = (code) => {
    navigator.clipboard.writeText(translations[code]);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const getLanguage = (code) => languages.find(l => l.code === code);

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
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
            <Languages size={24} style={{ color: 'var(--gold)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Traduction multi-langue</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Traduisez vos annonces pour les acheteurs internationaux
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Source */}
        <div style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>🇫🇷</span>
              <h3 style={{ fontSize: '15px', fontWeight: '600' }}>Français (original)</h3>
            </div>
          </div>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Collez votre description d'annonce ici..."
            style={{
              width: '100%',
              minHeight: '300px',
              padding: '16px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              color: 'var(--text-primary)',
              fontSize: '14px',
              lineHeight: '1.6',
              resize: 'vertical',
              fontFamily: 'inherit',
            }}
          />
          
          {/* Language Selection */}
          <div style={{ marginTop: '20px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: 'var(--text-muted)' }}>
              TRADUIRE EN :
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => toggleLanguage(lang.code)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: selectedLanguages.includes(lang.code) ? 'rgba(212, 175, 55, 0.1)' : 'var(--bg-tertiary)',
                    border: '1px solid ' + (selectedLanguages.includes(lang.code) ? 'var(--gold)' : 'var(--border-color)'),
                    borderRadius: '8px',
                    color: selectedLanguages.includes(lang.code) ? 'var(--gold)' : 'var(--text-secondary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                  {selectedLanguages.includes(lang.code) && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={translateAll}
            disabled={translating || selectedLanguages.length === 0}
            style={{
              width: '100%',
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
              cursor: translating ? 'wait' : 'pointer',
              marginTop: '20px',
            }}
          >
            {translating ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Traduction en cours...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Traduire ({selectedLanguages.length} langues)
              </>
            )}
          </button>
        </div>

        {/* Translations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedLanguages.length === 0 ? (
            <div style={{
              padding: '60px 20px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              textAlign: 'center',
            }}>
              <Globe size={48} style={{ color: 'var(--text-muted)', opacity: 0.3, marginBottom: '16px' }} />
              <p style={{ color: 'var(--text-muted)' }}>Sélectionnez des langues pour commencer</p>
            </div>
          ) : (
            selectedLanguages.map(code => {
              const lang = getLanguage(code);
              const hasTranslation = translations[code];
              
              return (
                <div key={code} style={{
                  padding: '20px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>{lang?.flag}</span>
                      <h3 style={{ fontSize: '14px', fontWeight: '600' }}>{lang?.name}</h3>
                    </div>
                    {hasTranslation && (
                      <button
                        onClick={() => copyTranslation(code)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          background: copied === code ? '#22c55e' : 'var(--bg-tertiary)',
                          border: '1px solid ' + (copied === code ? '#22c55e' : 'var(--border-color)'),
                          borderRadius: '6px',
                          color: copied === code ? 'white' : 'var(--text-secondary)',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        {copied === code ? <Check size={14} /> : <Copy size={14} />}
                        {copied === code ? 'Copié !' : 'Copier'}
                      </button>
                    )}
                  </div>
                  
                  {hasTranslation ? (
                    <div style={{
                      padding: '14px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '10px',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      color: 'var(--text-secondary)',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      whiteSpace: 'pre-wrap',
                    }}>
                      {translations[code]}
                    </div>
                  ) : (
                    <div style={{
                      padding: '30px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '10px',
                      textAlign: 'center',
                      color: 'var(--text-muted)',
                      fontSize: '13px',
                    }}>
                      Cliquez sur "Traduire" pour générer
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Tips */}
      <div style={{
        marginTop: '24px',
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.02) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '16px',
        display: 'flex',
        alignItems: 'start',
        gap: '16px',
      }}>
        <Globe size={24} style={{ color: '#3b82f6', flexShrink: 0 }} />
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>Conseil pour les acheteurs internationaux</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            En publiant vos annonces en plusieurs langues, vous touchez les acheteurs étrangers qui représentent jusqu'à 30% des transactions sur la Côte d'Azur et aux Antilles. Les acheteurs anglais, allemands et russes sont particulièrement actifs sur le marché du luxe.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default MultiLanguageTranslation;
