import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
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
  Link2,
  Copy,
  ExternalLink,
  Loader2
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

const STORAGE_KEY = 'csx_calendar_events';

function SmartCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [userId, setUserId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load events from localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        }
        
        // Load events from localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Convert date strings back to Date objects
          const loadedEvents = parsed.map(e => ({
            ...e,
            date: new Date(e.date),
          }));
          setEvents(loadedEvents);
        }
      } catch (err) {
        console.error('Error loading events:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Save events to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    }
  }, [events, loading]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add empty days for padding (start week on Monday)
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    ).sort((a, b) => a.time.localeCompare(b.time));
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleSaveEvent = (eventData) => {
    if (editingEvent) {
      setEvents(prev => prev.map(e => 
        e.id === editingEvent.id ? { ...eventData, id: e.id, date: new Date(eventData.date) } : e
      ));
    } else {
      const newEvent = {
        ...eventData,
        id: Date.now(),
        date: new Date(eventData.date),
      };
      setEvents(prev => [...prev, newEvent]);
    }
    setShowModal(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id) => {
    if (confirm('Supprimer ce rendez-vous ?')) {
      setEvents(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowModal(true);
  };

  const bookingLink = `${window.location.origin}/book/${userId?.slice(0, 8) || 'agent'}`;

  const copyBookingLink = async () => {
    try {
      await navigator.clipboard.writeText(bookingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const todayEvents = getEventsForDate(new Date());
  const selectedDateEvents = getEventsForDate(selectedDate);

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
          <button
            onClick={() => { setEditingEvent(null); setShowModal(true); }}
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
            <Plus size={18} />
            Nouveau RDV
          </button>
        </div>
      </div>

      {/* Booking Link */}
      <div style={{
        padding: '16px 20px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link2 size={18} style={{ color: 'var(--gold)' }} />
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            Lien de réservation (à partager avec vos clients)
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <code style={{
            padding: '8px 12px',
            background: 'var(--bg-tertiary)',
            borderRadius: '6px',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}>
            {bookingLink}
          </code>
          <button
            onClick={copyBookingLink}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              background: copied ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-tertiary)',
              border: `1px solid ${copied ? 'rgba(34, 197, 94, 0.2)' : 'var(--border-color)'}`,
              borderRadius: '6px',
              color: copied ? '#22c55e' : 'var(--text-secondary)',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copié' : 'Copier'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
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
            marginBottom: '20px',
          }}>
            <button
              onClick={() => navigateMonth(-1)}
              style={{
                padding: '8px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <h3 style={{ fontSize: '18px', fontWeight: '600', textTransform: 'capitalize' }}>
              {formatMonth(currentDate)}
            </h3>
            <button
              onClick={() => navigateMonth(1)}
              style={{
                padding: '8px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Day Headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
            marginBottom: '8px',
          }}>
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
              <div key={day} style={{
                textAlign: 'center',
                padding: '8px',
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--text-muted)',
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px',
          }}>
            {getDaysInMonth(currentDate).map((day, idx) => {
              const dayEvents = day ? getEventsForDate(day) : [];
              const isToday = day && day.toDateString() === new Date().toDateString();
              const isSelected = day && day.toDateString() === selectedDate.toDateString();

              return (
                <div
                  key={idx}
                  onClick={() => day && setSelectedDate(day)}
                  style={{
                    aspectRatio: '1',
                    padding: '4px',
                    background: isSelected ? 'var(--gold)' : isToday ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                    border: isToday && !isSelected ? '1px solid var(--gold)' : '1px solid transparent',
                    borderRadius: '8px',
                    cursor: day ? 'pointer' : 'default',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    gap: '2px',
                  }}
                >
                  {day && (
                    <>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: isToday || isSelected ? '600' : '400',
                        color: isSelected ? 'var(--bg-primary)' : 'var(--text-primary)',
                      }}>
                        {day.getDate()}
                      </span>
                      {dayEvents.length > 0 && (
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {dayEvents.slice(0, 3).map((event, i) => {
                            const type = eventTypes.find(t => t.id === event.type);
                            return (
                              <div
                                key={i}
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  background: type?.color || 'var(--gold)',
                                }}
                              />
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Events for Selected Date */}
        <div style={{
          padding: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
            {selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </h3>

          {selectedDateEvents.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}>
              <CalendarIcon size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p style={{ fontSize: '14px' }}>Aucun rendez-vous ce jour</p>
              <button
                onClick={() => { setEditingEvent(null); setShowModal(true); }}
                style={{
                  marginTop: '12px',
                  padding: '8px 16px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                + Ajouter un RDV
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {selectedDateEvents.map(event => {
                const type = eventTypes.find(t => t.id === event.type);
                const TypeIcon = type?.icon || CalendarIcon;
                
                return (
                  <div key={event.id} style={{
                    padding: '16px',
                    background: 'var(--bg-tertiary)',
                    borderRadius: '12px',
                    borderLeft: `4px solid ${type?.color || 'var(--gold)'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TypeIcon size={16} style={{ color: type?.color }} />
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>{event.title}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleEditEvent(event)}
                          style={{ padding: '4px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          style={{ padding: '4px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} /> {event.time} ({event.duration || 30} min)
                      </span>
                      {event.client?.name && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={12} /> {event.client.name}
                        </span>
                      )}
                      {event.address && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={12} /> {event.address}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Event Modal */}
      {showModal && (
        <EventModal
          event={editingEvent}
          selectedDate={selectedDate}
          onSave={handleSaveEvent}
          onClose={() => { setShowModal(false); setEditingEvent(null); }}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// Event Modal Component
function EventModal({ event, selectedDate, onSave, onClose }) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    type: event?.type || 'visit',
    date: event?.date?.toISOString().split('T')[0] || selectedDate.toISOString().split('T')[0],
    time: event?.time || '10:00',
    duration: event?.duration || 60,
    client: event?.client || { name: '', phone: '', email: '' },
    address: event?.address || '',
    notes: event?.notes || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.time) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }
    onSave(formData);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        background: 'var(--bg-card)',
        borderRadius: '16px',
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
            {event ? 'Modifier le RDV' : 'Nouveau rendez-vous'}
          </h3>
          <button
            onClick={onClose}
            style={{ padding: '8px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
              Titre *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
              Type
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {eventTypes.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.id })}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: formData.type === type.id ? type.color : 'var(--bg-tertiary)',
                    border: '1px solid ' + (formData.type === type.id ? type.color : 'var(--border-color)'),
                    borderRadius: '8px',
                    color: formData.type === type.id ? 'white' : 'var(--text-secondary)',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Heure *</label>
              <select
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
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
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>Durée</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
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
                <option value={15}>15 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>1h</option>
                <option value={90}>1h30</option>
                <option value={120}>2h</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
              Client
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <input
                type="text"
                value={formData.client.name}
                onChange={(e) => setFormData({ ...formData, client: { ...formData.client, name: e.target.value } })}
                placeholder="Nom"
                style={{
                  padding: '10px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              />
              <input
                type="tel"
                value={formData.client.phone}
                onChange={(e) => setFormData({ ...formData, client: { ...formData.client, phone: e.target.value } })}
                placeholder="Téléphone"
                style={{
                  padding: '10px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
              Adresse
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Lieu du rendez-vous"
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
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px' }}>
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes internes..."
              rows={3}
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
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '14px',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '14px',
                background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                border: 'none',
                borderRadius: '10px',
                color: 'var(--bg-primary)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              {event ? 'Enregistrer' : 'Créer le RDV'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SmartCalendar;
