import React, { useState, useRef } from 'react';
import {
  Image,
  Wand2,
  Sun,
  Contrast,
  Palette,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Sofa,
  Loader2,
  Check,
  Sparkles,
  ZoomIn
} from 'lucide-react';

const enhancements = [
  { id: 'auto', name: 'Auto-amélioration', icon: Wand2, description: 'Optimisation automatique' },
  { id: 'hdr', name: 'HDR', icon: Sun, description: 'Plus de détails' },
  { id: 'brightness', name: 'Luminosité', icon: Sun, description: 'Éclaircir les pièces sombres' },
  { id: 'contrast', name: 'Contraste', icon: Contrast, description: 'Plus de profondeur' },
  { id: 'colors', name: 'Couleurs', icon: Palette, description: 'Couleurs vibrantes' },
  { id: 'staging', name: 'Virtual staging', icon: Sofa, description: 'Meubler virtuellement', premium: true },
  { id: 'declutter', name: 'Désencombrer', icon: Trash2, description: 'Retirer objets', premium: true },
  { id: 'sky', name: 'Ciel bleu', icon: Sparkles, description: 'Remplacer ciel gris', premium: true },
];

function PhotoEnhancement() {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [selectedEnhancements, setSelectedEnhancements] = useState(['auto']);
  const [beforeAfter, setBeforeAfter] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      enhanced: null,
      status: 'pending',
    }));
    setImages([...images, ...newImages]);
    if (!selectedImage && newImages.length > 0) {
      setSelectedImage(newImages[0]);
    }
  };

  const toggleEnhancement = (id) => {
    setSelectedEnhancements(prev =>
      prev.includes(id)
        ? prev.filter(e => e !== id)
        : [...prev, id]
    );
  };

  const processImage = async () => {
    if (!selectedImage) return;
    
    setProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // In real app, this would call an AI service
    setImages(prev => prev.map(img =>
      img.id === selectedImage.id
        ? { ...img, enhanced: img.preview, status: 'done' }
        : img
    ));
    setSelectedImage(prev => ({ ...prev, enhanced: prev.preview, status: 'done' }));
    setBeforeAfter(true);
    setProcessing(false);
  };

  const handleSliderMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
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
              <Image size={24} style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Retouche photo IA</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Améliorez vos photos immobilières automatiquement
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '40px 20px',
              background: 'var(--bg-card)',
              border: '2px dashed var(--border-color)',
              borderRadius: '16px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
          >
            <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
              Importer des photos
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Glissez ou cliquez
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          {/* Thumbnails */}
          {images.length > 0 && (
            <div style={{
              padding: '16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
            }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                Photos ({images.length})
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '8px',
              }}>
                {images.map(img => (
                  <div
                    key={img.id}
                    onClick={() => { setSelectedImage(img); setBeforeAfter(img.enhanced); }}
                    style={{
                      aspectRatio: '1',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: selectedImage?.id === img.id ? '2px solid var(--gold)' : '2px solid transparent',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={img.preview}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    {img.status === 'done' && (
                      <div style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        width: '20px',
                        height: '20px',
                        background: '#22c55e',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <Check size={12} style={{ color: 'white' }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enhancements */}
          <div style={{
            padding: '16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
              Améliorations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {enhancements.map(enh => (
                <button
                  key={enh.id}
                  onClick={() => toggleEnhancement(enh.id)}
                  disabled={enh.premium}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: selectedEnhancements.includes(enh.id) 
                      ? 'rgba(212, 175, 55, 0.1)' 
                      : 'var(--bg-tertiary)',
                    border: '1px solid ' + (selectedEnhancements.includes(enh.id) 
                      ? 'rgba(212, 175, 55, 0.3)' 
                      : 'var(--border-color)'),
                    borderRadius: '10px',
                    cursor: enh.premium ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    opacity: enh.premium ? 0.5 : 1,
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    background: selectedEnhancements.includes(enh.id) 
                      ? 'rgba(212, 175, 55, 0.15)' 
                      : 'var(--bg-card)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <enh.icon size={18} style={{ 
                      color: selectedEnhancements.includes(enh.id) ? 'var(--gold)' : 'var(--text-muted)' 
                    }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ 
                      fontSize: '13px', 
                      fontWeight: '500',
                      color: selectedEnhancements.includes(enh.id) ? 'var(--gold)' : 'var(--text-primary)',
                    }}>
                      {enh.name}
                      {enh.premium && (
                        <span style={{
                          marginLeft: '8px',
                          padding: '2px 6px',
                          background: 'var(--gold)',
                          color: 'var(--bg-primary)',
                          borderRadius: '4px',
                          fontSize: '9px',
                          fontWeight: '700',
                        }}>PRO</span>
                      )}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{enh.description}</p>
                  </div>
                  {selectedEnhancements.includes(enh.id) && (
                    <Check size={16} style={{ color: 'var(--gold)' }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Area */}
        <div style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
        }}>
          {selectedImage ? (
            <>
              {/* Image Preview */}
              <div style={{
                position: 'relative',
                borderRadius: '12px',
                overflow: 'hidden',
                marginBottom: '20px',
                height: '500px',
              }}>
                {beforeAfter && selectedImage.enhanced ? (
                  <div
                    style={{ position: 'relative', width: '100%', height: '100%', cursor: 'ew-resize' }}
                    onMouseMove={handleSliderMove}
                  >
                    {/* After (enhanced) */}
                    <img
                      src={selectedImage.enhanced}
                      alt="Enhanced"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    {/* Before (original) - clipped */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: `${sliderPosition}%`,
                      height: '100%',
                      overflow: 'hidden',
                    }}>
                      <img
                        src={selectedImage.preview}
                        alt="Original"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: `${100 / (sliderPosition / 100)}%`,
                          height: '100%',
                          objectFit: 'cover',
                          filter: 'brightness(0.9)',
                        }}
                      />
                    </div>
                    {/* Slider */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: `${sliderPosition}%`,
                      width: '4px',
                      background: 'white',
                      transform: 'translateX(-50%)',
                      boxShadow: '0 0 10px rgba(0,0,0,0.5)',
                    }}>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '40px',
                        height: '40px',
                        background: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                      }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          <div style={{ width: '2px', height: '12px', background: '#333', borderRadius: '1px' }} />
                          <div style={{ width: '2px', height: '12px', background: '#333', borderRadius: '1px' }} />
                        </div>
                      </div>
                    </div>
                    {/* Labels */}
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      left: '16px',
                      padding: '6px 12px',
                      background: 'rgba(0,0,0,0.7)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}>AVANT</div>
                    <div style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      padding: '6px 12px',
                      background: 'var(--gold)',
                      color: 'var(--bg-primary)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}>APRÈS</div>
                  </div>
                ) : (
                  <img
                    src={selectedImage.preview}
                    alt="Selected"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                )}
                
                {processing && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <Loader2 size={48} style={{ color: 'var(--gold)', animation: 'spin 1s linear infinite' }} />
                    <p style={{ marginTop: '16px', fontSize: '16px', fontWeight: '500' }}>
                      Amélioration en cours...
                    </p>
                    <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      L'IA analyse et optimise votre photo
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {selectedImage.enhanced && (
                    <button
                      onClick={() => setBeforeAfter(!beforeAfter)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 20px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '10px',
                        color: 'var(--text-primary)',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      <ZoomIn size={18} />
                      {beforeAfter ? 'Masquer comparaison' : 'Voir avant/après'}
                    </button>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {selectedImage.enhanced && (
                    <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}>
                      <Download size={18} />
                      Télécharger
                    </button>
                  )}
                  <button
                    onClick={processImage}
                    disabled={processing}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      background: 'var(--gold)',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'var(--bg-primary)',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: processing ? 'wait' : 'pointer',
                    }}
                  >
                    <Wand2 size={18} />
                    {selectedImage.enhanced ? 'Ré-améliorer' : 'Améliorer'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{
              height: '500px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
            }}>
              <Image size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
              <p style={{ fontSize: '16px', fontWeight: '500' }}>Aucune photo sélectionnée</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>
                Importez des photos pour commencer
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

export default PhotoEnhancement;
