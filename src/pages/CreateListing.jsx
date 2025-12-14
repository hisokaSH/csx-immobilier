import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { createListing, updateListing, getListing } from '../lib/database';
import {
  ArrowLeft,
  Upload,
  X,
  Sparkles,
  MapPin,
  Euro,
  Bed,
  Bath,
  Square,
  Check,
  AlertCircle,
  Image,
  Loader2,
  GripVertical
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

const features = [
  'Piscine', 'Jardin', 'Terrasse', 'Balcon', 'Parking', 'Garage',
  'Cave', 'Ascenseur', 'Gardien', 'Digicode', 'Interphone', 'Climatisation',
  'Vue mer', 'Vue montagne', 'Proche plage', 'Proche commerces'
];

const platforms = [
  { id: 'seloger', name: 'SeLoger', color: '#E31C5F' },
  { id: 'leboncoin', name: 'LeBonCoin', color: '#F56B2A' },
  { id: 'facebook', name: 'Facebook', color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', color: '#E4405F' },
  { id: 'airbnb', name: 'Airbnb', color: '#FF5A5F' },
  { id: 'iad', name: 'IAD', color: '#00B388' },
];

function CreateListing() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEditing);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: 'apartment',
    price_type: 'sale',
    price: '',
    location: '',
    beds: '',
    baths: '',
    area: '',
    features: [],
    platforms: ['seloger', 'leboncoin'],
    status: 'draft',
    images: [],
  });

  // Load existing listing if editing
  useEffect(() => {
    if (isEditing) {
      async function loadListing() {
        setLoadingData(true);
        const { data, error } = await getListing(id);
        if (error) {
          setError('Impossible de charger cette annonce');
        } else if (data) {
          setFormData({
            title: data.title || '',
            description: data.description || '',
            property_type: data.property_type || 'apartment',
            price_type: data.price_type || 'sale',
            price: data.price || '',
            location: data.location || '',
            beds: data.beds || '',
            baths: data.baths || '',
            area: data.area || '',
            features: data.features || [],
            platforms: data.platforms || ['seloger', 'leboncoin'],
            status: data.status || 'draft',
            images: data.images || [],
          });
        }
        setLoadingData(false);
      }
      loadListing();
    }
  }, [id, isEditing]);

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

  const togglePlatform = (platformId) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter(p => p !== platformId)
        : [...prev.platforms, platformId]
    }));
  };

  // Image upload handler
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadingImages(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const uploadedUrls = [];

      for (const file of files) {
        // Validate file
        if (!file.type.startsWith('image/')) {
          throw new Error('Seules les images sont acceptées');
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Image trop volumineuse (max 5MB)');
        }

        // Generate unique filename
        const ext = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
          .from('listings')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('listings')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      // Add to form data
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Erreur lors de l\'upload');
    } finally {
      setUploadingImages(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove image
  const handleRemoveImage = async (imageUrl, index) => {
    // Remove from form data
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

    // Optionally delete from storage (extract path from URL)
    try {
      const url = new URL(imageUrl);
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/listings\/(.+)/);
      if (pathMatch) {
        await supabase.storage.from('listings').remove([pathMatch[1]]);
      }
    } catch (err) {
      console.error('Error deleting from storage:', err);
    }
  };

  // Set image as primary (move to first position)
  const handleSetPrimary = (index) => {
    if (index === 0) return;
    setFormData(prev => {
      const newImages = [...prev.images];
      const [removed] = newImages.splice(index, 1);
      newImages.unshift(removed);
      return { ...prev, images: newImages };
    });
  };

  const handleSubmit = async (asDraft = true) => {
    setLoading(true);
    setError(null);

    const listingData = {
      ...formData,
      price: formData.price ? parseFloat(formData.price) : null,
      beds: formData.beds ? parseInt(formData.beds) : null,
      baths: formData.baths ? parseInt(formData.baths) : null,
      area: formData.area ? parseInt(formData.area) : null,
      status: asDraft ? 'draft' : 'active',
    };

    let result;
    if (isEditing) {
      result = await updateListing(id, listingData);
    } else {
      result = await createListing(listingData);
    }

    if (result.error) {
      setError(result.error.message || 'Une erreur est survenue');
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate('/listings');
      }, 1500);
    }
  };

  if (loadingData) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--gold)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{ color: 'var(--text-muted)' }}>Chargement...</p>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (success) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Check size={32} style={{ color: 'var(--success)' }} />
          </div>
          <h2 style={{ fontSize: '24px' }}>
            {isEditing ? 'Annonce mise à jour' : 'Annonce créée'}
          </h2>
          <p style={{ color: 'var(--text-muted)' }}>Redirection...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '32px',
      }}>
        <button
          onClick={() => navigate('/listings')}
          style={{
            width: '40px',
            height: '40px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '4px' }}>
            {isEditing ? 'Modifier l\'annonce' : 'Nouvelle Annonce'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {isEditing ? 'Mettez à jour les informations' : 'Créez et publiez votre bien'}
          </p>
        </div>
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '12px',
          marginBottom: '24px',
          color: 'var(--error)',
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Images Section */}
        <div style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Photos du bien
          </h3>

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: '2px dashed var(--border-color)',
              borderRadius: '12px',
              padding: '32px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: formData.images.length > 0 ? '16px' : '0',
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = 'var(--gold)';
              e.currentTarget.style.background = 'rgba(212, 175, 55, 0.05)';
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.background = 'transparent';
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.background = 'transparent';
              const files = e.dataTransfer.files;
              if (files.length) {
                const event = { target: { files } };
                handleImageUpload(event);
              }
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            {uploadingImages ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <Loader2 size={32} style={{ color: 'var(--gold)', animation: 'spin 1s linear infinite' }} />
                <p style={{ color: 'var(--text-muted)' }}>Upload en cours...</p>
              </div>
            ) : (
              <>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'rgba(212, 175, 55, 0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}>
                  <Upload size={24} style={{ color: 'var(--gold)' }} />
                </div>
                <p style={{ fontWeight: '500', marginBottom: '4px' }}>
                  Glissez-déposez vos images ici
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  ou cliquez pour sélectionner (max 5MB par image)
                </p>
              </>
            )}
          </div>

          {/* Image Preview Grid */}
          {formData.images.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
            }}>
              {formData.images.map((url, index) => (
                <div
                  key={index}
                  style={{
                    position: 'relative',
                    aspectRatio: '4/3',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: index === 0 ? '2px solid var(--gold)' : '1px solid var(--border-color)',
                  }}
                >
                  <img
                    src={url}
                    alt={`Photo ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  
                  {/* Primary badge */}
                  {index === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      left: '8px',
                      padding: '4px 8px',
                      background: 'var(--gold)',
                      color: 'var(--bg-primary)',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: '600',
                    }}>
                      PRINCIPALE
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    display: 'flex',
                    gap: '4px',
                  }}>
                    {index !== 0 && (
                      <button
                        onClick={() => handleSetPrimary(index)}
                        title="Définir comme principale"
                        style={{
                          width: '28px',
                          height: '28px',
                          background: 'rgba(0,0,0,0.6)',
                          border: 'none',
                          borderRadius: '6px',
                          color: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Image size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveImage(url, index)}
                      title="Supprimer"
                      style={{
                        width: '28px',
                        height: '28px',
                        background: 'rgba(239, 68, 68, 0.8)',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
            Informations générales
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Titre de l'annonce
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Ex: Magnifique appartement T3 vue mer"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)',
                  fontSize: '15px',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Type de bien
                </label>
                <select
                  value={formData.property_type}
                  onChange={(e) => handleChange('property_type', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '15px',
                  }}
                >
                  {propertyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Type de transaction
                </label>
                <select
                  value={formData.price_type}
                  onChange={(e) => handleChange('price_type', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '15px',
                  }}
                >
                  {priceTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Prix {formData.price_type === 'rent' ? '(€/mois)' : formData.price_type === 'vacation' ? '(€/nuit)' : '(€)'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Euro size={18} style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }} />
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="350000"
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 44px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      color: 'var(--text-primary)',
                      fontSize: '15px',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Localisation
                </label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }} />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="Fort-de-France, Martinique"
                    style={{
                      width: '100%',
                      padding: '12px 16px 12px 44px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      color: 'var(--text-primary)',
                      fontSize: '15px',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
            Caractéristiques
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Chambres
              </label>
              <div style={{ position: 'relative' }}>
                <Bed size={18} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }} />
                <input
                  type="number"
                  value={formData.beds}
                  onChange={(e) => handleChange('beds', e.target.value)}
                  placeholder="3"
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 44px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '15px',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Salles de bain
              </label>
              <div style={{ position: 'relative' }}>
                <Bath size={18} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }} />
                <input
                  type="number"
                  value={formData.baths}
                  onChange={(e) => handleChange('baths', e.target.value)}
                  placeholder="2"
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 44px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '15px',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                Surface (m²)
              </label>
              <div style={{ position: 'relative' }}>
                <Square size={18} style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }} />
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => handleChange('area', e.target.value)}
                  placeholder="85"
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 44px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    fontSize: '15px',
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>
              Équipements
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {features.map(feature => (
                <button
                  key={feature}
                  type="button"
                  onClick={() => toggleFeature(feature)}
                  style={{
                    padding: '8px 16px',
                    background: formData.features.includes(feature) 
                      ? 'rgba(212, 175, 55, 0.1)' 
                      : 'var(--bg-tertiary)',
                    border: `1px solid ${formData.features.includes(feature) ? 'var(--gold)' : 'var(--border-color)'}`,
                    borderRadius: '8px',
                    color: formData.features.includes(feature) ? 'var(--gold)' : 'var(--text-secondary)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {formData.features.includes(feature) && <Check size={14} style={{ marginRight: '6px' }} />}
                  {feature}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Description */}
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
            marginBottom: '16px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Description</h3>
            <button
              type="button"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.2)',
                borderRadius: '8px',
                color: '#a855f7',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/ai-tools')}
            >
              <Sparkles size={16} />
              Générer avec l'IA
            </button>
          </div>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Décrivez votre bien en détail..."
            rows={6}
            style={{
              width: '100%',
              padding: '14px 16px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              fontSize: '15px',
              lineHeight: '1.6',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Platforms */}
        <div style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
            Plateformes de diffusion
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            {platforms.map(platform => (
              <button
                key={platform.id}
                type="button"
                onClick={() => togglePlatform(platform.id)}
                style={{
                  padding: '16px',
                  background: formData.platforms.includes(platform.id)
                    ? 'rgba(212, 175, 55, 0.1)'
                    : 'var(--bg-tertiary)',
                  border: `1px solid ${formData.platforms.includes(platform.id) ? 'var(--gold)' : 'var(--border-color)'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: platform.color,
                }} />
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: formData.platforms.includes(platform.id) ? 'var(--gold)' : 'var(--text-secondary)',
                }}>
                  {platform.name}
                </span>
                {formData.platforms.includes(platform.id) && (
                  <Check size={16} style={{ color: 'var(--gold)' }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          paddingTop: '8px',
        }}>
          <button
            type="button"
            onClick={() => navigate('/listings')}
            style={{
              padding: '14px 28px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              color: 'var(--text-secondary)',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={loading}
            style={{
              padding: '14px 28px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              fontSize: '15px',
              fontWeight: '500',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Enregistrement...' : 'Sauvegarder brouillon'}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={loading}
            style={{
              padding: '14px 28px',
              background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
              border: 'none',
              borderRadius: '10px',
              color: 'var(--bg-primary)',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Publication...' : 'Publier l\'annonce'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default CreateListing;
