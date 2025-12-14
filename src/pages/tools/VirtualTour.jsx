import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Download,
  Maximize2,
  Image,
  Music,
  Clock,
  Eye,
  Sparkles,
  RefreshCw,
  Check,
  X,
  Trash2,
  Move,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const musicOptions = [
  { id: 'elegant', name: 'Élégant', description: 'Piano doux et cordes' },
  { id: 'modern', name: 'Moderne', description: 'Électro minimaliste' },
  { id: 'upbeat', name: 'Dynamique', description: 'Rythme entraînant' },
  { id: 'ambient', name: 'Ambiance', description: 'Sons apaisants' },
  { id: 'luxury', name: 'Luxe', description: 'Orchestral premium' },
  { id: 'none', name: 'Sans musique', description: 'Silencieux' },
];

const transitionOptions = [
  { id: 'fade', name: 'Fondu' },
  { id: 'slide', name: 'Glissement' },
  { id: 'zoom', name: 'Zoom' },
  { id: 'kenburns', name: 'Ken Burns' },
];

const durationOptions = [
  { id: 3, name: '3 sec' },
  { id: 5, name: '5 sec' },
  { id: 7, name: '7 sec' },
  { id: 10, name: '10 sec' },
];

function VirtualTour() {
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selectedMusic, setSelectedMusic] = useState('elegant');
  const [transition, setTransition] = useState('kenburns');
  const [duration, setDuration] = useState(5);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTour, setGeneratedTour] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [includeAddress, setIncludeAddress] = useState(true);
  const [includePrice, setIncludePrice] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    let interval;
    if (isPlaying && photos.length > 0) {
      interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % photos.length);
      }, duration * 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration, photos.length]);

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

  const selectListing = (listing) => {
    setSelectedListing(listing);
    setPhotos(listing.images || []);
    setCurrentSlide(0);
    setIsPlaying(false);
    setGeneratedTour(null);
  };

  const movePhoto = (index, direction) => {
    const newPhotos = [...photos];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= photos.length) return;
    [newPhotos[index], newPhotos[newIndex]] = [newPhotos[newIndex], newPhotos[index]];
    setPhotos(newPhotos);
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const generateTour = async () => {
    if (photos.length < 2) return;
    
    setIsGenerating(true);
    // Simulate tour generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setGeneratedTour({
      id: Date.now(),
      url: '#',
      thumbnail: photos[0],
      duration: photos.length * duration,
      createdAt: new Date().toISOString(),
    });
    setIsGenerating(false);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.2) 0%, rgba(236, 72, 153, 0.05) 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Play size={24} style={{ color: '#ec4899' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Visite Virtuelle</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Créez des vidéos immersives de vos biens
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
        {/* Main Content */}
        <div>
          {/* Listing Selection */}
          {!selectedListing ? (
            <div style={{
              padding: '40px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
            }}>
              <h2 style={{ fontSize: '18px', marginBottom: '24px' }}>Sélectionnez un bien</h2>
              
              {listings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Image size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
                  <p style={{ color: 'var(--text-muted)' }}>Aucun bien disponible</p>
                  <Link to="/listings/new" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '16px',
                    padding: '12px 24px',
                    background: 'var(--gold)',
                    color: 'black',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: '600',
                  }}>
                    Créer un bien
                  </Link>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '16px',
                }}>
                  {listings.map(listing => (
                    <div
                      key={listing.id}
                      onClick={() => selectListing(listing)}
                      style={{
                        padding: '12px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = '#ec4899';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{
                        width: '100%',
                        aspectRatio: '16/10',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        marginBottom: '12px',
                        background: 'var(--bg-secondary)',
                      }}>
                        {listing.images?.[0] ? (
                          <img 
                            src={listing.images[0]} 
                            alt={listing.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Image size={24} style={{ color: 'var(--text-muted)' }} />
                          </div>
                        )}
                      </div>
                      <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                        {listing.title}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {listing.images?.length || 0} photos
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Preview Player */}
              <div style={{
                position: 'relative',
                aspectRatio: '16/9',
                background: '#000',
                borderRadius: '16px',
                overflow: 'hidden',
                marginBottom: '24px',
              }}>
                {photos.length > 0 ? (
                  <>
                    <img
                      src={photos[currentSlide]}
                      alt={`Slide ${currentSlide + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        animation: transition === 'kenburns' 
                          ? 'kenburns 10s ease-in-out infinite' 
                          : 'none',
                      }}
                    />
                    
                    {/* Overlay Info */}
                    <div style={{
                      position: 'absolute',
                      bottom: '80px',
                      left: '24px',
                      right: '24px',
                      color: 'white',
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    }}>
                      {includeAddress && (
                        <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
                          {selectedListing.title}
                        </h3>
                      )}
                      {includePrice && (
                        <p style={{ fontSize: '20px', color: 'var(--gold)' }}>
                          {selectedListing.price?.toLocaleString('fr-FR')} €
                        </p>
                      )}
                      {includeDetails && (
                        <p style={{ fontSize: '14px', opacity: 0.9, marginTop: '8px' }}>
                          {selectedListing.bedrooms} ch · {selectedListing.bathrooms} sdb · {selectedListing.surface} m²
                        </p>
                      )}
                    </div>

                    {/* Controls */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '16px 24px',
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                    }}>
                      <button
                        onClick={() => setCurrentSlide(prev => prev === 0 ? photos.length - 1 : prev - 1)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          padding: '8px',
                        }}
                      >
                        <SkipBack size={20} />
                      </button>
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        style={{
                          background: 'var(--gold)',
                          border: 'none',
                          color: 'black',
                          cursor: 'pointer',
                          padding: '12px',
                          borderRadius: '50%',
                        }}
                      >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                      </button>
                      <button
                        onClick={() => setCurrentSlide(prev => (prev + 1) % photos.length)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          padding: '8px',
                        }}
                      >
                        <SkipForward size={20} />
                      </button>
                      
                      {/* Progress */}
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'white' }}>
                          {currentSlide + 1}/{photos.length}
                        </span>
                        <div style={{
                          flex: 1,
                          height: '4px',
                          background: 'rgba(255,255,255,0.3)',
                          borderRadius: '2px',
                        }}>
                          <div style={{
                            width: `${((currentSlide + 1) / photos.length) * 100}%`,
                            height: '100%',
                            background: 'var(--gold)',
                            borderRadius: '2px',
                            transition: 'width 0.3s',
                          }} />
                        </div>
                        <span style={{ fontSize: '12px', color: 'white' }}>
                          {formatDuration(photos.length * duration)}
                        </span>
                      </div>

                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          padding: '8px',
                        }}
                      >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                      </button>
                      <button
                        onClick={() => setShowPreview(true)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'white',
                          cursor: 'pointer',
                          padding: '8px',
                        }}
                      >
                        <Maximize2 size={20} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-muted)',
                  }}>
                    <Image size={48} style={{ marginBottom: '16px' }} />
                    <p>Aucune photo disponible</p>
                  </div>
                )}
              </div>

              {/* Photo Order */}
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
                  marginBottom: '16px' 
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600' }}>
                    Ordre des photos ({photos.length})
                  </h3>
                  <button
                    onClick={() => selectListing(null)}
                    style={{
                      padding: '8px 16px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    Changer de bien
                  </button>
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  overflowX: 'auto',
                  paddingBottom: '8px',
                }}>
                  {photos.map((photo, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: 'relative',
                        flexShrink: 0,
                        width: '120px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: currentSlide === idx ? '2px solid var(--gold)' : '2px solid transparent',
                      }}
                    >
                      <img
                        src={photo}
                        alt={`Photo ${idx + 1}`}
                        style={{
                          width: '100%',
                          aspectRatio: '16/10',
                          objectFit: 'cover',
                          cursor: 'pointer',
                        }}
                        onClick={() => setCurrentSlide(idx)}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '4px',
                        left: '4px',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: '600',
                      }}>
                        {idx + 1}
                      </div>
                      <div style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                      }}>
                        <button
                          onClick={() => movePhoto(idx, -1)}
                          disabled={idx === 0}
                          style={{
                            background: 'rgba(0,0,0,0.7)',
                            border: 'none',
                            color: 'white',
                            cursor: idx === 0 ? 'not-allowed' : 'pointer',
                            opacity: idx === 0 ? 0.5 : 1,
                            padding: '2px',
                            borderRadius: '2px',
                          }}
                        >
                          <ChevronUp size={12} />
                        </button>
                        <button
                          onClick={() => movePhoto(idx, 1)}
                          disabled={idx === photos.length - 1}
                          style={{
                            background: 'rgba(0,0,0,0.7)',
                            border: 'none',
                            color: 'white',
                            cursor: idx === photos.length - 1 ? 'not-allowed' : 'pointer',
                            opacity: idx === photos.length - 1 ? 0.5 : 1,
                            padding: '2px',
                            borderRadius: '2px',
                          }}
                        >
                          <ChevronDown size={12} />
                        </button>
                      </div>
                      {photos.length > 2 && (
                        <button
                          onClick={() => removePhoto(idx)}
                          style={{
                            position: 'absolute',
                            bottom: '4px',
                            right: '4px',
                            background: 'rgba(239,68,68,0.9)',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Settings Panel */}
        <div style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          height: 'fit-content',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>
            Paramètres de la visite
          </h2>

          {/* Music Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontSize: '14px', 
              fontWeight: '600', 
              marginBottom: '12px' 
            }}>
              <Music size={16} />
              Musique de fond
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {musicOptions.map(option => (
                <div
                  key={option.id}
                  onClick={() => setSelectedMusic(option.id)}
                  style={{
                    padding: '12px',
                    background: selectedMusic === option.id ? 'rgba(236, 72, 153, 0.1)' : 'var(--bg-primary)',
                    border: selectedMusic === option.id ? '1px solid #ec4899' : '1px solid var(--border-color)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: '500' }}>{option.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{option.description}</p>
                    </div>
                    {selectedMusic === option.id && (
                      <Check size={16} style={{ color: '#ec4899' }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transition Style */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontSize: '14px', 
              fontWeight: '600', 
              marginBottom: '12px' 
            }}>
              <RefreshCw size={16} />
              Transition
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {transitionOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setTransition(option.id)}
                  style={{
                    padding: '12px',
                    background: transition === option.id ? 'rgba(236, 72, 153, 0.1)' : 'var(--bg-primary)',
                    border: transition === option.id ? '1px solid #ec4899' : '1px solid var(--border-color)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>

          {/* Duration per Photo */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontSize: '14px', 
              fontWeight: '600', 
              marginBottom: '12px' 
            }}>
              <Clock size={16} />
              Durée par photo
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {durationOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setDuration(option.id)}
                  style={{
                    padding: '12px',
                    background: duration === option.id ? 'rgba(236, 72, 153, 0.1)' : 'var(--bg-primary)',
                    border: duration === option.id ? '1px solid #ec4899' : '1px solid var(--border-color)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>

          {/* Overlay Options */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              fontSize: '14px', 
              fontWeight: '600', 
              marginBottom: '12px' 
            }}>
              <Eye size={16} />
              Informations affichées
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { id: 'address', label: 'Adresse', value: includeAddress, setter: setIncludeAddress },
                { id: 'price', label: 'Prix', value: includePrice, setter: setIncludePrice },
                { id: 'details', label: 'Détails (chambres, surface...)', value: includeDetails, setter: setIncludeDetails },
              ].map(item => (
                <label
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={item.value}
                    onChange={e => item.setter(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#ec4899' }}
                  />
                  <span style={{ fontSize: '14px' }}>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateTour}
            disabled={!selectedListing || photos.length < 2 || isGenerating}
            style={{
              width: '100%',
              padding: '16px',
              background: !selectedListing || photos.length < 2 
                ? 'var(--bg-secondary)' 
                : 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
              border: 'none',
              borderRadius: '12px',
              color: !selectedListing || photos.length < 2 ? 'var(--text-muted)' : 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: !selectedListing || photos.length < 2 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {isGenerating ? (
              <>
                <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Générer la visite virtuelle
              </>
            )}
          </button>

          {photos.length < 2 && selectedListing && (
            <p style={{ 
              fontSize: '12px', 
              color: 'var(--text-muted)', 
              textAlign: 'center',
              marginTop: '8px' 
            }}>
              Minimum 2 photos requises
            </p>
          )}

          {/* Generated Tour */}
          {generatedTour && (
            <div style={{
              marginTop: '24px',
              padding: '16px',
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.02) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Check size={20} style={{ color: '#22c55e' }} />
                <span style={{ fontWeight: '600', color: '#22c55e' }}>Visite générée !</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Durée totale: {formatDuration(generatedTour.duration)}
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  flex: 1,
                  padding: '12px',
                  background: 'var(--gold)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'black',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}>
                  <Download size={16} />
                  Télécharger MP4
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes kenburns {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.1) translate(-2%, -1%); }
          100% { transform: scale(1) translate(0, 0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default VirtualTour;
