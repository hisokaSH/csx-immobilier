import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  MapPin,
  Bed,
  Bath,
  Square,
  Check,
  Phone,
  Mail,
  User,
  MessageSquare,
  Send,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Home,
  AlertCircle,
  Loader2
} from 'lucide-react';

const propertyTypes = {
  apartment: 'Appartement',
  house: 'Maison',
  villa: 'Villa',
  land: 'Terrain',
  commercial: 'Commercial',
};

function PublicListing() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    async function fetchListing() {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) {
        setError('Annonce non trouvee ou inactive');
      } else {
        setListing(data);
        // Increment views
        supabase.from('listings').update({ views: (data.views || 0) + 1 }).eq('id', id).then();
      }
      setLoading(false);
    }

    if (id) {
      fetchListing();
    }
  }, [id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || (!formData.email && !formData.phone)) {
      setSubmitError('Veuillez remplir votre nom et email ou telephone');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const { data, error } = await supabase.functions.invoke('submit-lead', {
        body: {
          listingId: id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          source: 'website',
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setSubmitSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });

    } catch (err) {
      console.error('Submit error:', err);
      setSubmitError(err.message || 'Erreur lors de l\'envoi');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price, type) => {
    if (!price) return 'Prix sur demande';
    const formatted = new Intl.NumberFormat('fr-FR').format(price);
    if (type === 'rent') return `${formatted} EUR/mois`;
    if (type === 'vacation') return `${formatted} EUR/nuit`;
    return `${formatted} EUR`;
  };

  const nextImage = () => {
    if (listing?.images?.length > 1) {
      setCurrentImage(prev => (prev + 1) % listing.images.length);
    }
  };

  const prevImage = () => {
    if (listing?.images?.length > 1) {
      setCurrentImage(prev => (prev - 1 + listing.images.length) % listing.images.length);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid var(--border-color)',
            borderTopColor: 'var(--gold)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: 'var(--text-muted)' }}>Chargement...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <Home size={36} style={{ color: 'var(--error)' }} />
          </div>
          <h1 style={{ fontSize: '24px', marginBottom: '12px' }}>Annonce non disponible</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            {error || 'Cette annonce n\'existe pas ou n\'est plus active.'}
          </p>
          <Link to="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'var(--gold)',
            color: 'var(--bg-primary)',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
          }}>
            <ArrowLeft size={18} />
            Retour a l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header style={{
        padding: '16px 24px',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textDecoration: 'none',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            fontSize: '18px',
            color: 'var(--bg-primary)',
          }}>
            C
          </div>
          <div>
            <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>CSX</span>
            <span style={{
              display: 'block',
              fontSize: '10px',
              color: 'var(--gold)',
              fontWeight: '600',
              letterSpacing: '2px',
              marginTop: '-2px',
            }}>IMMOBILIER</span>
          </div>
        </Link>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
          
          {/* Left Column - Listing Details */}
          <div>
            {/* Image Gallery */}
            <div style={{
              position: 'relative',
              borderRadius: '16px',
              overflow: 'hidden',
              marginBottom: '24px',
            }}>
              {listing.images?.length > 0 ? (
                <>
                  <img
                    src={listing.images[currentImage]}
                    alt={listing.title}
                    style={{
                      width: '100%',
                      height: '400px',
                      objectFit: 'cover',
                    }}
                  />
                  {listing.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        style={{
                          position: 'absolute',
                          left: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '44px',
                          height: '44px',
                          background: 'rgba(0,0,0,0.6)',
                          border: 'none',
                          borderRadius: '50%',
                          color: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={nextImage}
                        style={{
                          position: 'absolute',
                          right: '16px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          width: '44px',
                          height: '44px',
                          background: 'rgba(0,0,0,0.6)',
                          border: 'none',
                          borderRadius: '50%',
                          color: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ChevronRight size={24} />
                      </button>
                      <div style={{
                        position: 'absolute',
                        bottom: '16px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        gap: '8px',
                      }}>
                        {listing.images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentImage(idx)}
                            style={{
                              width: idx === currentImage ? '24px' : '8px',
                              height: '8px',
                              background: idx === currentImage ? 'var(--gold)' : 'rgba(255,255,255,0.5)',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div style={{
                  width: '100%',
                  height: '400px',
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.02) 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Home size={64} style={{ color: 'var(--gold)', opacity: 0.5 }} />
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {listing.images?.length > 1 && (
              <div style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '24px',
                overflowX: 'auto',
              }}>
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    style={{
                      width: '80px',
                      height: '60px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: idx === currentImage ? '2px solid var(--gold)' : '2px solid transparent',
                      padding: 0,
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Title & Price */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{
                fontSize: '14px',
                color: 'var(--gold)',
                fontWeight: '600',
                marginBottom: '8px',
                textTransform: 'uppercase',
              }}>
                {propertyTypes[listing.property_type] || listing.property_type}
              </p>
              <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '12px' }}>
                {listing.title}
              </h1>
              {listing.location && (
                <p style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--text-muted)',
                  marginBottom: '16px',
                }}>
                  <MapPin size={18} />
                  {listing.location}
                </p>
              )}
              <p style={{ fontSize: '32px', fontWeight: '700', color: 'var(--gold)' }}>
                {formatPrice(listing.price, listing.price_type)}
              </p>
            </div>

            {/* Key Details */}
            <div style={{
              display: 'flex',
              gap: '24px',
              padding: '20px 24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              marginBottom: '24px',
            }}>
              {listing.beds && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Bed size={22} style={{ color: 'var(--gold)' }} />
                  <div>
                    <p style={{ fontSize: '18px', fontWeight: '600' }}>{listing.beds}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Chambres</p>
                  </div>
                </div>
              )}
              {listing.baths && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Bath size={22} style={{ color: 'var(--gold)' }} />
                  <div>
                    <p style={{ fontSize: '18px', fontWeight: '600' }}>{listing.baths}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Salles de bain</p>
                  </div>
                </div>
              )}
              {listing.area && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Square size={22} style={{ color: 'var(--gold)' }} />
                  <div>
                    <p style={{ fontSize: '18px', fontWeight: '600' }}>{listing.area} m2</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Surface</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                  Description
                </h2>
                <p style={{
                  color: 'var(--text-secondary)',
                  lineHeight: '1.7',
                  whiteSpace: 'pre-wrap',
                }}>
                  {listing.description}
                </p>
              </div>
            )}

            {/* Features */}
            {listing.features?.length > 0 && (
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
                  Equipements
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                }}>
                  {listing.features.map((feature, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 16px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                    }}>
                      <Check size={16} style={{ color: 'var(--gold)' }} />
                      <span style={{ fontSize: '14px' }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Contact Form */}
          <div>
            <div style={{
              position: 'sticky',
              top: '24px',
              padding: '28px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
            }}>
              <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
                Interesse par ce bien ?
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                Remplissez le formulaire et nous vous recontacterons rapidement.
              </p>

              {submitSuccess ? (
                <div style={{
                  padding: '24px',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}>
                    <Check size={28} style={{ color: '#22c55e' }} />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#22c55e' }}>
                    Message envoye !
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                    Nous avons bien recu votre demande et reviendrons vers vous tres rapidement.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {submitError && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      color: 'var(--error)',
                      fontSize: '13px',
                    }}>
                      <AlertCircle size={18} />
                      {submitError}
                    </div>
                  )}

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '500',
                      marginBottom: '8px',
                      color: 'var(--text-muted)',
                    }}>
                      Nom complet *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }} />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Jean Dupont"
                        required
                        style={{
                          width: '100%',
                          padding: '12px 16px 12px 44px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          color: 'var(--text-primary)',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '500',
                      marginBottom: '8px',
                      color: 'var(--text-muted)',
                    }}>
                      Email
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="jean@email.com"
                        style={{
                          width: '100%',
                          padding: '12px 16px 12px 44px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          color: 'var(--text-primary)',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '500',
                      marginBottom: '8px',
                      color: 'var(--text-muted)',
                    }}>
                      Telephone
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={18} style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }} />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+590 690 12 34 56"
                        style={{
                          width: '100%',
                          padding: '12px 16px 12px 44px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          color: 'var(--text-primary)',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '500',
                      marginBottom: '8px',
                      color: 'var(--text-muted)',
                    }}>
                      Message
                    </label>
                    <div style={{ position: 'relative' }}>
                      <MessageSquare size={18} style={{
                        position: 'absolute',
                        left: '14px',
                        top: '14px',
                        color: 'var(--text-muted)',
                      }} />
                      <textarea
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Je suis interesse par ce bien..."
                        rows={4}
                        style={{
                          width: '100%',
                          padding: '12px 16px 12px 44px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          color: 'var(--text-primary)',
                          fontSize: '14px',
                          resize: 'vertical',
                        }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '14px',
                      background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'var(--bg-primary)',
                      fontSize: '15px',
                      fontWeight: '600',
                      cursor: submitting ? 'wait' : 'pointer',
                      opacity: submitting ? 0.7 : 1,
                    }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Envoyer ma demande
                      </>
                    )}
                  </button>

                  <p style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    textAlign: 'center',
                    marginTop: '16px',
                    lineHeight: '1.5',
                  }}>
                    En soumettant ce formulaire, vous acceptez d'etre contacte concernant ce bien.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default PublicListing;
