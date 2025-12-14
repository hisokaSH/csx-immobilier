import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Video,
  Home,
  Edit2,
  Trash2,
  Bell,
  Link2
} from 'lucide-react';

const eventTypes = [
  { id: 'visit', label: 'Visite', color: '#3b82f6', icon: Home },
  { id: 'call', label: 'Appel', color: '#22c55e', icon: Phone },
  { id: 'video', label: 'Visio', color: '#8b5cf6', icon: Video },
  { id: 'meeting', label: 'RDV', color: 'var(--gold)', icon: User },
];

const timeSlots = [];
for (let h = 8; h <= 20; h++) {
  timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
  timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
}

function SmartCalendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Visite - Appartement T3 Nice',
      type: 'visit',
      date: new Date(),
      time: '10:00',
      duration: 60,
      client: { name: 'Marie Dupont', phone: '06 12 34 56 78', email: 'marie@email.com' },
      address: '15 Rue de la Paix, Nice',
      notes: 'Client intéressé par vue mer',
    },
    {
      id: 2,
      title: 'Appel - Qualification lead',
      type: 'call',
      date: new Date(),
      time: '14:30',
      duration: 30,
      client: { name: 'Jean Martin', phone: '06 98 76 54 32', email: 'jean@email.com' },
    },
    {
      id: 3,
      title: 'Visio - Présentation projet',
      type: 'video',
      date: new Date(Date.now() + 86400000),
      time: '11:00',
      duration: 45,
      client: { name: 'Sophie Bernard', email: 'sophie@email.com' },
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [bookingLink, setBookingLink] = useState(`${window.location.origin}/book/${user?.id?.slice(0, 8) || 'demo'}`);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add empty days for padding
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
  };

  const copyBookingLink = () => {
    navigator.clipboard.writeText(bookingLink);
    alert('Lien copié !');
  };

  const dayEvents = getEventsForDate(selectedDate);

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
              <CalendarIcon size={24} style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Calendrier</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Gérez vos rendez-vous et visites
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={copyBookingLink}
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
              <Link2 size={18} />
              Lien de réservation
            </button>
            <button
              onClick={() => { setEditingEvent(null); setShowModal(true); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: 'var(--gold)',
                border: 'none',
                borderRadius: '10px',
                color: 'var(--bg-primary)',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <Plus size={18} />
              Nouveau RDV
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px' }}>
        {/* Calendar */}
        <div style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
        }}>
          {/* Month Navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '24px',
          }}>
            <button
              onClick={() => navigateMonth(-1)}
              style={{
                width: '36px',
                height: '36px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-primary)',
              }}
            >
              <ChevronLeft size={18} />
            </button>
            <h3 style={{ fontSize: '16px', fontWeight: '600', textTransform: 'capitalize' }}>
              {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={() => navigateMonth(1)}
              style={{
                width: '36px',
                height: '36px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-primary)',
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day Headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
            marginBottom: '8px',
          }}>
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
              <div key={day} style={{
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-muted)',
                padding: '8px 0',
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
          }}>
            {getDaysInMonth(currentDate).map((day, idx) => {
              const isToday = day && day.toDateString() === new Date().toDateString();
              const isSelected = day && day.toDateString() === selectedDate.toDateString();
              const dayEventsCount = day ? getEventsForDate(day).length : 0;

              return (
                <button
                  key={idx}
                  onClick={() => day && setSelectedDate(day)}
                  disabled={!day}
                  style={{
                    aspectRatio: '1',
                    background: isSelected ? 'var(--gold)' : isToday ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                    border: isToday && !isSelected ? '1px solid var(--gold)' : '1px solid transparent',
                    borderRadius: '8px',
                    color: isSelected ? 'var(--bg-primary)' : day ? 'var(--text-primary)' : 'transparent',
                    fontWeight: isToday || isSelected ? '600' : '400',
                    fontSize: '14px',
                    cursor: day ? 'pointer' : 'default',
                    position: 'relative',
                  }}
                >
                  {day?.getDate()}
                  {dayEventsCount > 0 && !isSelected && (
                    <div style={{
                      position: 'absolute',
                      bottom: '4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      gap: '2px',
                    }}>
                      {[...Array(Math.min(dayEventsCount, 3))].map((_, i) => (
                        <div key={i} style={{
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          background: 'var(--gold)',
                        }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Upcoming Reminders */}
          <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Bell size={16} style={{ color: 'var(--gold)' }} />
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Rappels</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {events.slice(0, 3).map(event => (
                <div key={event.id} style={{
                  padding: '10px 12px',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '8px',
                  fontSize: '13px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: eventTypes.find(t => t.id === event.type)?.color,
                    }} />
                    <span style={{ fontWeight: '500' }}>{event.time}</span>
                    <span style={{ color: 'var(--text-muted)' }}>-</span>
                    <span style={{ color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {event.client?.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Day View */}
        <div style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', textTransform: 'capitalize' }}>
            {formatDate(selectedDate)}
          </h3>

          {dayEvents.length === 0 ? (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}>
              <CalendarIcon size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
              <p style={{ fontSize: '15px' }}>Aucun rendez-vous ce jour</p>
              <button
                onClick={() => { setEditingEvent(null); setShowModal(true); }}
                style={{
                  marginTop: '16px',
                  padding: '10px 20px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Ajouter un RDV
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {dayEvents.map(event => {
                const eventType = eventTypes.find(t => t.id === event.type);
                const EventIcon = eventType?.icon || CalendarIcon;

                return (
                  <div
                    key={event.id}
                    style={{
                      padding: '20px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '12px',
                      borderLeft: `4px solid ${eventType?.color}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: `${eventType?.color}20`,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <EventIcon size={20} style={{ color: eventType?.color }} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: '15px', fontWeight: '600' }}>{event.title}</h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                            <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                              {event.time} ({event.duration} min)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button style={{
                          width: '32px',
                          height: '32px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                        }}>
                          <Edit2 size={14} />
                        </button>
                        <button style={{
                          width: '32px',
                          height: '32px',
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          color: '#ef4444',
                        }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Client Info */}
                    {event.client && (
                      <div style={{
                        padding: '12px',
                        background: 'var(--bg-card)',
                        borderRadius: '8px',
                        marginBottom: '12px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <User size={14} style={{ color: 'var(--text-muted)' }} />
                          <span style={{ fontSize: '14px', fontWeight: '500' }}>{event.client.name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          {event.client.phone && (
                            <a href={`tel:${event.client.phone}`} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '13px',
                              color: 'var(--text-muted)',
                              textDecoration: 'none',
                            }}>
                              <Phone size={12} />
                              {event.client.phone}
                            </a>
                          )}
                          {event.client.email && (
                            <a href={`mailto:${event.client.email}`} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '13px',
                              color: 'var(--text-muted)',
                              textDecoration: 'none',
                            }}>
                              <Mail size={12} />
                              {event.client.email}
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Address */}
                    {event.address && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                      }}>
                        <MapPin size={14} style={{ color: 'var(--text-muted)' }} />
                        {event.address}
                      </div>
                    )}

                    {/* Notes */}
                    {event.notes && (
                      <p style={{
                        marginTop: '12px',
                        padding: '10px',
                        background: 'rgba(212, 175, 55, 0.05)',
                        borderRadius: '6px',
                        fontSize: '13px',
                        color: 'var(--text-secondary)',
                        fontStyle: 'italic',
                      }}>
                        {event.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* New Event Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setShowModal(false)}>
          <div
            style={{
              width: '500px',
              background: 'var(--bg-card)',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Nouveau rendez-vous</h3>
              <button onClick={() => setShowModal(false)} style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '20px',
              }}>×</button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Event Type */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Type
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {eventTypes.map(type => (
                    <button key={type.id} style={{
                      flex: 1,
                      padding: '12px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      color: 'var(--text-primary)',
                    }}>
                      <type.icon size={20} style={{ color: type.color }} />
                      <span style={{ fontSize: '12px' }}>{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Titre
                </label>
                <input
                  type="text"
                  placeholder="Ex: Visite appartement T3"
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

              {/* Date & Time */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Date
                  </label>
                  <input
                    type="date"
                    defaultValue={selectedDate.toISOString().split('T')[0]}
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
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                    Heure
                  </label>
                  <select style={{
                    width: '100%',
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                  }}>
                    {timeSlots.map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Client */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                  Client
                </label>
                <input
                  type="text"
                  placeholder="Nom du client"
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

            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
            }}>
              <button onClick={() => setShowModal(false)} style={{
                padding: '10px 20px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                cursor: 'pointer',
              }}>
                Annuler
              </button>
              <button style={{
                padding: '10px 20px',
                background: 'var(--gold)',
                border: 'none',
                borderRadius: '8px',
                color: 'var(--bg-primary)',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
              }}>
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SmartCalendar;
