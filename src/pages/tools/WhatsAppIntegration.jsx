import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  MessageCircle,
  Send,
  Phone,
  Search,
  User,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Settings,
  Zap,
  RefreshCw,
  Clock,
  Building2,
  Info
} from 'lucide-react';

// Pre-defined message templates
const messageTemplates = [
  {
    id: 'greeting',
    name: 'Salutation',
    message: 'Bonjour {name}, je suis {agent} de CSX Immobilier. Suite à votre intérêt pour nos biens, je me permets de vous contacter. Êtes-vous disponible pour en discuter ?'
  },
  {
    id: 'property',
    name: 'Présentation bien',
    message: 'Bonjour {name}, j\'ai un bien qui pourrait vous intéresser : {property}. Souhaitez-vous plus d\'informations ou organiser une visite ?'
  },
  {
    id: 'visit_confirm',
    name: 'Confirmation visite',
    message: 'Bonjour {name}, je vous confirme notre rendez-vous pour la visite du {date} à {time}. À bientôt !'
  },
  {
    id: 'followup',
    name: 'Relance',
    message: 'Bonjour {name}, je reviens vers vous concernant votre recherche immobilière. Avez-vous eu le temps de réfléchir ? Je reste à votre disposition.'
  },
  {
    id: 'documents',
    name: 'Demande documents',
    message: 'Bonjour {name}, pour avancer dans votre dossier, pourriez-vous me transmettre les documents suivants : pièce d\'identité, 3 derniers bulletins de salaire, dernier avis d\'imposition. Merci !'
  },
];

function WhatsAppIntegration() {
  const [leads, setLeads] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [agentName, setAgentName] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Load agent profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, company_name')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setAgentName(profile.full_name || profile.company_name || 'Votre agent');
      }

      // Load leads with phone numbers
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .not('phone', 'is', null)
        .order('created_at', { ascending: false });
      
      setLeads(leadsData || []);

      // Load listings
      const { data: listingsData } = await supabase
        .from('listings')
        .select('id, title, location, price')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      setListings(listingsData || []);

    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    // Add country code if missing
    if (cleaned.startsWith('0')) {
      cleaned = '33' + cleaned.slice(1);
    } else if (!cleaned.startsWith('33') && !cleaned.startsWith('+')) {
      cleaned = '33' + cleaned;
    }
    return cleaned;
  };

  const generateMessage = (template, lead) => {
    let msg = template.message;
    msg = msg.replace('{name}', lead?.name || 'Madame, Monsieur');
    msg = msg.replace('{agent}', agentName);
    msg = msg.replace('{property}', lead?.property_interest || 'notre bien');
    msg = msg.replace('{date}', '[DATE]');
    msg = msg.replace('{time}', '[HEURE]');
    return msg;
  };

  const openWhatsApp = (lead, message) => {
    const phone = formatPhone(lead.phone);
    const encodedMessage = encodeURIComponent(message || customMessage);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank');
  };

  const copyMessage = async (message) => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const filteredLeads = leads.filter(lead => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      lead.name?.toLowerCase().includes(term) ||
      lead.phone?.includes(term) ||
      lead.email?.toLowerCase().includes(term)
    );
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
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
              background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.2) 0%, rgba(37, 211, 102, 0.05) 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <MessageCircle size={24} style={{ color: '#25d366' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '600' }}>WhatsApp</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Contactez vos leads directement sur WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Actualiser
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{
        padding: '16px 20px',
        background: 'rgba(37, 211, 102, 0.1)',
        border: '1px solid rgba(37, 211, 102, 0.2)',
        borderRadius: '12px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
      }}>
        <Info size={20} style={{ color: '#25d366', flexShrink: 0, marginTop: '2px' }} />
        <div>
          <p style={{ fontSize: '14px', fontWeight: '500', color: '#25d366', marginBottom: '4px' }}>
            Comment ça fonctionne
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            Sélectionnez un contact, choisissez un modèle de message ou rédigez le vôtre, puis cliquez pour ouvrir WhatsApp avec le message pré-rempli. Vos leads avec numéro de téléphone s'affichent automatiquement.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center' }}>
          <Loader2 size={32} style={{ color: '#25d366', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-muted)' }}>Chargement des contacts...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px' }}>
          {/* Contacts List */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}>
            {/* Search */}
            <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }} />
                <input
                  type="text"
                  placeholder="Rechercher un contact..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 10px 10px 38px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>

            {/* Contacts */}
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {filteredLeads.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <User size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    {leads.length === 0 
                      ? 'Aucun lead avec numéro de téléphone'
                      : 'Aucun résultat'}
                  </p>
                </div>
              ) : (
                filteredLeads.map(lead => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      background: selectedLead?.id === lead.id ? 'rgba(37, 211, 102, 0.1)' : 'transparent',
                      transition: 'background 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: 'var(--bg-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <User size={20} style={{ color: 'var(--text-muted)' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>
                          {lead.name || 'Sans nom'}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {lead.phone}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {formatDate(lead.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Message Composer */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            {selectedLead ? (
              <>
                {/* Selected Contact Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '20px',
                  borderBottom: '1px solid var(--border-color)',
                  marginBottom: '20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'rgba(37, 211, 102, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <User size={24} style={{ color: '#25d366' }} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{selectedLead.name || 'Contact'}</h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{selectedLead.phone}</p>
                    </div>
                  </div>
                  <a
                    href={`https://wa.me/${formatPhone(selectedLead.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      background: '#25d366',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: '500',
                      textDecoration: 'none',
                    }}
                  >
                    <MessageCircle size={16} />
                    Ouvrir WhatsApp
                    <ExternalLink size={14} />
                  </a>
                </div>

                {/* Lead Info */}
                {(selectedLead.email || selectedLead.property_interest || selectedLead.budget) && (
                  <div style={{
                    padding: '12px 16px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '8px',
                    marginBottom: '20px',
                    display: 'flex',
                    gap: '20px',
                    flexWrap: 'wrap',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                  }}>
                    {selectedLead.email && <span>📧 {selectedLead.email}</span>}
                    {selectedLead.property_interest && <span>🏠 {selectedLead.property_interest}</span>}
                    {selectedLead.budget && <span>💰 {selectedLead.budget.toLocaleString()}€</span>}
                  </div>
                )}

                {/* Message Templates */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '10px' }}>
                    Modèles de message
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {messageTemplates.map(template => (
                      <button
                        key={template.id}
                        onClick={() => {
                          setSelectedTemplate(template);
                          setCustomMessage(generateMessage(template, selectedLead));
                        }}
                        style={{
                          padding: '8px 14px',
                          background: selectedTemplate?.id === template.id ? 'rgba(37, 211, 102, 0.15)' : 'var(--bg-tertiary)',
                          border: `1px solid ${selectedTemplate?.id === template.id ? '#25d366' : 'var(--border-color)'}`,
                          borderRadius: '6px',
                          color: selectedTemplate?.id === template.id ? '#25d366' : 'var(--text-secondary)',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        {template.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '10px' }}>
                    Message
                  </label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Écrivez votre message ou sélectionnez un modèle ci-dessus..."
                    rows={6}
                    style={{
                      width: '100%',
                      padding: '14px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      color: 'var(--text-primary)',
                      fontSize: '14px',
                      resize: 'vertical',
                      lineHeight: '1.5',
                    }}
                  />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => copyMessage(customMessage)}
                    disabled={!customMessage}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '12px 20px',
                      background: copied ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-tertiary)',
                      border: `1px solid ${copied ? 'rgba(34, 197, 94, 0.3)' : 'var(--border-color)'}`,
                      borderRadius: '8px',
                      color: copied ? '#22c55e' : 'var(--text-secondary)',
                      fontSize: '14px',
                      cursor: customMessage ? 'pointer' : 'not-allowed',
                      opacity: customMessage ? 1 : 0.5,
                    }}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copié' : 'Copier'}
                  </button>
                  <button
                    onClick={() => openWhatsApp(selectedLead, customMessage)}
                    disabled={!customMessage}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 20px',
                      background: customMessage ? '#25d366' : 'var(--bg-tertiary)',
                      border: 'none',
                      borderRadius: '8px',
                      color: customMessage ? 'white' : 'var(--text-muted)',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: customMessage ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <Send size={18} />
                    Envoyer via WhatsApp
                  </button>
                </div>
              </>
            ) : (
              <div style={{ padding: '60px 20px', textAlign: 'center' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  background: 'rgba(37, 211, 102, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <MessageCircle size={36} style={{ color: '#25d366' }} />
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  Sélectionnez un contact
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  Choisissez un lead dans la liste pour lui envoyer un message WhatsApp
                </p>
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

export default WhatsAppIntegration;
