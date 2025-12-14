import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageCircle,
  Send,
  Phone,
  Video,
  MoreVertical,
  Search,
  Paperclip,
  Smile,
  Mic,
  Check,
  CheckCheck,
  Clock,
  Image,
  Home,
  User,
  Star,
  Filter,
  Plus,
  Settings,
  Bell,
  BellOff,
  Archive,
  Trash2,
  ExternalLink,
  QrCode,
  Smartphone,
  RefreshCw,
  Zap,
  Bot
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Mock conversations data
const mockConversations = [
  {
    id: 1,
    name: 'Marie Dupont',
    phone: '+33 6 12 34 56 78',
    avatar: null,
    lastMessage: 'Bonjour, je suis intéressée par l\'appartement rue de Rivoli',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    unread: 2,
    status: 'online',
    leadId: 'lead_1',
    property: 'Appartement 3P - Rivoli',
  },
  {
    id: 2,
    name: 'Jean Martin',
    phone: '+33 6 98 76 54 32',
    avatar: null,
    lastMessage: 'Merci pour les informations, je réfléchis',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    unread: 0,
    status: 'offline',
    leadId: 'lead_2',
    property: 'Villa avec piscine - Nice',
  },
  {
    id: 3,
    name: 'Sophie Bernard',
    phone: '+33 6 55 44 33 22',
    avatar: null,
    lastMessage: 'Est-ce que la visite de samedi tient toujours ?',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    unread: 1,
    status: 'typing',
    leadId: 'lead_3',
    property: 'Maison 5P - Bordeaux',
  },
  {
    id: 4,
    name: 'Pierre Durand',
    phone: '+33 6 11 22 33 44',
    avatar: null,
    lastMessage: 'Photos reçues, merci !',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unread: 0,
    status: 'offline',
    leadId: 'lead_4',
    property: 'Studio - Paris 11e',
  },
];

const mockMessages = [
  { id: 1, text: 'Bonjour, je vous contacte suite à votre annonce pour l\'appartement rue de Rivoli', sender: 'them', timestamp: new Date(Date.now() - 1000 * 60 * 60) },
  { id: 2, text: 'Bonjour Marie ! Oui bien sûr, c\'est un magnifique 3 pièces de 75m²', sender: 'me', timestamp: new Date(Date.now() - 1000 * 60 * 55), status: 'read' },
  { id: 3, text: 'Il est disponible immédiatement et proche du métro', sender: 'me', timestamp: new Date(Date.now() - 1000 * 60 * 54), status: 'read' },
  { id: 4, text: 'Super ! Quels sont les horaires de visite possibles ?', sender: 'them', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
  { id: 5, text: 'Je suis disponible cette semaine : mardi 14h-18h ou jeudi toute la journée', sender: 'me', timestamp: new Date(Date.now() - 1000 * 60 * 25), status: 'read' },
  { id: 6, text: 'Bonjour, je suis intéressée par l\'appartement rue de Rivoli', sender: 'them', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
];

const quickReplies = [
  'Bonjour ! Comment puis-je vous aider ?',
  'Le bien est toujours disponible',
  'Je vous envoie les photos',
  'Quand êtes-vous disponible pour une visite ?',
  'Je vous recontacte rapidement',
];

function WhatsAppIntegration() {
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoReply, setAutoReply] = useState(true);
  const [notifications, setNotifications] = useState(true);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedConversation) {
      setMessages(mockMessages);
      scrollToBottom();
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const today = new Date();
    const msgDate = new Date(date);
    
    if (msgDate.toDateString() === today.toDateString()) {
      return formatTime(date);
    }
    if (msgDate.toDateString() === new Date(today - 86400000).toDateString()) {
      return 'Hier';
    }
    return msgDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  const connectWhatsApp = async () => {
    setIsConnecting(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsConnected(true);
    setIsConnecting(false);
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const msg = {
      id: messages.length + 1,
      text: newMessage,
      sender: 'me',
      timestamp: new Date(),
      status: 'sent',
    };
    
    setMessages([...messages, msg]);
    setNewMessage('');
    
    // Update conversation last message
    setConversations(convs => convs.map(c => 
      c.id === selectedConversation.id 
        ? { ...c, lastMessage: newMessage, timestamp: new Date() }
        : c
    ));
  };

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  if (!isConnected) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
              background: 'linear-gradient(135deg, rgba(37, 211, 102, 0.2) 0%, rgba(37, 211, 102, 0.05) 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <MessageCircle size={24} style={{ color: '#25D366' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '600' }}>WhatsApp Business</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Gérez vos conversations WhatsApp directement depuis l'application
              </p>
            </div>
          </div>
        </div>

        {/* Connection Card */}
        <div style={{
          padding: '60px 40px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          textAlign: 'center',
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            margin: '0 auto 32px',
            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
            borderRadius: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <MessageCircle size={60} style={{ color: 'white' }} />
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '12px' }}>
            Connectez WhatsApp Business
          </h2>
          <p style={{ 
            fontSize: '15px', 
            color: 'var(--text-muted)', 
            maxWidth: '400px', 
            margin: '0 auto 32px',
            lineHeight: '1.6',
          }}>
            Synchronisez vos conversations WhatsApp pour répondre à vos leads directement depuis CSX Immobilier
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            maxWidth: '350px',
            margin: '0 auto 32px',
            textAlign: 'left',
          }}>
            {[
              { icon: MessageCircle, text: 'Toutes vos conversations au même endroit' },
              { icon: Zap, text: 'Réponses rapides personnalisables' },
              { icon: Bot, text: 'Réponses automatiques intelligentes' },
              { icon: User, text: 'Synchronisation avec vos leads' },
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  background: 'rgba(37, 211, 102, 0.1)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <item.icon size={18} style={{ color: '#25D366' }} />
                </div>
                <span style={{ fontSize: '14px' }}>{item.text}</span>
              </div>
            ))}
          </div>

          <button
            onClick={connectWhatsApp}
            disabled={isConnecting}
            style={{
              padding: '16px 48px',
              background: isConnecting ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '16px',
              fontWeight: '600',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {isConnecting ? (
              <>
                <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Connexion en cours...
              </>
            ) : (
              <>
                <QrCode size={20} />
                Scanner le QR Code
              </>
            )}
          </button>

          <p style={{ 
            fontSize: '12px', 
            color: 'var(--text-muted)', 
            marginTop: '16px' 
          }}>
            Nécessite WhatsApp Business sur votre téléphone
          </p>
        </div>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              <MessageCircle size={24} style={{ color: '#25D366' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '600' }}>WhatsApp Business</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                <span style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  color: '#25D366',
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    background: '#25D366',
                    borderRadius: '50%',
                  }} />
                  Connecté
                </span>
                {' · '}{conversations.filter(c => c.unread > 0).length} non lus
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              padding: '10px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '350px 1fr',
        height: 'calc(100vh - 200px)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        overflow: 'hidden',
      }}>
        {/* Conversations List */}
        <div style={{
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Search */}
          <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 16px',
              background: 'var(--bg-primary)',
              borderRadius: '10px',
            }}>
              <Search size={18} style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Conversation List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredConversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                style={{
                  padding: '16px',
                  borderBottom: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  background: selectedConversation?.id === conv.id 
                    ? 'rgba(37, 211, 102, 0.1)' 
                    : 'transparent',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => {
                  if (selectedConversation?.id !== conv.id) {
                    e.currentTarget.style.background = 'var(--bg-primary)';
                  }
                }}
                onMouseLeave={e => {
                  if (selectedConversation?.id !== conv.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}>
                    <User size={24} style={{ color: 'var(--text-muted)' }} />
                    {conv.status === 'online' && (
                      <span style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        width: '12px',
                        height: '12px',
                        background: '#25D366',
                        borderRadius: '50%',
                        border: '2px solid var(--bg-card)',
                      }} />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                    }}>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>
                        {conv.name}
                      </span>
                      <span style={{ 
                        fontSize: '11px', 
                        color: conv.unread > 0 ? '#25D366' : 'var(--text-muted)' 
                      }}>
                        {formatDate(conv.timestamp)}
                      </span>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <p style={{
                        fontSize: '13px',
                        color: 'var(--text-muted)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '200px',
                      }}>
                        {conv.status === 'typing' ? (
                          <span style={{ color: '#25D366', fontStyle: 'italic' }}>
                            En train d'écrire...
                          </span>
                        ) : conv.lastMessage}
                      </p>
                      {conv.unread > 0 && (
                        <span style={{
                          minWidth: '20px',
                          height: '20px',
                          background: '#25D366',
                          color: 'white',
                          borderRadius: '10px',
                          fontSize: '11px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0 6px',
                        }}>
                          {conv.unread}
                        </span>
                      )}
                    </div>
                    <p style={{ 
                      fontSize: '11px', 
                      color: 'var(--gold)',
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      <Home size={10} />
                      {conv.property}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        {selectedConversation ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Chat Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'var(--bg-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <User size={20} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '600' }}>
                    {selectedConversation.name}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {selectedConversation.status === 'online' ? 'En ligne' : 
                     selectedConversation.status === 'typing' ? 'En train d\'écrire...' :
                     selectedConversation.phone}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  padding: '8px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}>
                  <Phone size={18} />
                </button>
                <button style={{
                  padding: '8px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}>
                  <Video size={18} />
                </button>
                <Link 
                  to="/leads"
                  style={{
                    padding: '8px 12px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                  }}
                >
                  <ExternalLink size={14} />
                  Voir lead
                </Link>
              </div>
            </div>

            {/* Messages */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              background: 'var(--bg-primary)',
            }}>
              {messages.map(msg => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    justifyContent: msg.sender === 'me' ? 'flex-end' : 'flex-start',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    padding: '10px 14px',
                    background: msg.sender === 'me' ? '#DCF8C6' : 'var(--bg-card)',
                    color: msg.sender === 'me' ? '#000' : 'var(--text-primary)',
                    borderRadius: msg.sender === 'me' 
                      ? '12px 12px 0 12px' 
                      : '12px 12px 12px 0',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  }}>
                    <p style={{ fontSize: '14px', lineHeight: '1.4' }}>{msg.text}</p>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '4px',
                    }}>
                      <span style={{ 
                        fontSize: '11px', 
                        color: msg.sender === 'me' ? 'rgba(0,0,0,0.5)' : 'var(--text-muted)' 
                      }}>
                        {formatTime(msg.timestamp)}
                      </span>
                      {msg.sender === 'me' && (
                        msg.status === 'read' ? (
                          <CheckCheck size={14} style={{ color: '#34B7F1' }} />
                        ) : msg.status === 'delivered' ? (
                          <CheckCheck size={14} style={{ color: 'rgba(0,0,0,0.3)' }} />
                        ) : (
                          <Check size={14} style={{ color: 'rgba(0,0,0,0.3)' }} />
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {showQuickReplies && (
              <div style={{
                padding: '12px 20px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                gap: '8px',
                flexWrap: 'wrap',
              }}>
                {quickReplies.map((reply, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setNewMessage(reply);
                      setShowQuickReplies(false);
                    }}
                    style={{
                      padding: '8px 12px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '16px',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div style={{
              padding: '16px 20px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <button
                onClick={() => setShowQuickReplies(!showQuickReplies)}
                style={{
                  padding: '10px',
                  background: showQuickReplies ? 'rgba(37, 211, 102, 0.1)' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  color: showQuickReplies ? '#25D366' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
                title="Réponses rapides"
              >
                <Zap size={20} />
              </button>
              <button style={{
                padding: '10px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}>
                <Paperclip size={20} />
              </button>
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 16px',
                background: 'var(--bg-primary)',
                borderRadius: '24px',
              }}>
                <input
                  type="text"
                  placeholder="Écrivez un message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && sendMessage()}
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}>
                  <Smile size={20} />
                </button>
              </div>
              {newMessage ? (
                <button
                  onClick={sendMessage}
                  style={{
                    padding: '12px',
                    background: '#25D366',
                    border: 'none',
                    borderRadius: '50%',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  <Send size={20} />
                </button>
              ) : (
                <button style={{
                  padding: '12px',
                  background: 'var(--bg-primary)',
                  border: 'none',
                  borderRadius: '50%',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}>
                  <Mic size={20} />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
          }}>
            <MessageCircle size={64} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p style={{ fontSize: '16px' }}>Sélectionnez une conversation</p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default WhatsAppIntegration;
