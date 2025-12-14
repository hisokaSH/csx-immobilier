import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Image,
  Wand2,
  Sun,
  Contrast,
  Palette,
  Download,
  Upload,
  RefreshCw,
  Loader2,
  ZoomIn,
  Trash2,
  RotateCw,
  FlipHorizontal,
  Sparkles,
  Info
} from 'lucide-react';

// Real image adjustments using Canvas
const applyFilters = (canvas, ctx, image, filters) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Apply transformations
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((filters.rotation * Math.PI) / 180);
  ctx.scale(filters.flipH ? -1 : 1, 1);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
  
  // Build CSS filter string
  const filterStr = `
    brightness(${filters.brightness}%)
    contrast(${filters.contrast}%)
    saturate(${filters.saturation}%)
    sepia(${filters.warmth}%)
    blur(${filters.blur}px)
  `;
  ctx.filter = filterStr;
  
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  ctx.restore();
};

const defaultFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  warmth: 0,
  blur: 0,
  rotation: 0,
  flipH: false,
};

const presets = [
  { name: 'Original', filters: { ...defaultFilters } },
  { name: 'Lumineux', filters: { ...defaultFilters, brightness: 120, contrast: 105 } },
  { name: 'HDR', filters: { ...defaultFilters, brightness: 105, contrast: 130, saturation: 120 } },
  { name: 'Chaleureux', filters: { ...defaultFilters, warmth: 20, saturation: 110 } },
  { name: 'Immobilier', filters: { ...defaultFilters, brightness: 110, contrast: 110, saturation: 105 } },
  { name: 'Éclatant', filters: { ...defaultFilters, brightness: 108, saturation: 130, contrast: 108 } },
  { name: 'Naturel', filters: { ...defaultFilters, brightness: 102, contrast: 95, saturation: 95 } },
];

function PhotoEnhancement() {
  const [images, setImages] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filters, setFilters] = useState({ ...defaultFilters });
  const [processing, setProcessing] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  
  const canvasRef = useRef(null);
  const originalCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);

  const selectedImage = images[selectedIndex];

  // Redraw canvas when filters change
  useEffect(() => {
    if (selectedImage && canvasRef.current && imageRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      applyFilters(canvas, ctx, imageRef.current, filters);
    }
  }, [filters, selectedImage]);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          setImages(prev => [...prev, {
            id: Date.now() + Math.random(),
            name: file.name,
            src: event.target.result,
            width: img.width,
            height: img.height,
          }]);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
    
    e.target.value = '';
  }, []);

  // Load image into canvas when selected
  useEffect(() => {
    if (selectedImage) {
      const img = new window.Image();
      img.onload = () => {
        imageRef.current = img;
        
        // Set canvas size (max 1200px width)
        const maxWidth = 1200;
        const scale = img.width > maxWidth ? maxWidth / img.width : 1;
        const width = img.width * scale;
        const height = img.height * scale;
        
        // Main canvas
        if (canvasRef.current) {
          canvasRef.current.width = width;
          canvasRef.current.height = height;
          const ctx = canvasRef.current.getContext('2d');
          applyFilters(canvasRef.current, ctx, img, filters);
        }
        
        // Original canvas (for comparison)
        if (originalCanvasRef.current) {
          originalCanvasRef.current.width = width;
          originalCanvasRef.current.height = height;
          const octx = originalCanvasRef.current.getContext('2d');
          octx.drawImage(img, 0, 0, width, height);
        }
      };
      img.src = selectedImage.src;
      setFilters({ ...defaultFilters });
    }
  }, [selectedImage?.id]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset) => {
    setFilters({ ...preset.filters });
  };

  const resetFilters = () => {
    setFilters({ ...defaultFilters });
  };

  const rotateImage = () => {
    setFilters(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
  };

  const flipImage = () => {
    setFilters(prev => ({ ...prev, flipH: !prev.flipH }));
  };

  const downloadImage = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `enhanced_${selectedImage?.name || 'image.jpg'}`;
    link.href = canvasRef.current.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  const removeImage = (id) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (selectedIndex >= images.length - 1) {
      setSelectedIndex(Math.max(0, selectedIndex - 1));
    }
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
              <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Retouche photo</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Améliorez vos photos immobilières en temps réel
              </p>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'var(--bg-primary)',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <Upload size={18} />
            Importer des photos
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{
        padding: '12px 16px',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '10px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <Info size={16} style={{ color: '#3b82f6' }} />
        <p style={{ fontSize: '13px', color: '#3b82f6' }}>
          Traitement 100% local dans votre navigateur. Vos photos ne sont jamais envoyées sur un serveur.
        </p>
      </div>

      {images.length === 0 ? (
        /* Empty State */
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '80px',
            background: 'var(--bg-card)',
            border: '2px dashed var(--border-color)',
            borderRadius: '16px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
        >
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
            <Upload size={36} style={{ color: 'var(--gold)' }} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Glissez vos photos ici
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            ou cliquez pour sélectionner des fichiers
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
          {/* Main Editor */}
          <div>
            {/* Canvas Container */}
            <div style={{
              position: 'relative',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              overflow: 'hidden',
              marginBottom: '16px',
            }}>
              {/* Original overlay for comparison */}
              <canvas
                ref={originalCanvasRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: 'auto',
                  opacity: showOriginal ? 1 : 0,
                  transition: 'opacity 0.2s',
                  pointerEvents: 'none',
                }}
              />
              
              {/* Enhanced canvas */}
              <canvas
                ref={canvasRef}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
              
              {/* Compare button */}
              <button
                onMouseDown={() => setShowOriginal(true)}
                onMouseUp={() => setShowOriginal(false)}
                onMouseLeave={() => setShowOriginal(false)}
                style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  background: 'rgba(0,0,0,0.7)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                <ZoomIn size={14} />
                Maintenir pour voir l'original
              </button>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                padding: '8px 0',
              }}>
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    onClick={() => setSelectedIndex(idx)}
                    style={{
                      position: 'relative',
                      width: '80px',
                      height: '60px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: idx === selectedIndex ? '2px solid var(--gold)' : '2px solid transparent',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <img
                      src={img.src}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    <button
                      onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                      style={{
                        position: 'absolute',
                        top: '2px',
                        right: '2px',
                        padding: '2px',
                        background: 'rgba(239, 68, 68, 0.9)',
                        border: 'none',
                        borderRadius: '4px',
                        color: 'white',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Presets */}
            <div style={{
              padding: '16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
            }}>
              <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: '12px' }}>Préréglages</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    style={{
                      padding: '8px 14px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-secondary)',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Controls Panel */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '20px',
            height: 'fit-content',
          }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '20px' }}>Ajustements</h3>

            {/* Sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <SliderControl
                icon={<Sun size={16} />}
                label="Luminosité"
                value={filters.brightness}
                min={50}
                max={150}
                onChange={(v) => updateFilter('brightness', v)}
              />
              <SliderControl
                icon={<Contrast size={16} />}
                label="Contraste"
                value={filters.contrast}
                min={50}
                max={150}
                onChange={(v) => updateFilter('contrast', v)}
              />
              <SliderControl
                icon={<Palette size={16} />}
                label="Saturation"
                value={filters.saturation}
                min={0}
                max={200}
                onChange={(v) => updateFilter('saturation', v)}
              />
              <SliderControl
                icon={<Sparkles size={16} />}
                label="Chaleur"
                value={filters.warmth}
                min={0}
                max={50}
                onChange={(v) => updateFilter('warmth', v)}
              />
            </div>

            {/* Transform buttons */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-color)',
            }}>
              <button
                onClick={rotateImage}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                <RotateCw size={14} />
                Rotation
              </button>
              <button
                onClick={flipImage}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '10px',
                  background: filters.flipH ? 'rgba(212, 175, 55, 0.15)' : 'var(--bg-tertiary)',
                  border: `1px solid ${filters.flipH ? 'var(--gold)' : 'var(--border-color)'}`,
                  borderRadius: '8px',
                  color: filters.flipH ? 'var(--gold)' : 'var(--text-secondary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                <FlipHorizontal size={14} />
                Miroir
              </button>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '20px' }}>
              <button
                onClick={resetFilters}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={16} />
                Réinitialiser
              </button>
              <button
                onClick={downloadImage}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px',
                  background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'var(--bg-primary)',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                <Download size={16} />
                Télécharger
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Slider Component
function SliderControl({ icon, label, value, min, max, onChange }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--gold)', fontWeight: '500' }}>{value}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        style={{
          width: '100%',
          height: '4px',
          background: `linear-gradient(to right, var(--gold) ${((value - min) / (max - min)) * 100}%, var(--border-color) ${((value - min) / (max - min)) * 100}%)`,
          borderRadius: '4px',
          outline: 'none',
          cursor: 'pointer',
          WebkitAppearance: 'none',
        }}
      />
    </div>
  );
}

export default PhotoEnhancement;
