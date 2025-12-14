import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
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
  Download
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const propertyTemplates = [
  { id: 'apartment', name: 'Appartement', icon: Building2 },
  { id: 'house', name: 'Maison', icon: Home },
  { id: 'villa', name: 'Villa', icon: Home },
  { id: 'commercial', name: 'Local commercial', icon: Building2 },
];

function VoiceNotes() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('apartment');
  const [copied, setCopied] = useState(false);
  const [recentNotes, setRecentNotes] = useState([]);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Load recent notes from localStorage
    const saved = localStorage.getItem('csx_voice_notes');
    if (saved) {
      setRecentNotes(JSON.parse(saved).slice(0, 5));
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
      setIsPaused(false);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Impossible d\'accéder au microphone. Vérifiez les permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      clearInterval(timerRef.current);
    }
  };

  const resetRecording = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setTranscription('');
    setGeneratedDescription('');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const transcribeAudio = async () => {
    if (!audioBlob) return;
    
    setIsTranscribing(true);
    
    // Simulate transcription (in production, use Whisper API or similar)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulated transcription result
    const mockTranscription = `Appartement lumineux de 75 mètres carrés situé au troisième étage avec ascenseur. 
Le salon est très spacieux avec une grande baie vitrée donnant sur un balcon exposé sud. 
Cuisine équipée récente avec électroménager haut de gamme. 
Deux chambres dont une suite parentale avec salle de bain privative. 
Parquet massif dans tout l'appartement. 
Cave et place de parking incluses. 
Proche transports en commun et commerces.`;
    
    setTranscription(mockTranscription);
    setIsTranscribing(false);
  };

  const generateDescription = async () => {
    if (!transcription) return;
    
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const generated = `✨ **Appartement d'exception de 75m² - Luminosité garantie**

Niché au 3ème étage d'une résidence sécurisée avec ascenseur, ce bien d'exception vous séduira par ses volumes généreux et sa luminosité exceptionnelle.

**Les points forts :**
• Séjour de 30m² baigné de lumière grâce à une baie vitrée panoramique
• Balcon exposé plein Sud - parfait pour vos moments de détente
• Cuisine équipée dernier cri avec électroménager premium
• Suite parentale avec salle de bain privative
• Parquet massif d'origine soigneusement entretenu

**Les + pratiques :**
✓ Cave privative
✓ Place de parking sécurisée
✓ À deux pas des transports et commerces

Une opportunité rare dans ce secteur prisé. Contactez-nous pour une visite !`;
    
    setGeneratedDescription(generated);
    setIsGenerating(false);
    
    // Save to recent notes
    const note = {
      id: Date.now(),
      date: new Date().toISOString(),
      duration: recordingTime,
      transcription,
      description: generated,
    };
    const updated = [note, ...recentNotes].slice(0, 5);
    setRecentNotes(updated);
    localStorage.setItem('csx_voice_notes', JSON.stringify(updated));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ maxWidth: '1000px' }}>
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
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Mic size={24} style={{ color: '#ef4444' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Notes Vocales</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Enregistrez vos notes et convertissez-les en descriptions professionnelles
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
        {/* Main Content */}
        <div>
          {/* Recording Section */}
          <div style={{
            padding: '40px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            textAlign: 'center',
            marginBottom: '24px',
          }}>
            {/* Visualizer */}
            <div style={{
              width: '200px',
              height: '200px',
              margin: '0 auto 32px',
              borderRadius: '50%',
              background: isRecording 
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.05) 100%)'
                : 'var(--bg-primary)',
              border: isRecording ? '3px solid #ef4444' : '3px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              animation: isRecording && !isPaused ? 'pulse 2s ease-in-out infinite' : 'none',
            }}>
              {isRecording ? (
                <div style={{ textAlign: 'center' }}>
                  <Mic size={48} style={{ color: '#ef4444', marginBottom: '8px' }} />
                  <p style={{ 
                    fontSize: '32px', 
                    fontWeight: '700', 
                    color: '#ef4444',
                    fontFamily: 'monospace',
                  }}>
                    {formatTime(recordingTime)}
                  </p>
                  {isPaused && (
                    <span style={{ 
                      fontSize: '12px', 
                      color: 'var(--text-muted)',
                      textTransform: 'uppercase',
                    }}>
                      En pause
                    </span>
                  )}
                </div>
              ) : audioUrl ? (
                <div style={{ textAlign: 'center' }}>
                  <FileText size={48} style={{ color: 'var(--gold)', marginBottom: '8px' }} />
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    {formatTime(recordingTime)} enregistré
                  </p>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <Mic size={48} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    Prêt à enregistrer
                  </p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              {!isRecording && !audioUrl ? (
                <button
                  onClick={startRecording}
                  style={{
                    padding: '16px 32px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Mic size={20} />
                  Commencer l'enregistrement
                </button>
              ) : isRecording ? (
                <>
                  <button
                    onClick={pauseRecording}
                    style={{
                      padding: '16px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    {isPaused ? <Play size={24} /> : <Pause size={24} />}
                  </button>
                  <button
                    onClick={stopRecording}
                    style={{
                      padding: '16px 32px',
                      background: 'var(--gold)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'black',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <Square size={20} />
                    Terminer
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={resetRecording}
                    style={{
                      padding: '16px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={24} />
                  </button>
                  <button
                    onClick={transcribeAudio}
                    disabled={isTranscribing}
                    style={{
                      padding: '16px 32px',
                      background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'black',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: isTranscribing ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {isTranscribing ? (
                      <>
                        <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
                        Transcription...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Transcrire
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Audio Player */}
            {audioUrl && (
              <div style={{ marginTop: '24px' }}>
                <audio ref={audioRef} src={audioUrl} controls style={{ width: '100%' }} />
              </div>
            )}
          </div>

          {/* Transcription */}
          {transcription && (
            <div style={{
              padding: '24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              marginBottom: '24px',
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '16px',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: '600' }}>
                  Transcription
                </h3>
                <button
                  onClick={() => copyToClipboard(transcription)}
                  style={{
                    padding: '8px 16px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copié !' : 'Copier'}
                </button>
              </div>
              <textarea
                value={transcription}
                onChange={e => setTranscription(e.target.value)}
                style={{
                  width: '100%',
                  minHeight: '150px',
                  padding: '16px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  resize: 'vertical',
                }}
              />
              <button
                onClick={generateDescription}
                disabled={isGenerating}
                style={{
                  marginTop: '16px',
                  padding: '14px 24px',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Génération IA...
                  </>
                ) : (
                  <>
                    <Wand2 size={18} />
                    Générer une description professionnelle
                  </>
                )}
              </button>
            </div>
          )}

          {/* Generated Description */}
          {generatedDescription && (
            <div style={{
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '16px',
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={20} style={{ color: '#8b5cf6' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '600' }}>
                    Description générée par IA
                  </h3>
                </div>
                <button
                  onClick={() => copyToClipboard(generatedDescription)}
                  style={{
                    padding: '8px 16px',
                    background: '#8b5cf6',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copié !' : 'Copier'}
                </button>
              </div>
              <div style={{
                padding: '16px',
                background: 'var(--bg-card)',
                borderRadius: '8px',
                whiteSpace: 'pre-wrap',
                fontSize: '14px',
                lineHeight: '1.6',
              }}>
                {generatedDescription}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Template Selection */}
          <div style={{
            padding: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            marginBottom: '24px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              Type de bien
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {propertyTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  style={{
                    padding: '12px 16px',
                    background: selectedTemplate === template.id 
                      ? 'rgba(212, 175, 55, 0.1)' 
                      : 'var(--bg-primary)',
                    border: selectedTemplate === template.id 
                      ? '1px solid var(--gold)' 
                      : '1px solid var(--border-color)',
                    borderRadius: '10px',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'left',
                  }}
                >
                  <template.icon size={20} style={{ 
                    color: selectedTemplate === template.id ? 'var(--gold)' : 'var(--text-muted)' 
                  }} />
                  <span style={{ fontWeight: selectedTemplate === template.id ? '600' : '400' }}>
                    {template.name}
                  </span>
                  {selectedTemplate === template.id && (
                    <Check size={16} style={{ color: 'var(--gold)', marginLeft: 'auto' }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div style={{
            padding: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            marginBottom: '24px',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
              💡 Conseils
            </h3>
            <ul style={{
              fontSize: '13px',
              color: 'var(--text-muted)',
              lineHeight: '1.8',
              paddingLeft: '20px',
            }}>
              <li>Décrivez chaque pièce clairement</li>
              <li>Mentionnez les surfaces et dimensions</li>
              <li>Parlez des points forts (luminosité, vue, calme...)</li>
              <li>N'oubliez pas les équipements inclus</li>
              <li>Indiquez les transports et commerces à proximité</li>
            </ul>
          </div>

          {/* Recent Notes */}
          {recentNotes.length > 0 && (
            <div style={{
              padding: '24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
                Notes récentes
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {recentNotes.map(note => (
                  <div
                    key={note.id}
                    style={{
                      padding: '12px',
                      background: 'var(--bg-primary)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setTranscription(note.transcription);
                      setGeneratedDescription(note.description);
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                    }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {new Date(note.date).toLocaleDateString('fr-FR')}
                      </span>
                      <span style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px',
                        fontSize: '12px', 
                        color: 'var(--text-muted)' 
                      }}>
                        <Clock size={12} />
                        {formatTime(note.duration)}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {note.transcription.substring(0, 60)}...
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
          50% { box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default VoiceNotes;
