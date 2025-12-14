import React, { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  Plus,
  Edit2,
  Trash2,
  Copy,
  CheckCircle,
  FileCheck,
  FilePlus,
  Loader2,
  Building2
} from 'lucide-react';

const documentTemplates = [
  {
    id: 'mandat_vente',
    name: 'Mandat de vente',
    description: 'Mandat exclusif ou simple pour la vente d\'un bien',
    category: 'Mandats',
    icon: FileCheck,
    fields: ['vendor_name', 'property_address', 'price', 'commission', 'duration'],
  },
  {
    id: 'mandat_location',
    name: 'Mandat de location',
    description: 'Mandat pour la mise en location d\'un bien',
    category: 'Mandats',
    icon: FileCheck,
    fields: ['owner_name', 'property_address', 'rent', 'commission'],
  },
  {
    id: 'compte_rendu_visite',
    name: 'Compte-rendu de visite',
    description: 'Rapport détaillé après une visite de bien',
    category: 'Visites',
    icon: FileText,
    fields: ['client_name', 'property_address', 'visit_date', 'feedback', 'interest_level'],
  },
  {
    id: 'offre_achat',
    name: 'Offre d\'achat',
    description: 'Proposition d\'achat formelle',
    category: 'Transactions',
    icon: FilePlus,
    fields: ['buyer_name', 'property_address', 'offer_price', 'conditions', 'validity'],
  },
  {
    id: 'bon_visite',
    name: 'Bon de visite',
    description: 'Confirmation de visite signée',
    category: 'Visites',
    icon: FileText,
    fields: ['client_name', 'property_address', 'visit_date', 'agent_name'],
  },
  {
    id: 'attestation_visite',
    name: 'Attestation de visite',
    description: 'Preuve de visite pour le client',
    category: 'Visites',
    icon: FileCheck,
    fields: ['client_name', 'property_address', 'visit_date'],
  },
  {
    id: 'estimation',
    name: 'Rapport d\'estimation',
    description: 'Estimation de valeur détaillée',
    category: 'Estimations',
    icon: Building2,
    fields: ['property_address', 'estimated_value', 'criteria', 'comparables'],
  },
  {
    id: 'fiche_bien',
    name: 'Fiche descriptive',
    description: 'Présentation complète d\'un bien',
    category: 'Marketing',
    icon: FileText,
    fields: ['property_title', 'description', 'features', 'photos'],
  },
];

const categories = ['Tous', 'Mandats', 'Visites', 'Transactions', 'Estimations', 'Marketing'];

const recentDocuments = [
  { id: 1, template: 'Mandat de vente', client: 'Marie Dupont', date: '2024-01-15', status: 'signed' },
  { id: 2, template: 'Compte-rendu de visite', client: 'Jean Martin', date: '2024-01-14', status: 'draft' },
  { id: 3, template: 'Offre d\'achat', client: 'Sophie Bernard', date: '2024-01-13', status: 'sent' },
];

function DocumentGenerator() {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [formData, setFormData] = useState({});

  const filteredTemplates = selectedCategory === 'Tous'
    ? documentTemplates
    : documentTemplates.filter(t => t.category === selectedCategory);

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGenerating(false);
    alert('Document généré ! (simulation)');
    setSelectedTemplate(null);
  };

  const getFieldLabel = (field) => {
    const labels = {
      vendor_name: 'Nom du vendeur',
      owner_name: 'Nom du propriétaire',
      buyer_name: 'Nom de l\'acheteur',
      client_name: 'Nom du client',
      property_address: 'Adresse du bien',
      property_title: 'Titre du bien',
      price: 'Prix de vente',
      rent: 'Loyer mensuel',
      offer_price: 'Prix proposé',
      commission: 'Commission (%)',
      duration: 'Durée du mandat',
      visit_date: 'Date de visite',
      feedback: 'Retour client',
      interest_level: 'Niveau d\'intérêt',
      conditions: 'Conditions suspensives',
      validity: 'Durée de validité',
      agent_name: 'Nom de l\'agent',
      estimated_value: 'Valeur estimée',
      criteria: 'Critères d\'évaluation',
      comparables: 'Biens comparables',
      description: 'Description',
      features: 'Caractéristiques',
      photos: 'Photos',
    };
    return labels[field] || field;
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
              <FileText size={24} style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Documents</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Générez vos documents professionnels
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Documents */}
      <div style={{
        padding: '20px 24px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Documents récents</h3>
          <button style={{
            fontSize: '13px',
            color: 'var(--gold)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}>
            Voir tout →
          </button>
        </div>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto' }}>
          {recentDocuments.map(doc => (
            <div key={doc.id} style={{
              minWidth: '280px',
              padding: '16px',
              background: 'var(--bg-tertiary)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'rgba(212, 175, 55, 0.1)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <FileText size={20} style={{ color: 'var(--gold)' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: '500' }}>{doc.template}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {doc.client} • {doc.date}
                </p>
              </div>
              <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '600',
                background: doc.status === 'signed' ? 'rgba(34, 197, 94, 0.1)' :
                           doc.status === 'sent' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(156, 163, 175, 0.1)',
                color: doc.status === 'signed' ? '#22c55e' :
                       doc.status === 'sent' ? '#3b82f6' : '#9ca3af',
              }}>
                {doc.status === 'signed' ? 'Signé' : doc.status === 'sent' ? 'Envoyé' : 'Brouillon'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '10px 20px',
              background: selectedCategory === cat ? 'var(--gold)' : 'var(--bg-card)',
              border: '1px solid ' + (selectedCategory === cat ? 'var(--gold)' : 'var(--border-color)'),
              borderRadius: '8px',
              color: selectedCategory === cat ? 'var(--bg-primary)' : 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
      }}>
        {filteredTemplates.map(template => {
          const Icon = template.icon;
          return (
            <div
              key={template.id}
              onClick={() => setSelectedTemplate(template)}
              style={{
                padding: '24px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--gold)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(212, 175, 55, 0.1)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}>
                <Icon size={24} style={{ color: 'var(--gold)' }} />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                {template.name}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {template.description}
              </p>
              <span style={{
                display: 'inline-block',
                marginTop: '12px',
                padding: '4px 10px',
                background: 'var(--bg-tertiary)',
                borderRadius: '4px',
                fontSize: '11px',
                color: 'var(--text-muted)',
              }}>
                {template.category}
              </span>
            </div>
          );
        })}
      </div>

      {/* Template Modal */}
      {selectedTemplate && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setSelectedTemplate(null)}>
          <div
            style={{
              width: '600px',
              maxHeight: '80vh',
              background: 'var(--bg-card)',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              padding: '24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: 'rgba(212, 175, 55, 0.1)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <selectedTemplate.icon size={20} style={{ color: 'var(--gold)' }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{selectedTemplate.name}</h3>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  fontSize: '24px',
                }}
              >×</button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', maxHeight: 'calc(80vh - 160px)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {selectedTemplate.fields.map(field => (
                  <div key={field}>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      marginBottom: '8px',
                    }}>
                      {getFieldLabel(field)}
                    </label>
                    {field === 'feedback' || field === 'description' || field === 'conditions' ? (
                      <textarea
                        rows={3}
                        placeholder={`Entrez ${getFieldLabel(field).toLowerCase()}...`}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          fontSize: '14px',
                          resize: 'vertical',
                        }}
                      />
                    ) : field === 'visit_date' ? (
                      <input
                        type="date"
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
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
                    ) : field === 'interest_level' ? (
                      <select
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          fontSize: '14px',
                        }}
                      >
                        <option value="">Sélectionner...</option>
                        <option value="high">Élevé</option>
                        <option value="medium">Moyen</option>
                        <option value="low">Faible</option>
                      </select>
                    ) : (
                      <input
                        type={field.includes('price') || field.includes('rent') || field.includes('commission') || field.includes('value') ? 'number' : 'text'}
                        placeholder={`Entrez ${getFieldLabel(field).toLowerCase()}...`}
                        onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
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
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <button style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                cursor: 'pointer',
              }}>
                <Eye size={16} />
                Aperçu
              </button>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  style={{
                    padding: '10px 20px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    background: 'var(--gold)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'var(--bg-primary)',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: generating ? 'wait' : 'pointer',
                  }}
                >
                  {generating ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      Générer PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default DocumentGenerator;
