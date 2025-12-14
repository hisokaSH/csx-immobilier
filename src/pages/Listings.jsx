import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useListings, deleteListing, updateListing, publishToPlatforms, getConnectedPlatforms } from '../lib/database';
import {
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  ExternalLink,
  MapPin,
  Bed,
  Bath,
  Square,
  Building2,
  AlertCircle,
  Check,
  X,
  Pause,
  Play,
  Share2,
  Loader2
} from 'lucide-react';

const statusConfig = {
  active: { label: 'Active', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' },
  draft: { label: 'Brouillon', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  paused: { label: 'En pause', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' },
  pending: { label: 'En attente', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
};

const propertyTypes = {
  apartment: 'Appartement',
  house: 'Maison',
  villa: 'Villa',
  land: 'Terrain',
  commercial: 'Commercial',
};

function Listings() {
  const { listings, loading, error, refetch } = useListings();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeMenu, setActiveMenu] = useState(null);
  const [deleting, setDeleting] = useState(null);
  
  // Publish modal state
  const [publishModal, setPublishModal] = useState(null); // listing object or null
  const [connectedPlatforms, setConnectedPlatforms] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState(null);

  // Load connected platforms when modal opens
  useEffect(() => {
    if (publishModal) {
      getConnectedPlatforms().then(({ data }) => {
        setConnectedPlatforms(data || []);
        setSelectedPlatforms(data?.map(p => p.platform) || []);
      });
    }
  }, [publishModal]);

  const filteredListings = listings.filter(listing => {
    const matchesSearch = !searchQuery || 
      listing.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Etes-vous sur de vouloir supprimer cette annonce ?')) return;
    
    setDeleting(id);
    const { error } = await deleteListing(id);
    if (error) {
      alert('Erreur lors de la suppression: ' + error);
    } else {
      refetch();
    }
    setDeleting(null);
    setActiveMenu(null);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    const { error } = await updateListing(id, { status: newStatus });
    if (error) {
      alert('Erreur: ' + error);
    } else {
      refetch();
    }
    setActiveMenu(null);
  };

  const handlePublish = async () => {
    if (!publishModal || selectedPlatforms.length === 0) return;
    
    setPublishing(true);
    setPublishResults(null);
    
    const { data, error } = await publishToPlatforms(publishModal.id, selectedPlatforms);
    
    if (error) {
      setPublishResults({ error });
    } else {
      setPublishResults(data?.results || {});
    }
    
    setPublishing(false);
  };

  const closePublishModal = () => {
    setPublishModal(null);
    setPublishResults(null);
    setSelectedPlatforms([]);
    setActiveMenu(null);
  };

  const formatPrice = (price, type) => {
    if (!price) return 'Prix non defini';
    const formatted = new Intl.NumberFormat('fr-FR').format(price);
    if (type === 'rent') return `${formatted} EUR/mois`;
    if (type === 'vacation') return `${formatted} EUR/nuit`;
    return `${formatted} EUR`;
  };

  if (loading) {
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
          <p style={{ color: 'var(--text-muted)' }}>Chargement des annonces...</p>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
      }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '600', marginBottom: '8px' }}>
            Mes Annonces
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            {listings.length} annonce{listings.length !== 1 ? 's' : ''} au total
          </p>
        </div>
        <Link
          to="/listings/new"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
            color: 'var(--bg-primary)',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            textDecoration: 'none',
          }}
        >
          <Plus size={18} />
          Nouvelle Annonce
        </Link>
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
          <span>Erreur: {error}</span>
        </div>
      )}

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        alignItems: 'center',
      }}>
        <div style={{
          flex: 1,
          position: 'relative',
        }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }} />
          <input
            type="text"
            placeholder="Rechercher par titre ou localisation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              fontSize: '14px',
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '12px 16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            color: 'var(--text-primary)',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Active</option>
          <option value="draft">Brouillon</option>
          <option value="paused">En pause</option>
        </select>

        <div style={{
          display: 'flex',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '4px',
        }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              padding: '8px 12px',
              background: viewMode === 'grid' ? 'var(--bg-tertiary)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              padding: '8px 12px',
              background: viewMode === 'list' ? 'var(--bg-tertiary)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: viewMode === 'list' ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredListings.length === 0 && (
        <div style={{
          padding: '60px 40px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'rgba(212, 175, 55, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <Building2 size={36} style={{ color: 'var(--gold)' }} />
          </div>
          <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>
            {listings.length === 0 ? 'Aucune annonce' : 'Aucun résultat'}
          </h3>
          <p style={{
            color: 'var(--text-muted)',
            marginBottom: '24px',
            maxWidth: '400px',
            margin: '0 auto 24px',
          }}>
            {listings.length === 0 
              ? 'Créez votre première annonce et publiez-la sur toutes les plateformes.'
              : 'Essayez de modifier vos filtres de recherche.'}
          </p>
          {listings.length === 0 && (
            <Link
              to="/listings/new"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                color: 'var(--bg-primary)',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '600',
                textDecoration: 'none',
              }}
            >
              <Plus size={18} />
              Créer une annonce
            </Link>
          )}
        </div>
      )}

      {/* Grid View */}
      {filteredListings.length > 0 && viewMode === 'grid' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
        }}>
          {filteredListings.map((listing) => (
            <div
              key={listing.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* Image */}
              <div style={{
                height: '180px',
                background: listing.images?.[0] 
                  ? `url(${listing.images[0]}) center/cover`
                  : 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.02) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {!listing.images?.[0] && (
                  <Building2 size={48} style={{ color: 'var(--gold)', opacity: 0.5 }} />
                )}
              </div>

              {/* Status Badge */}
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                padding: '6px 12px',
                background: statusConfig[listing.status]?.bg || statusConfig.draft.bg,
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: statusConfig[listing.status]?.color || statusConfig.draft.color,
              }}>
                {statusConfig[listing.status]?.label || listing.status}
              </div>

              {/* Menu */}
              <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                <button
                  onClick={() => setActiveMenu(activeMenu === listing.id ? null : listing.id)}
                  style={{
                    width: '32px',
                    height: '32px',
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(10px)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MoreVertical size={16} />
                </button>
                
                {activeMenu === listing.id && (
                  <div style={{
                    position: 'absolute',
                    top: '40px',
                    right: '0',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '8px',
                    minWidth: '160px',
                    zIndex: 10,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                  }}>
                    <Link
                      to={`/listings/${listing.id}/edit`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        fontSize: '13px',
                      }}
                    >
                      <Edit2 size={16} /> Modifier
                    </Link>
                    {listing.status === 'active' && (
                      <a
                        href={`/p/${listing.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          textDecoration: 'none',
                          fontSize: '13px',
                        }}
                      >
                        <ExternalLink size={16} /> Voir page publique
                      </a>
                    )}
                    {listing.status === 'active' && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.origin + '/p/' + listing.id);
                          setActiveMenu(null);
                          alert('Lien copie dans le presse-papier');
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          background: 'none',
                          border: 'none',
                          width: '100%',
                          cursor: 'pointer',
                          fontSize: '13px',
                          textAlign: 'left',
                        }}
                      >
                        <Eye size={16} /> Copier le lien
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleStatus(listing.id, listing.status)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        color: 'var(--text-primary)',
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        cursor: 'pointer',
                        fontSize: '13px',
                        textAlign: 'left',
                      }}
                    >
                      {listing.status === 'active' ? <Pause size={16} /> : <Play size={16} />}
                      {listing.status === 'active' ? 'Mettre en pause' : 'Activer'}
                    </button>
                    <button
                      onClick={() => {
                        setPublishModal(listing);
                        setActiveMenu(null);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        color: 'var(--gold)',
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        cursor: 'pointer',
                        fontSize: '13px',
                        textAlign: 'left',
                      }}
                    >
                      <Share2 size={16} /> Publier sur plateformes
                    </button>
                    <button
                      onClick={() => handleDelete(listing.id)}
                      disabled={deleting === listing.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        color: 'var(--error)',
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        cursor: 'pointer',
                        fontSize: '13px',
                        textAlign: 'left',
                        opacity: deleting === listing.id ? 0.5 : 1,
                      }}
                    >
                      <Trash2 size={16} /> 
                      {deleting === listing.id ? 'Suppression...' : 'Supprimer'}
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: '20px' }}>
                <p style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: 'var(--gold)',
                  marginBottom: '8px',
                }}>
                  {formatPrice(listing.price, listing.price_type)}
                </p>
                <h3 style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {listing.title || 'Sans titre'}
                </h3>
                
                {listing.location && (
                  <p style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    marginBottom: '16px',
                  }}>
                    <MapPin size={14} />
                    {listing.location}
                  </p>
                )}

                <div style={{
                  display: 'flex',
                  gap: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-color)',
                }}>
                  {listing.beds && (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                    }}>
                      <Bed size={14} /> {listing.beds}
                    </span>
                  )}
                  {listing.baths && (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                    }}>
                      <Bath size={14} /> {listing.baths}
                    </span>
                  )}
                  {listing.area && (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      color: 'var(--text-muted)',
                    }}>
                      <Square size={14} /> {listing.area} m²
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {filteredListings.length > 0 && viewMode === 'list' && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Bien</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Prix</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Statut</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Type</th>
                <th style={{ padding: '16px 20px', textAlign: 'right', fontSize: '13px', color: 'var(--text-muted)', fontWeight: '500' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredListings.map((listing) => (
                <tr key={listing.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        background: listing.images?.[0] 
                          ? `url(${listing.images[0]}) center/cover`
                          : 'rgba(212, 175, 55, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {!listing.images?.[0] && <Building2 size={20} style={{ color: 'var(--gold)' }} />}
                      </div>
                      <div>
                        <p style={{ fontWeight: '500', marginBottom: '4px' }}>{listing.title || 'Sans titre'}</p>
                        {listing.location && (
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={12} /> {listing.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: '600', color: 'var(--gold)' }}>
                    {formatPrice(listing.price, listing.price_type)}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      padding: '6px 12px',
                      background: statusConfig[listing.status]?.bg,
                      color: statusConfig[listing.status]?.color,
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}>
                      {statusConfig[listing.status]?.label}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '14px' }}>
                    {propertyTypes[listing.property_type] || listing.property_type}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Link
                        to={`/listings/${listing.id}/edit`}
                        style={{
                          width: '36px',
                          height: '36px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(listing.id)}
                        disabled={deleting === listing.id}
                        style={{
                          width: '36px',
                          height: '36px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--error)',
                          cursor: 'pointer',
                          opacity: deleting === listing.id ? 0.5 : 1,
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Click outside to close menu */}
      {activeMenu && (
        <div
          onClick={() => setActiveMenu(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 5,
          }}
        />
      )}

      {/* Publish Modal */}
      {publishModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Publier sur les plateformes</h3>
              <button onClick={closePublishModal} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
              <strong>{publishModal.title}</strong>
            </p>

            {publishResults ? (
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>Resultats:</h4>
                {Object.entries(publishResults).map(([platform, result]) => (
                  <div key={platform} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    marginBottom: '8px',
                  }}>
                    {result.success ? (
                      <Check size={18} style={{ color: '#22c55e' }} />
                    ) : (
                      <X size={18} style={{ color: 'var(--error)' }} />
                    )}
                    <div>
                      <p style={{ fontWeight: '500', textTransform: 'capitalize' }}>{platform}</p>
                      <p style={{ fontSize: '12px', color: result.success ? '#22c55e' : 'var(--error)' }}>
                        {result.message}
                      </p>
                    </div>
                  </div>
                ))}
                <button
                  onClick={closePublishModal}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: 'var(--gold)',
                    border: 'none',
                    borderRadius: '10px',
                    color: 'var(--bg-primary)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginTop: '16px',
                  }}
                >
                  Fermer
                </button>
              </div>
            ) : (
              <div>
                {connectedPlatforms.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                      Aucune plateforme connectee
                    </p>
                    <Link
                      to="/accounts"
                      onClick={closePublishModal}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        background: 'var(--gold)',
                        color: 'var(--bg-primary)',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: '500',
                      }}
                    >
                      Connecter des plateformes
                    </Link>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '20px' }}>
                      {connectedPlatforms.map(conn => (
                        <label
                          key={conn.platform}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px',
                            background: selectedPlatforms.includes(conn.platform) ? 'rgba(212, 175, 55, 0.1)' : 'var(--bg-tertiary)',
                            border: `1px solid ${selectedPlatforms.includes(conn.platform) ? 'var(--gold)' : 'var(--border-color)'}`,
                            borderRadius: '8px',
                            marginBottom: '8px',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedPlatforms.includes(conn.platform)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPlatforms([...selectedPlatforms, conn.platform]);
                              } else {
                                setSelectedPlatforms(selectedPlatforms.filter(p => p !== conn.platform));
                              }
                            }}
                            style={{ accentColor: 'var(--gold)' }}
                          />
                          <span style={{ textTransform: 'capitalize', fontWeight: '500' }}>{conn.platform}</span>
                        </label>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={closePublishModal}
                        style={{
                          flex: 1,
                          padding: '14px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                        }}
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handlePublish}
                        disabled={publishing || selectedPlatforms.length === 0}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '14px',
                          background: 'var(--gold)',
                          border: 'none',
                          borderRadius: '10px',
                          color: 'var(--bg-primary)',
                          fontWeight: '600',
                          cursor: 'pointer',
                          opacity: publishing || selectedPlatforms.length === 0 ? 0.7 : 1,
                        }}
                      >
                        {publishing ? (
                          <>
                            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                            Publication...
                          </>
                        ) : (
                          <>
                            <Share2 size={18} />
                            Publier
                          </>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default Listings;
