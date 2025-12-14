import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  Trash2,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  FileText,
  Clock,
  Wand2,
  Home,
  Building2,
  Download,
  AlertCircle,
  Info,
  Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const STORAGE_KEY = 'csx_voice_notes';

const propertyTemplates = [
  { id: 'apartment', name: 'Appartement', icon: Building2 },
  { id: 'house', name: 'Maison', icon: Home },
  { id: 'villa', name: 'Villa', icon: Home },
  { id: 'commercial', name: 'Local commercial', icon: Building2 },
];

function VoiceNotes() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('apartment');
  const [copied, setCopied] = useState(false);
  const [recentNotes, setRecentNotes] = useState([]);
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'fr-FR';

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }
      
      if (final) {
        setTranscription(prev => prev + final);
      }
      setInterimText(interim);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Accès au microphone refusé. Veuillez autoriser l\'accès dans les paramètres du navigateur.');
      } else if (event.error === 'no-speech') {
        // Ignore, will auto-restart
      } else {
        setError(`Erreur: ${event.error}`);
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      // Auto-restart if still recording
      if (isRecording && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Ignore if already started
        }
      }
    };

    recognitionRef.current = recognition;

    // Load saved notes
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setRecentNotes(JSON.parse(saved).slice(0, 5));
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current) return;
    
    setError(null);
    setInterimText('');
    
    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recognition:', err);
      setError('Impossible de démarrer la reconnaissance vocale.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setInterimText('');
  };

  const resetTranscription = () => {
    setTranscription('');
    setInterimText('');
    setGeneratedDescription('');
    setError(null);
  };

  const generateDescription = async () => {
    if (!transcription.trim()) {
      setError('Veuillez d\'abord dicter une description');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Call Claude API to generate formatted description
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          messages: [{
            role: 'user',
            content: `Tu es un expert en rédaction d'annonces immobilières. Transforme ces notes vocales en une description professionnelle et attractive pour un(e) ${propertyTemplates.find(t => t.id === selectedTemplate)?.name || 'bien immobilier'}.

Notes vocales:
${transcription}

Rédige une description:
- Structurée et fluide
- Mettant en valeur les points forts
- Professionnelle mais chaleureuse
- En français
- Sans inventer d'informations non mentionnées

Description:`
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Erreur API');
      }

      const data = await response.json();
      const description = data.content[0]?.text || '';
      setGeneratedDescription(description);

      // Save to recent notes
      const note = {
        id: Date.now(),
        date: new Date().toISOString(),
        transcription: transcription.trim(),
        description,
        template: selectedTemplate,
      };
      const newNotes = [note, ...recentNotes].slice(0, 5);
      setRecentNotes(newNotes);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));

    } catch (err) {
      console.error('Error generating description:', err);
      // Fallback: basic formatting without AI
      const formatted = transcription
        .split(/[.!?]+/)
        .filter(s => s.trim())
        .map(s => s.trim().charAt(0).toUpperCase() + s.trim().slice(1))
        .join('. ') + '.';
      
      setGeneratedDescription(formatted);
      setError('API indisponible. Description formatée sans IA.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const loadNote = (note) => {
    setTranscription(note.transcription);
    setGeneratedDescription(note.description || '');
    setSelectedTemplate(note.template || 'apartment');
  };

  if (!isSupported) {
    return (
      <div style={{ maxWidth: '800px', padding: '60px 20px', textAlign: 'center' }}>
        <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '16px' }} />
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
          Navigateur non supporté
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
          La reconnaissance vocale n'est pas disponible dans ce navigateur. 
          Utilisez Chrome, Edge, ou Safari pour cette fonctionnalité.
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '8px',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.05) 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Mic size={24} style={{ color: 'var(--gold)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Notes vocales</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Dictez vos descriptions, l'IA les formate
            </p>
          </div>
        </div>

        {/* Browser API badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.2)',
          borderRadius: '8px',
        }}>
          <Mic size={14} style={{ color: '#22c55e' }} />
          <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: '500' }}>
            Reconnaissance vocale Web Speech API (navigateur)
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        {/* Main Recording Area */}
        <div>
          {/* Template Selection */}
          <div style={{
            padding: '16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            marginBottom: '16px',
          }}>
            <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: '10px' }}>Type de bien</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              {propertyTemplates.map(template => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '10px',
                      background: selectedTemplate === template.id ? 'rgba(212, 175, 55, 0.15)' : 'var(--bg-tertiary)',
                      border: `1px solid ${selectedTemplate === template.id ? 'var(--gold)' : 'var(--border-color)'}`,
                      borderRadius: '8px',
                      color: selectedTemplate === template.id ? 'var(--gold)' : 'var(--text-secondary)',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    <Icon size={14} />
                    {template.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Recording Button */}
          <div style={{
            padding: '40px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            marginBottom: '16px',
            textAlign: 'center',
          }}>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: isRecording 
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: isRecording ? '0 0 0 8px rgba(239, 68, 68, 0.2)' : 'none',
                animation: isRecording ? 'pulse 2s infinite' : 'none',
              }}
            >
              {isRecording ? (
                <Square size={32} style={{ color: 'white' }} />
              ) : (
                <Mic size={36} style={{ color: 'var(--bg-primary)' }} />
              )}
            </button>
            <p style={{ fontSize: '16px', fontWeight: '500', marginBottom: '4px' }}>
              {isRecording ? 'Enregistrement en cours...' : 'Appuyez pour dicter'}
            </p>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              {isRecording ? 'Appuyez à nouveau pour arrêter' : 'Parlez clairement en français'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '8px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <AlertCircle size={16} style={{ color: '#ef4444' }} />
              <span style={{ fontSize: '13px', color: '#ef4444' }}>{error}</span>
            </div>
          )}

          {/* Transcription */}
          <div style={{
            padding: '20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600' }}>Transcription</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {transcription && (
                  <>
                    <button
                      onClick={() => copyToClipboard(transcription)}
                      style={{
                        padding: '6px 10px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        color: 'var(--text-muted)',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Copy size={12} /> Copier
                    </button>
                    <button
                      onClick={resetTranscription}
                      style={{
                        padding: '6px 10px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#ef4444',
                        fontSize: '11px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Trash2 size={12} /> Effacer
                    </button>
                  </>
                )}
              </div>
            </div>
            <div style={{
              minHeight: '120px',
              padding: '16px',
              background: 'var(--bg-tertiary)',
              borderRadius: '10px',
              fontSize: '14px',
              lineHeight: '1.6',
              color: transcription ? 'var(--text-primary)' : 'var(--text-muted)',
            }}>
              {transcription || interimText ? (
                <>
                  {transcription}
                  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{interimText}</span>
                </>
              ) : (
                'Votre transcription apparaîtra ici en temps réel...'
              )}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateDescription}
            disabled={!transcription.trim() || isGenerating}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px',
              background: transcription.trim() && !isGenerating
                ? 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)'
                : 'var(--bg-tertiary)',
              border: 'none',
              borderRadius: '12px',
              color: transcription.trim() && !isGenerating ? 'var(--bg-primary)' : 'var(--text-muted)',
              fontSize: '15px',
              fontWeight: '600',
              cursor: transcription.trim() && !isGenerating ? 'pointer' : 'not-allowed',
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                Génération en cours...
              </>
            ) : (
              <>
                <Wand2 size={20} />
                Générer la description
              </>
            )}
          </button>

          {/* Generated Description */}
          {generatedDescription && (
            <div style={{
              marginTop: '16px',
              padding: '20px',
              background: 'var(--bg-card)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--gold)' }}>
                  ✨ Description générée
                </h3>
                <button
                  onClick={() => copyToClipboard(generatedDescription)}
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
                  {copied ? 'Copié !' : 'Copier'}
                </button>
              </div>
              <div style={{
                padding: '16px',
                background: 'var(--bg-tertiary)',
                borderRadius: '10px',
                fontSize: '14px',
                lineHeight: '1.7',
                whiteSpace: 'pre-wrap',
              }}>
                {generatedDescription}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Recent Notes */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          padding: '20px',
          height: 'fit-content',
        }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>
            Notes récentes
          </h3>
          
          {recentNotes.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <FileText size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <p style={{ fontSize: '13px' }}>Aucune note sauvegardée</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentNotes.map(note => (
                <button
                  key={note.id}
                  onClick={() => loadNote(note)}
                  style={{
                    padding: '12px',
                    background: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(note.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {note.transcription}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Tips */}
          <div style={{
            marginTop: '20px',
            padding: '12px',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '8px',
          }}>
            <p style={{ fontSize: '11px', color: '#3b82f6', lineHeight: '1.5' }}>
              💡 <strong>Conseils:</strong> Parlez clairement, mentionnez la surface, le nombre de pièces, 
              l'exposition, les équipements et le quartier.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0.2); }
          50% { box-shadow: 0 0 0 16px rgba(239, 68, 68, 0.1); }
        }
      `}</style>
    </div>
  );
}

export default VoiceNotes;
