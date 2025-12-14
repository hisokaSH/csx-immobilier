import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Eye,
  Palette,
  Layout,
  Image,
  Type,
  Loader2,
  Check,
  Building2
} from 'lucide-react';

const templates = [
  { id: 'modern', name: 'Moderne', preview: '🏢' },
  { id: 'classic', name: 'Classique', preview: '🏠' },
  { id: 'luxury', name: 'Luxe', preview: '✨' },
  { id: 'minimal', name: 'Minimaliste', preview: '◻️' },
];

const colorSchemes = [
  { id: 'gold', primary: '#d4af37', secondary: '#0a0a0f', name: 'Or & Noir' },
  { id: 'blue', primary: '#3b82f6', secondary: '#1e3a5f', name: 'Bleu Pro' },
  { id: 'green', primary: '#22c55e', secondary: '#0f3d2a', name: 'Vert Nature' },
  { id: 'purple', primary: '#8b5cf6', secondary: '#2d1b4e', name: 'Violet Luxe' },
];

function QRCodeFlyer() {
  const [listings, setListings] = useState([
    { id: 1, title: 'Appartement T3 Vue Mer', price: 450000, location: 'Nice - Promenade', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400' },
    { id: 2, title: 'Villa 5 pièces avec piscine', price: 890000, location: 'Antibes - Cap', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400' },
    { id: 3, title: 'Studio rénové centre', price: 185000, location: 'Nice - Libération', image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400' },
  ]);
  
  const [selectedListing, setSelectedListing] = useState(null);
  const [template, setTemplate] = useState('modern');
  const [colorScheme, setColorScheme] = useState(colorSchemes[0]);
  const [generating, setGenerating] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [customText, setCustomText] = useState('Scannez pour plus de photos et infos');

  const generateQRFlyer = async () => {
    if (!selectedListing) return;
    setGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setQrGenerated(true);
    setGenerating(false);
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
            <QrCode size={24} style={{ color: 'var(--gold)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Flyers QR Code</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Créez des flyers imprimables avec QR code
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px' }}>
        {/* Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Select Listing */}
          <div style={{
            padding: '20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={16} />
              Sélectionner un bien
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {listings.map(listing => (
                <button
                  key={listing.id}
                  onClick={() => { setSelectedListing(listing); setQrGenerated(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: selectedListing?.id === listing.id ? 'rgba(212, 175, 55, 0.1)' : 'var(--bg-tertiary)',
                    border: '1px solid ' + (selectedListing?.id === listing.id ? 'var(--gold)' : 'var(--border-color)'),
                    borderRadius: '10px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <img
                    src={listing.image}
                    alt=""
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '6px',
                      objectFit: 'cover',
                    }}
                  />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: selectedListing?.id === listing.id ? 'var(--gold)' : 'var(--text-primary)',
                    }}>
                      {listing.title}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {formatPrice(listing.price)}
                    </p>
                  </div>
                  {selectedListing?.id === listing.id && (
                    <Check size={16} style={{ color: 'var(--gold)' }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Template */}
          <div style={{
            padding: '20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layout size={16} />
              Template
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {templates.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTemplate(t.id); setQrGenerated(false); }}
                  style={{
                    padding: '16px',
                    background: template === t.id ? 'rgba(212, 175, 55, 0.1)' : 'var(--bg-tertiary)',
                    border: '1px solid ' + (template === t.id ? 'var(--gold)' : 'var(--border-color)'),
                    borderRadius: '10px',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{t.preview}</div>
                  <p style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: template === t.id ? 'var(--gold)' : 'var(--text-secondary)',
                  }}>
                    {t.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div style={{
            padding: '20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Palette size={16} />
              Couleurs
            </h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {colorSchemes.map(scheme => (
                <button
                  key={scheme.id}
                  onClick={() => { setColorScheme(scheme); setQrGenerated(false); }}
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '10px',
                    background: `linear-gradient(135deg, ${scheme.primary} 50%, ${scheme.secondary} 50%)`,
                    border: colorScheme.id === scheme.id ? '3px solid white' : '3px solid transparent',
                    cursor: 'pointer',
                    boxShadow: colorScheme.id === scheme.id ? '0 0 0 2px var(--gold)' : 'none',
                  }}
                  title={scheme.name}
                />
              ))}
            </div>
          </div>

          {/* Custom Text */}
          <div style={{
            padding: '20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Type size={16} />
              Texte personnalisé
            </h3>
            <input
              type="text"
              value={customText}
              onChange={(e) => { setCustomText(e.target.value); setQrGenerated(false); }}
              placeholder="Texte sous le QR code"
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

        {/* Preview */}
        <div style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Aperçu du flyer</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {qrGenerated && (
                <>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}>
                    <Printer size={16} />
                    Imprimer
                  </button>
                  <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}>
                    <Download size={16} />
                    PDF
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Flyer Preview */}
          <div style={{
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
            aspectRatio: '210/297',
            background: colorScheme.secondary,
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          }}>
            {selectedListing ? (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Image */}
                <div style={{ height: '45%', position: 'relative' }}>
                  <img
                    src={selectedListing.image}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    left: '16px',
                    padding: '8px 16px',
                    background: colorScheme.primary,
                    color: colorScheme.secondary,
                    borderRadius: '6px',
                    fontWeight: '700',
                    fontSize: '14px',
                  }}>
                    {formatPrice(selectedListing.price)}
                  </div>
                </div>

                {/* Content */}
                <div style={{
                  flex: 1,
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <h2 style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: 'white',
                      marginBottom: '8px',
                    }}>
                      {selectedListing.title}
                    </h2>
                    <p style={{
                      fontSize: '13px',
                      color: 'rgba(255,255,255,0.7)',
                    }}>
                      📍 {selectedListing.location}
                    </p>
                  </div>

                  {/* QR Code Area */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      width: '120px',
                      height: '120px',
                      background: 'white',
                      borderRadius: '12px',
                      margin: '0 auto 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px',
                    }}>
                      {qrGenerated ? (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          background: `repeating-linear-gradient(
                            0deg,
                            #000 0px, #000 8px,
                            #fff 8px, #fff 16px
                          ),
                          repeating-linear-gradient(
                            90deg,
                            #000 0px, #000 8px,
                            #fff 8px, #fff 16px
                          )`,
                          backgroundBlendMode: 'difference',
                        }} />
                      ) : (
                        <QrCode size={60} style={{ color: '#ccc' }} />
                      )}
                    </div>
                    <p style={{
                      fontSize: '11px',
                      color: 'rgba(255,255,255,0.6)',
                    }}>
                      {customText}
                    </p>
                  </div>

                  {/* Agency */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    paddingTop: '16px',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      background: colorScheme.primary,
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      color: colorScheme.secondary,
                      fontSize: '12px',
                    }}>C</div>
                    <span style={{ color: 'white', fontWeight: '600', fontSize: '13px' }}>
                      CSX Immobilier
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,0.4)',
              }}>
                <QrCode size={48} style={{ marginBottom: '16px' }} />
                <p style={{ fontSize: '14px' }}>Sélectionnez un bien</p>
              </div>
            )}
          </div>

          {/* Generate Button */}
          {selectedListing && (
            <div style={{ textAlign: 'center', marginTop: '24px' }}>
              <button
                onClick={generateQRFlyer}
                disabled={generating}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '16px 32px',
                  background: qrGenerated ? '#22c55e' : 'var(--gold)',
                  border: 'none',
                  borderRadius: '12px',
                  color: qrGenerated ? 'white' : 'var(--bg-primary)',
                  fontWeight: '600',
                  fontSize: '15px',
                  cursor: generating ? 'wait' : 'pointer',
                }}
              >
                {generating ? (
                  <>
                    <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                    Génération...
                  </>
                ) : qrGenerated ? (
                  <>
                    <Check size={20} />
                    QR Code généré !
                  </>
                ) : (
                  <>
                    <QrCode size={20} />
                    Générer le flyer
                  </>
                )}
              </button>
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

export default QRCodeFlyer;
