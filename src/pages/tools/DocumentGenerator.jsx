import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import {
  FileText,
  Download,
  Upload,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Building2,
  ChevronRight,
  X,
  FileCheck,
  FilePlus,
  Home,
  Users,
  ClipboardList,
  Key,
  FileSignature,
  Search,
  Check,
  File
} from 'lucide-react';

const STORAGE_KEY = 'csx_documents';

// Complete list of real estate document templates
const documentTemplates = [
  // MANDATS
  {
    id: 'mandat_vente_exclusif',
    name: 'Mandat de vente exclusif',
    description: 'Mandat exclusif pour la vente d\'un bien immobilier',
    category: 'Mandats',
    icon: FileCheck,
    fields: [
      { key: 'vendor_name', label: 'Nom du vendeur', type: 'text', required: true },
      { key: 'vendor_address', label: 'Adresse du vendeur', type: 'text' },
      { key: 'vendor_phone', label: 'Téléphone vendeur', type: 'text' },
      { key: 'vendor_email', label: 'Email vendeur', type: 'email' },
      { key: 'property_address', label: 'Adresse du bien', type: 'text', required: true, autoFill: 'location' },
      { key: 'property_type', label: 'Type de bien', type: 'select', options: ['Appartement', 'Maison', 'Villa', 'Terrain', 'Local commercial', 'Immeuble'], autoFill: 'property_type' },
      { key: 'surface', label: 'Surface (m²)', type: 'number', autoFill: 'surface' },
      { key: 'rooms', label: 'Nombre de pièces', type: 'number', autoFill: 'rooms' },
      { key: 'price', label: 'Prix de vente (€)', type: 'number', required: true, autoFill: 'price' },
      { key: 'commission_rate', label: 'Honoraires (%)', type: 'number', default: 5 },
      { key: 'commission_payer', label: 'Honoraires à la charge de', type: 'select', options: ['Vendeur', 'Acquéreur', 'Partagés'] },
      { key: 'duration_months', label: 'Durée du mandat (mois)', type: 'number', default: 3 },
      { key: 'start_date', label: 'Date de début', type: 'date' },
    ],
  },
  {
    id: 'mandat_vente_simple',
    name: 'Mandat de vente simple',
    description: 'Mandat simple (non exclusif) pour la vente',
    category: 'Mandats',
    icon: FileCheck,
    fields: [
      { key: 'vendor_name', label: 'Nom du vendeur', type: 'text', required: true },
      { key: 'vendor_address', label: 'Adresse du vendeur', type: 'text' },
      { key: 'property_address', label: 'Adresse du bien', type: 'text', required: true, autoFill: 'location' },
      { key: 'property_type', label: 'Type de bien', type: 'select', options: ['Appartement', 'Maison', 'Villa', 'Terrain', 'Local commercial'], autoFill: 'property_type' },
      { key: 'surface', label: 'Surface (m²)', type: 'number', autoFill: 'surface' },
      { key: 'price', label: 'Prix de vente (€)', type: 'number', required: true, autoFill: 'price' },
      { key: 'commission_rate', label: 'Honoraires (%)', type: 'number', default: 5 },
      { key: 'duration_months', label: 'Durée du mandat (mois)', type: 'number', default: 3 },
      { key: 'start_date', label: 'Date de début', type: 'date' },
    ],
  },
  {
    id: 'mandat_location',
    name: 'Mandat de location',
    description: 'Mandat pour la mise en location d\'un bien',
    category: 'Mandats',
    icon: Key,
    fields: [
      { key: 'owner_name', label: 'Nom du propriétaire', type: 'text', required: true },
      { key: 'owner_address', label: 'Adresse du propriétaire', type: 'text' },
      { key: 'property_address', label: 'Adresse du bien', type: 'text', required: true, autoFill: 'location' },
      { key: 'property_type', label: 'Type de bien', type: 'select', options: ['Appartement', 'Maison', 'Studio', 'Local commercial'], autoFill: 'property_type' },
      { key: 'surface', label: 'Surface (m²)', type: 'number', autoFill: 'surface' },
      { key: 'rent', label: 'Loyer mensuel HC (€)', type: 'number', required: true, autoFill: 'price' },
      { key: 'charges', label: 'Charges mensuelles (€)', type: 'number' },
      { key: 'deposit_months', label: 'Dépôt de garantie (mois)', type: 'number', default: 1 },
      { key: 'furnished', label: 'Meublé', type: 'select', options: ['Oui', 'Non'] },
      { key: 'commission', label: 'Honoraires location (€)', type: 'number' },
    ],
  },
  {
    id: 'mandat_recherche',
    name: 'Mandat de recherche',
    description: 'Mandat pour rechercher un bien pour un acquéreur',
    category: 'Mandats',
    icon: Search,
    fields: [
      { key: 'client_name', label: 'Nom du client', type: 'text', required: true },
      { key: 'client_address', label: 'Adresse du client', type: 'text' },
      { key: 'client_phone', label: 'Téléphone', type: 'text' },
      { key: 'search_type', label: 'Type de bien recherché', type: 'select', options: ['Appartement', 'Maison', 'Villa', 'Terrain', 'Local commercial'] },
      { key: 'search_location', label: 'Secteur géographique', type: 'text', required: true },
      { key: 'budget_min', label: 'Budget minimum (€)', type: 'number' },
      { key: 'budget_max', label: 'Budget maximum (€)', type: 'number', required: true },
      { key: 'surface_min', label: 'Surface minimum (m²)', type: 'number' },
      { key: 'rooms_min', label: 'Nombre de pièces minimum', type: 'number' },
      { key: 'criteria', label: 'Critères spécifiques', type: 'textarea' },
      { key: 'commission_rate', label: 'Honoraires (%)', type: 'number', default: 3 },
    ],
  },
  
  // VISITES
  {
    id: 'bon_visite',
    name: 'Bon de visite',
    description: 'Confirmation de visite signée par le client',
    category: 'Visites',
    icon: ClipboardList,
    fields: [
      { key: 'client_name', label: 'Nom du visiteur', type: 'text', required: true },
      { key: 'client_phone', label: 'Téléphone', type: 'text' },
      { key: 'client_email', label: 'Email', type: 'email' },
      { key: 'property_address', label: 'Adresse du bien visité', type: 'text', required: true, autoFill: 'location' },
      { key: 'property_ref', label: 'Référence du bien', type: 'text', autoFill: 'id' },
      { key: 'property_price', label: 'Prix du bien (€)', type: 'number', autoFill: 'price' },
      { key: 'visit_date', label: 'Date de visite', type: 'date', required: true },
      { key: 'visit_time', label: 'Heure de visite', type: 'time' },
      { key: 'agent_name', label: 'Nom de l\'agent', type: 'text', required: true },
    ],
  },
  {
    id: 'compte_rendu_visite',
    name: 'Compte-rendu de visite',
    description: 'Rapport détaillé après une visite',
    category: 'Visites',
    icon: FileText,
    fields: [
      { key: 'client_name', label: 'Nom du client', type: 'text', required: true },
      { key: 'property_address', label: 'Adresse du bien', type: 'text', required: true, autoFill: 'location' },
      { key: 'visit_date', label: 'Date de visite', type: 'date', required: true },
      { key: 'interest_level', label: 'Niveau d\'intérêt', type: 'select', options: ['Très intéressé', 'Intéressé', 'Hésitant', 'Pas intéressé'] },
      { key: 'positive_points', label: 'Points positifs relevés', type: 'textarea' },
      { key: 'negative_points', label: 'Points négatifs relevés', type: 'textarea' },
      { key: 'client_questions', label: 'Questions du client', type: 'textarea' },
      { key: 'next_steps', label: 'Prochaines étapes', type: 'textarea' },
      { key: 'agent_notes', label: 'Notes internes agent', type: 'textarea' },
    ],
  },

  // TRANSACTIONS
  {
    id: 'offre_achat',
    name: 'Offre d\'achat',
    description: 'Proposition d\'achat formelle',
    category: 'Transactions',
    icon: FilePlus,
    fields: [
      { key: 'buyer_name', label: 'Nom de l\'acquéreur', type: 'text', required: true },
      { key: 'buyer_address', label: 'Adresse de l\'acquéreur', type: 'text' },
      { key: 'buyer_phone', label: 'Téléphone', type: 'text' },
      { key: 'property_address', label: 'Adresse du bien', type: 'text', required: true, autoFill: 'location' },
      { key: 'asking_price', label: 'Prix affiché (€)', type: 'number', autoFill: 'price' },
      { key: 'offer_price', label: 'Prix proposé (€)', type: 'number', required: true },
      { key: 'financing_type', label: 'Mode de financement', type: 'select', options: ['Comptant', 'Crédit immobilier', 'Mixte'] },
      { key: 'loan_amount', label: 'Montant du prêt envisagé (€)', type: 'number' },
      { key: 'personal_contribution', label: 'Apport personnel (€)', type: 'number' },
      { key: 'conditions', label: 'Conditions suspensives', type: 'textarea', default: 'Obtention du financement' },
      { key: 'validity_days', label: 'Validité de l\'offre (jours)', type: 'number', default: 10 },
      { key: 'desired_date', label: 'Date de signature souhaitée', type: 'date' },
    ],
  },
  {
    id: 'compromis_vente',
    name: 'Compromis de vente (avant-contrat)',
    description: 'Promesse synallagmatique de vente',
    category: 'Transactions',
    icon: FileSignature,
    fields: [
      { key: 'seller_name', label: 'Nom du vendeur', type: 'text', required: true },
      { key: 'seller_address', label: 'Adresse du vendeur', type: 'text' },
      { key: 'buyer_name', label: 'Nom de l\'acquéreur', type: 'text', required: true },
      { key: 'buyer_address', label: 'Adresse de l\'acquéreur', type: 'text' },
      { key: 'property_address', label: 'Adresse du bien', type: 'text', required: true, autoFill: 'location' },
      { key: 'property_description', label: 'Désignation du bien', type: 'textarea', autoFill: 'description' },
      { key: 'surface', label: 'Surface (m²)', type: 'number', autoFill: 'surface' },
      { key: 'sale_price', label: 'Prix de vente (€)', type: 'number', required: true, autoFill: 'price' },
      { key: 'deposit_amount', label: 'Dépôt de garantie (€)', type: 'number' },
      { key: 'notary_name', label: 'Notaire désigné', type: 'text' },
      { key: 'conditions', label: 'Conditions suspensives', type: 'textarea' },
      { key: 'signing_deadline', label: 'Date limite signature acte', type: 'date' },
    ],
  },

  // LOCATION
  {
    id: 'bail_habitation',
    name: 'Bail d\'habitation',
    description: 'Contrat de location vide ou meublée',
    category: 'Location',
    icon: Key,
    fields: [
      { key: 'owner_name', label: 'Nom du bailleur', type: 'text', required: true },
      { key: 'owner_address', label: 'Adresse du bailleur', type: 'text' },
      { key: 'tenant_name', label: 'Nom du locataire', type: 'text', required: true },
      { key: 'tenant_address', label: 'Adresse actuelle du locataire', type: 'text' },
      { key: 'property_address', label: 'Adresse du bien loué', type: 'text', required: true, autoFill: 'location' },
      { key: 'property_type', label: 'Type de location', type: 'select', options: ['Vide', 'Meublée'] },
      { key: 'surface', label: 'Surface habitable (m²)', type: 'number', autoFill: 'surface' },
      { key: 'rooms', label: 'Nombre de pièces', type: 'number', autoFill: 'rooms' },
      { key: 'rent', label: 'Loyer mensuel HC (€)', type: 'number', required: true, autoFill: 'price' },
      { key: 'charges', label: 'Provisions pour charges (€)', type: 'number' },
      { key: 'deposit', label: 'Dépôt de garantie (€)', type: 'number' },
      { key: 'start_date', label: 'Date d\'effet du bail', type: 'date', required: true },
      { key: 'duration', label: 'Durée du bail', type: 'select', options: ['1 an (meublé)', '3 ans (vide)', '6 ans (personne morale)'] },
    ],
  },
  {
    id: 'etat_lieux_entree',
    name: 'État des lieux d\'entrée',
    description: 'Constat de l\'état du logement à l\'entrée',
    category: 'Location',
    icon: ClipboardList,
    fields: [
      { key: 'owner_name', label: 'Nom du bailleur', type: 'text', required: true },
      { key: 'tenant_name', label: 'Nom du locataire', type: 'text', required: true },
      { key: 'property_address', label: 'Adresse du bien', type: 'text', required: true, autoFill: 'location' },
      { key: 'date', label: 'Date de l\'état des lieux', type: 'date', required: true },
      { key: 'meter_electricity', label: 'Relevé compteur électricité', type: 'text' },
      { key: 'meter_gas', label: 'Relevé compteur gaz', type: 'text' },
      { key: 'meter_water', label: 'Relevé compteur eau', type: 'text' },
      { key: 'keys_count', label: 'Nombre de clés remises', type: 'number' },
      { key: 'entrance', label: 'État - Entrée', type: 'textarea' },
      { key: 'living_room', label: 'État - Séjour', type: 'textarea' },
      { key: 'kitchen', label: 'État - Cuisine', type: 'textarea' },
      { key: 'bedrooms', label: 'État - Chambres', type: 'textarea' },
      { key: 'bathroom', label: 'État - Salle de bain', type: 'textarea' },
      { key: 'wc', label: 'État - WC', type: 'textarea' },
      { key: 'other_rooms', label: 'État - Autres pièces', type: 'textarea' },
      { key: 'observations', label: 'Observations générales', type: 'textarea' },
    ],
  },
  {
    id: 'etat_lieux_sortie',
    name: 'État des lieux de sortie',
    description: 'Constat de l\'état du logement à la sortie',
    category: 'Location',
    icon: ClipboardList,
    fields: [
      { key: 'owner_name', label: 'Nom du bailleur', type: 'text', required: true },
      { key: 'tenant_name', label: 'Nom du locataire', type: 'text', required: true },
      { key: 'property_address', label: 'Adresse du bien', type: 'text', required: true, autoFill: 'location' },
      { key: 'date', label: 'Date de l\'état des lieux', type: 'date', required: true },
      { key: 'meter_electricity', label: 'Relevé compteur électricité', type: 'text' },
      { key: 'meter_gas', label: 'Relevé compteur gaz', type: 'text' },
      { key: 'meter_water', label: 'Relevé compteur eau', type: 'text' },
      { key: 'keys_returned', label: 'Nombre de clés rendues', type: 'number' },
      { key: 'entrance', label: 'État - Entrée', type: 'textarea' },
      { key: 'living_room', label: 'État - Séjour', type: 'textarea' },
      { key: 'kitchen', label: 'État - Cuisine', type: 'textarea' },
      { key: 'bedrooms', label: 'État - Chambres', type: 'textarea' },
      { key: 'bathroom', label: 'État - Salle de bain', type: 'textarea' },
      { key: 'wc', label: 'État - WC', type: 'textarea' },
      { key: 'damages', label: 'Dégradations constatées', type: 'textarea' },
      { key: 'deductions', label: 'Retenues sur dépôt (€)', type: 'number' },
    ],
  },
  {
    id: 'quittance_loyer',
    name: 'Quittance de loyer',
    description: 'Reçu de paiement du loyer mensuel',
    category: 'Location',
    icon: FileCheck,
    fields: [
      { key: 'owner_name', label: 'Nom du bailleur', type: 'text', required: true },
      { key: 'tenant_name', label: 'Nom du locataire', type: 'text', required: true },
      { key: 'property_address', label: 'Adresse du bien', type: 'text', required: true },
      { key: 'period', label: 'Période concernée', type: 'text', required: true },
      { key: 'rent', label: 'Loyer (€)', type: 'number', required: true },
      { key: 'charges', label: 'Charges (€)', type: 'number' },
      { key: 'total', label: 'Total payé (€)', type: 'number', required: true },
      { key: 'payment_date', label: 'Date de paiement', type: 'date', required: true },
      { key: 'payment_method', label: 'Mode de paiement', type: 'select', options: ['Virement', 'Chèque', 'Espèces', 'Prélèvement'] },
    ],
  },

  // ESTIMATIONS
  {
    id: 'estimation_bien',
    name: 'Rapport d\'estimation',
    description: 'Estimation détaillée de la valeur d\'un bien',
    category: 'Estimations',
    icon: Building2,
    fields: [
      { key: 'owner_name', label: 'Nom du propriétaire', type: 'text' },
      { key: 'property_address', label: 'Adresse du bien', type: 'text', required: true, autoFill: 'location' },
      { key: 'property_type', label: 'Type de bien', type: 'select', options: ['Appartement', 'Maison', 'Villa', 'Terrain', 'Local commercial', 'Immeuble'], autoFill: 'property_type' },
      { key: 'surface', label: 'Surface habitable (m²)', type: 'number', required: true, autoFill: 'surface' },
      { key: 'land_surface', label: 'Surface terrain (m²)', type: 'number' },
      { key: 'rooms', label: 'Nombre de pièces', type: 'number', autoFill: 'rooms' },
      { key: 'bedrooms', label: 'Nombre de chambres', type: 'number', autoFill: 'bedrooms' },
      { key: 'year_built', label: 'Année de construction', type: 'number' },
      { key: 'condition', label: 'État général', type: 'select', options: ['Neuf', 'Excellent', 'Bon', 'Correct', 'À rafraîchir', 'À rénover'] },
      { key: 'dpe', label: 'Classe DPE', type: 'select', options: ['A', 'B', 'C', 'D', 'E', 'F', 'G'] },
      { key: 'features', label: 'Caractéristiques (parking, terrasse, piscine...)', type: 'textarea', autoFill: 'features' },
      { key: 'strengths', label: 'Points forts', type: 'textarea' },
      { key: 'weaknesses', label: 'Points faibles', type: 'textarea' },
      { key: 'market_analysis', label: 'Analyse du marché local', type: 'textarea' },
      { key: 'comparable_1', label: 'Bien comparable 1', type: 'text' },
      { key: 'comparable_2', label: 'Bien comparable 2', type: 'text' },
      { key: 'comparable_3', label: 'Bien comparable 3', type: 'text' },
      { key: 'estimated_low', label: 'Estimation basse (€)', type: 'number', required: true },
      { key: 'estimated_high', label: 'Estimation haute (€)', type: 'number', required: true },
      { key: 'recommended_price', label: 'Prix de mise en vente recommandé (€)', type: 'number' },
    ],
  },

  // ATTESTATIONS
  {
    id: 'attestation_hebergement',
    name: 'Attestation d\'hébergement',
    description: 'Certificat d\'hébergement à titre gratuit',
    category: 'Attestations',
    icon: Home,
    fields: [
      { key: 'host_name', label: 'Nom de l\'hébergeant', type: 'text', required: true },
      { key: 'host_birthdate', label: 'Date de naissance de l\'hébergeant', type: 'date' },
      { key: 'host_birthplace', label: 'Lieu de naissance de l\'hébergeant', type: 'text' },
      { key: 'host_address', label: 'Adresse de l\'hébergement', type: 'text', required: true },
      { key: 'guest_name', label: 'Nom de l\'hébergé', type: 'text', required: true },
      { key: 'guest_birthdate', label: 'Date de naissance de l\'hébergé', type: 'date' },
      { key: 'guest_birthplace', label: 'Lieu de naissance de l\'hébergé', type: 'text' },
      { key: 'start_date', label: 'Date de début d\'hébergement', type: 'date', required: true },
      { key: 'relationship', label: 'Lien avec l\'hébergé', type: 'text' },
    ],
  },
];

const categories = ['Tous', 'Mandats', 'Visites', 'Transactions', 'Location', 'Estimations', 'Attestations'];

function DocumentGenerator() {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [formData, setFormData] = useState({});
  const [generating, setGenerating] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');
  const [savedDocuments, setSavedDocuments] = useState([]);
  const [agentInfo, setAgentInfo] = useState({ name: '', company: '', phone: '', email: '' });
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showListingPicker, setShowListingPicker] = useState(false);
  const [uploadedPdf, setUploadedPdf] = useState(null);
  const [pdfFields, setPdfFields] = useState({});
  const fileInputRef = useRef(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      // Load saved documents
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setSavedDocuments(JSON.parse(saved));

      // Get user and profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, company_name, phone')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setAgentInfo({
            name: profile.full_name || '',
            company: profile.company_name || 'CSX Immobilier',
            phone: profile.phone || '',
            email: user.email || '',
          });
        }

        // Load listings for auto-fill
        const { data: listingsData } = await supabase
          .from('listings')
          .select('id, title, location, price, property_type, surface, rooms, bedrooms, description, features')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);
        
        if (listingsData) {
          setListings(listingsData);
        }
      }
    };
    loadData();
  }, []);

  const filteredTemplates = selectedCategory === 'Tous'
    ? documentTemplates
    : documentTemplates.filter(t => t.category === selectedCategory);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setSelectedListing(null);
    
    // Initialize with defaults
    const initialData = {};
    template.fields.forEach(field => {
      if (field.default !== undefined) {
        initialData[field.key] = field.default;
      }
      if (field.type === 'date' && !initialData[field.key]) {
        initialData[field.key] = new Date().toISOString().split('T')[0];
      }
      if (field.key === 'agent_name') {
        initialData.agent_name = agentInfo.name;
      }
    });
    setFormData(initialData);
  };

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Auto-fill from selected listing
  const autoFillFromListing = (listing) => {
    setSelectedListing(listing);
    setShowListingPicker(false);
    
    const newData = { ...formData };
    selectedTemplate.fields.forEach(field => {
      if (field.autoFill && listing[field.autoFill]) {
        newData[field.key] = listing[field.autoFill];
      }
    });
    setFormData(newData);
  };

  const formatCurrency = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Generate PDF
  const generatePDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    const addText = (text, x, yPos, options = {}) => {
      const { fontSize = 12, fontStyle = 'normal', color = [0, 0, 0], align = 'left' } = options;
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', fontStyle);
      doc.setTextColor(...color);
      
      if (align === 'center') {
        doc.text(text, pageWidth / 2, yPos, { align: 'center' });
      } else if (align === 'right') {
        doc.text(text, pageWidth - margin, yPos, { align: 'right' });
      } else {
        doc.text(text, x, yPos);
      }
    };

    const addLine = (yPos) => {
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(0.5);
      doc.line(margin, yPos, pageWidth - margin, yPos);
    };

    // Header
    addText(agentInfo.company || 'CSX Immobilier', margin, y, { fontSize: 20, fontStyle: 'bold', color: [180, 150, 50] });
    y += 8;
    if (agentInfo.phone || agentInfo.email) {
      addText(`${agentInfo.phone || ''} • ${agentInfo.email || ''}`, margin, y, { fontSize: 9, color: [100, 100, 100] });
      y += 10;
    }
    addLine(y);
    y += 15;

    // Title
    addText(selectedTemplate.name.toUpperCase(), 0, y, { fontSize: 16, fontStyle: 'bold', align: 'center' });
    y += 15;
    addText(`Fait le ${formatDate(new Date().toISOString())}`, 0, y, { fontSize: 10, color: [100, 100, 100], align: 'center' });
    y += 20;

    // Fields
    selectedTemplate.fields.forEach(field => {
      const value = formData[field.key];
      if (!value) return;

      if (y > 260) {
        doc.addPage();
        y = 20;
      }

      const displayValue = field.type === 'number' && 
        (field.label.includes('€') || field.label.includes('Prix') || field.label.includes('Loyer') || field.label.includes('Budget') || field.label.includes('Estimation'))
        ? formatCurrency(value)
        : field.type === 'date' ? formatDate(value) : String(value);

      if (field.type === 'textarea') {
        addText(field.label + ' :', margin, y, { fontSize: 11, fontStyle: 'bold', color: [50, 50, 50] });
        y += 7;
        const lines = doc.splitTextToSize(displayValue, pageWidth - 2 * margin);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        lines.forEach(line => {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(line, margin, y);
          y += 6;
        });
        y += 5;
      } else {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(50, 50, 50);
        doc.text(`${field.label}: `, margin, y);
        const labelWidth = doc.getTextWidth(`${field.label}: `);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text(displayValue, margin + labelWidth, y);
        y += 8;
      }
    });

    // Signatures
    y += 20;
    if (y > 240) { doc.addPage(); y = 30; }
    addLine(y);
    y += 15;

    const boxWidth = (pageWidth - 3 * margin) / 2;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Le mandant / client', margin, y);
    doc.text('L\'agent immobilier', margin + boxWidth + margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Signature précédée de "Lu et approuvé"', margin, y);
    doc.text('Signature et cachet', margin + boxWidth + margin, y);
    y += 25;
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, y - 20, boxWidth, 30);
    doc.rect(margin + boxWidth + margin, y - 20, boxWidth, 30);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} - ${agentInfo.company}`, pageWidth / 2, 285, { align: 'center' });

    return doc;
  };

  // Generate DOCX
  const generateDOCX = async () => {
    const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType } = await import('docx');
    
    const children = [];

    // Header
    children.push(
      new Paragraph({
        children: [new TextRun({ text: agentInfo.company || 'CSX Immobilier', bold: true, size: 36, color: 'B49632' })],
      }),
      new Paragraph({
        children: [new TextRun({ text: `${agentInfo.phone || ''} • ${agentInfo.email || ''}`, size: 18, color: '666666' })],
      }),
      new Paragraph({ text: '' }),
    );

    // Title
    children.push(
      new Paragraph({
        children: [new TextRun({ text: selectedTemplate.name.toUpperCase(), bold: true, size: 28 })],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        children: [new TextRun({ text: `Fait le ${formatDate(new Date().toISOString())}`, size: 20, color: '666666' })],
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),
    );

    // Fields
    selectedTemplate.fields.forEach(field => {
      const value = formData[field.key];
      if (!value) return;

      const displayValue = field.type === 'number' && 
        (field.label.includes('€') || field.label.includes('Prix') || field.label.includes('Loyer'))
        ? formatCurrency(value)
        : field.type === 'date' ? formatDate(value) : String(value);

      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${field.label}: `, bold: true }),
            new TextRun({ text: displayValue }),
          ],
        }),
      );
    });

    // Signatures
    children.push(
      new Paragraph({ text: '' }),
      new Paragraph({ text: '' }),
      new Table({
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ text: 'Le mandant / client', alignment: AlignmentType.CENTER })],
                width: { size: 50, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [new Paragraph({ text: "L'agent immobilier", alignment: AlignmentType.CENTER })],
                width: { size: 50, type: WidthType.PERCENTAGE },
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: '\n\n\n\nSignature' })] }),
              new TableCell({ children: [new Paragraph({ text: '\n\n\n\nSignature et cachet' })] }),
            ],
          }),
        ],
        width: { size: 100, type: WidthType.PERCENTAGE },
      }),
    );

    const doc = new Document({
      sections: [{ properties: {}, children }],
    });

    return doc;
  };

  // Handle export
  const handleExport = async () => {
    setGenerating(true);
    
    try {
      const clientName = formData.client_name || formData.vendor_name || formData.buyer_name || formData.owner_name || formData.tenant_name || 'document';
      const fileName = `${selectedTemplate.id}_${clientName.replace(/\s+/g, '_')}_${Date.now()}`;

      if (exportFormat === 'pdf') {
        const doc = await generatePDF();
        doc.save(`${fileName}.pdf`);
      } else {
        const { Packer } = await import('docx');
        const doc = await generateDOCX();
        const blob = await Packer.toBlob(doc);
        const { saveAs } = await import('file-saver');
        saveAs(blob, `${fileName}.docx`);
      }

      // Save to recent
      const newDoc = {
        id: Date.now(),
        template: selectedTemplate.name,
        templateId: selectedTemplate.id,
        data: formData,
        date: new Date().toISOString(),
        client: clientName,
        format: exportFormat,
      };
      const updatedDocs = [newDoc, ...savedDocuments].slice(0, 30);
      setSavedDocuments(updatedDocs);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDocs));

    } catch (err) {
      console.error('Export error:', err);
      alert('Erreur lors de l\'export');
    } finally {
      setGenerating(false);
    }
  };

  // Handle PDF upload for editing
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const form = pdfDoc.getForm();
      
      // Get form fields
      const fields = form.getFields();
      const fieldData = {};
      
      fields.forEach(field => {
        const name = field.getName();
        try {
          if (field.constructor.name === 'PDFTextField') {
            fieldData[name] = { type: 'text', value: field.getText() || '' };
          } else if (field.constructor.name === 'PDFCheckBox') {
            fieldData[name] = { type: 'checkbox', value: field.isChecked() };
          } else if (field.constructor.name === 'PDFDropdown') {
            fieldData[name] = { type: 'dropdown', value: field.getSelected(), options: field.getOptions() };
          }
        } catch (e) {
          console.log('Field read error:', name);
        }
      });

      setUploadedPdf({ file, doc: pdfDoc, fileName: file.name });
      setPdfFields(fieldData);
      setSelectedTemplate(null);
      
    } catch (err) {
      console.error('PDF parse error:', err);
      alert('Erreur: Ce PDF ne contient pas de formulaire éditable ou est protégé.');
    }
    
    e.target.value = '';
  };

  // Save edited PDF
  const saveEditedPdf = async () => {
    if (!uploadedPdf) return;
    
    setGenerating(true);
    try {
      const { PDFDocument } = await import('pdf-lib');
      const form = uploadedPdf.doc.getForm();
      
      // Update field values
      Object.entries(pdfFields).forEach(([name, field]) => {
        try {
          const pdfField = form.getField(name);
          if (field.type === 'text') {
            pdfField.setText(field.value || '');
          } else if (field.type === 'checkbox') {
            if (field.value) pdfField.check();
            else pdfField.uncheck();
          } else if (field.type === 'dropdown') {
            pdfField.select(field.value);
          }
        } catch (e) {
          console.log('Field update error:', name);
        }
      });

      // Flatten to make fields permanent (optional)
      // form.flatten();

      const pdfBytes = await uploadedPdf.doc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const { saveAs } = await import('file-saver');
      saveAs(blob, `edited_${uploadedPdf.fileName}`);
      
    } catch (err) {
      console.error('PDF save error:', err);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setGenerating(false);
    }
  };

  const loadDocument = (doc) => {
    const template = documentTemplates.find(t => t.id === doc.templateId);
    if (template) {
      setSelectedTemplate(template);
      setFormData(doc.data);
      setUploadedPdf(null);
    }
  };

  const deleteDocument = (id) => {
    if (confirm('Supprimer ce document ?')) {
      const updated = savedDocuments.filter(d => d.id !== id);
      setSavedDocuments(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  // Check if template has auto-fill fields
  const hasAutoFillFields = selectedTemplate?.fields.some(f => f.autoFill);

  return (
    <div style={{ maxWidth: '1400px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
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
              <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Générateur de documents</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                {documentTemplates.length} modèles • Export PDF & Word • Upload PDF
              </p>
            </div>
          </div>

          {/* Upload PDF Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handlePdfUpload}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              color: 'var(--text-secondary)',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            <Upload size={18} />
            Importer un PDF
          </button>
        </div>
      </div>

      {/* PDF Editor Mode */}
      {uploadedPdf && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '24px',
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <File size={24} style={{ color: '#ef4444' }} />
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Édition PDF: {uploadedPdf.fileName}</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {Object.keys(pdfFields).length} champs de formulaire détectés
                </p>
              </div>
            </div>
            <button
              onClick={() => { setUploadedPdf(null); setPdfFields({}); }}
              style={{
                padding: '8px',
                background: 'var(--bg-tertiary)',
                border: 'none',
                borderRadius: '6px',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ padding: '24px' }}>
            {Object.keys(pdfFields).length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>
                Ce PDF ne contient pas de champs de formulaire éditables.
              </p>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
              }}>
                {Object.entries(pdfFields).map(([name, field]) => (
                  <div key={name}>
                    <label style={{
                      display: 'block',
                      fontSize: '13px',
                      fontWeight: '500',
                      marginBottom: '6px',
                      color: 'var(--text-secondary)',
                    }}>
                      {name}
                    </label>
                    {field.type === 'checkbox' ? (
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => setPdfFields(prev => ({
                            ...prev,
                            [name]: { ...field, value: e.target.checked }
                          }))}
                        />
                        <span style={{ fontSize: '14px' }}>Coché</span>
                      </label>
                    ) : field.type === 'dropdown' ? (
                      <select
                        value={field.value || ''}
                        onChange={(e) => setPdfFields(prev => ({
                          ...prev,
                          [name]: { ...field, value: e.target.value }
                        }))}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          fontSize: '14px',
                        }}
                      >
                        {field.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={field.value || ''}
                        onChange={(e) => setPdfFields(prev => ({
                          ...prev,
                          [name]: { ...field, value: e.target.value }
                        }))}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
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
            )}
          </div>

          {Object.keys(pdfFields).length > 0 && (
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={saveEditedPdf}
                disabled={generating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: generating ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: generating ? 'var(--text-muted)' : 'var(--bg-primary)',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: generating ? 'not-allowed' : 'pointer',
                }}
              >
                {generating ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={18} />}
                {generating ? 'Sauvegarde...' : 'Télécharger PDF modifié'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main content */}
      {!uploadedPdf && (
        <div style={{ display: 'grid', gridTemplateColumns: selectedTemplate ? '320px 1fr' : '1fr', gap: '24px' }}>
          {/* Templates Panel */}
          <div>
            {/* Category Filter */}
            {!selectedTemplate && (
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                flexWrap: 'wrap',
              }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '8px 14px',
                      background: selectedCategory === cat ? 'var(--gold)' : 'var(--bg-card)',
                      border: `1px solid ${selectedCategory === cat ? 'var(--gold)' : 'var(--border-color)'}`,
                      borderRadius: '8px',
                      color: selectedCategory === cat ? 'var(--bg-primary)' : 'var(--text-secondary)',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {/* Templates Grid */}
            {!selectedTemplate && (
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
                      onClick={() => handleSelectTemplate(template)}
                      style={{
                        padding: '20px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          background: 'rgba(212, 175, 55, 0.1)',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <Icon size={20} style={{ color: 'var(--gold)' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                            {template.name}
                          </h3>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                            {template.description}
                          </p>
                          <span style={{
                            display: 'inline-block',
                            marginTop: '8px',
                            padding: '3px 8px',
                            background: 'var(--bg-tertiary)',
                            borderRadius: '4px',
                            fontSize: '10px',
                            color: 'var(--text-muted)',
                          }}>
                            {template.fields.length} champs
                          </span>
                        </div>
                        <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Mini templates list when one is selected */}
            {selectedTemplate && (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                overflow: 'hidden',
              }}>
                <div style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>Modèles</span>
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    style={{
                      padding: '4px 8px',
                      background: 'var(--bg-tertiary)',
                      border: 'none',
                      borderRadius: '4px',
                      color: 'var(--text-muted)',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    Voir tous
                  </button>
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {documentTemplates.map(template => (
                    <div
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      style={{
                        padding: '10px 16px',
                        borderBottom: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        background: selectedTemplate.id === template.id ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <template.icon size={14} style={{ color: selectedTemplate.id === template.id ? 'var(--gold)' : 'var(--text-muted)' }} />
                      <span style={{
                        fontSize: '12px',
                        color: selectedTemplate.id === template.id ? 'var(--gold)' : 'var(--text-secondary)',
                        fontWeight: selectedTemplate.id === template.id ? '500' : '400',
                      }}>
                        {template.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Form Panel */}
          {selectedTemplate && (
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              overflow: 'hidden',
            }}>
              {/* Form Header */}
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <selectedTemplate.icon size={24} style={{ color: 'var(--gold)' }} />
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: '600' }}>{selectedTemplate.name}</h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedTemplate.category}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  style={{
                    padding: '8px',
                    background: 'var(--bg-tertiary)',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Auto-fill from listing */}
              {hasAutoFillFields && listings.length > 0 && (
                <div style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid var(--border-color)',
                  background: 'var(--bg-tertiary)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Building2 size={16} style={{ color: 'var(--gold)' }} />
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>Remplir depuis une annonce</span>
                    </div>
                    {selectedListing ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--gold)' }}>
                          <Check size={14} style={{ display: 'inline', marginRight: '4px' }} />
                          {selectedListing.title}
                        </span>
                        <button
                          onClick={() => setShowListingPicker(true)}
                          style={{
                            padding: '4px 8px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '4px',
                            color: 'var(--text-muted)',
                            fontSize: '11px',
                            cursor: 'pointer',
                          }}
                        >
                          Changer
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowListingPicker(true)}
                        style={{
                          padding: '6px 12px',
                          background: 'var(--gold)',
                          border: 'none',
                          borderRadius: '6px',
                          color: 'var(--bg-primary)',
                          fontSize: '12px',
                          fontWeight: '500',
                          cursor: 'pointer',
                        }}
                      >
                        Sélectionner un bien
                      </button>
                    )}
                  </div>

                  {/* Listing picker dropdown */}
                  {showListingPicker && (
                    <div style={{
                      marginTop: '12px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                    }}>
                      {listings.map(listing => (
                        <div
                          key={listing.id}
                          onClick={() => autoFillFromListing(listing)}
                          style={{
                            padding: '10px 14px',
                            borderBottom: '1px solid var(--border-color)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: '500' }}>{listing.title}</p>
                            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {listing.location} • {listing.surface}m² • {formatCurrency(listing.price)}
                            </p>
                          </div>
                          <ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Form Fields */}
              <div style={{ padding: '24px', maxHeight: '450px', overflowY: 'auto' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                }}>
                  {selectedTemplate.fields.map(field => (
                    <div
                      key={field.key}
                      style={{
                        gridColumn: field.type === 'textarea' ? '1 / -1' : 'auto',
                      }}
                    >
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '500',
                        marginBottom: '6px',
                        color: 'var(--text-secondary)',
                      }}>
                        {field.label}
                        {field.required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
                        {field.autoFill && <span style={{ color: 'var(--gold)', marginLeft: '4px', fontSize: '10px' }}>⚡</span>}
                      </label>

                      {field.type === 'select' ? (
                        <select
                          value={formData[field.key] || ''}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)',
                            fontSize: '14px',
                          }}
                        >
                          <option value="">Sélectionner...</option>
                          {field.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          value={formData[field.key] || ''}
                          onChange={(e) => handleInputChange(field.key, e.target.value)}
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)',
                            fontSize: '14px',
                            resize: 'vertical',
                          }}
                        />
                      ) : (
                        <input
                          type={field.type}
                          value={formData[field.key] || ''}
                          onChange={(e) => handleInputChange(field.key, field.type === 'number' ? parseFloat(e.target.value) || '' : e.target.value)}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
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

              {/* Actions */}
              <div style={{
                padding: '20px 24px',
                borderTop: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}>
                {/* Format selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Format:</span>
                  <button
                    onClick={() => setExportFormat('pdf')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: exportFormat === 'pdf' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-tertiary)',
                      border: `1px solid ${exportFormat === 'pdf' ? '#ef4444' : 'var(--border-color)'}`,
                      borderRadius: '6px',
                      color: exportFormat === 'pdf' ? '#ef4444' : 'var(--text-secondary)',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
                    <File size={14} /> PDF
                  </button>
                  <button
                    onClick={() => setExportFormat('docx')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      background: exportFormat === 'docx' ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-tertiary)',
                      border: `1px solid ${exportFormat === 'docx' ? '#3b82f6' : 'var(--border-color)'}`,
                      borderRadius: '6px',
                      color: exportFormat === 'docx' ? '#3b82f6' : 'var(--text-secondary)',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
                    <FileText size={14} /> Word
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setFormData({})}
                    style={{
                      padding: '12px 20px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-secondary)',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Effacer
                  </button>
                  <button
                    onClick={handleExport}
                    disabled={generating}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 24px',
                      background: generating ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: generating ? 'var(--text-muted)' : 'var(--bg-primary)',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: generating ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {generating ? (
                      <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <Download size={18} />
                    )}
                    {generating ? 'Génération...' : `Télécharger ${exportFormat.toUpperCase()}`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Documents */}
      {!uploadedPdf && !selectedTemplate && savedDocuments.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Documents récents</h3>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}>
            {savedDocuments.slice(0, 10).map((doc, idx) => (
              <div
                key={doc.id}
                style={{
                  padding: '14px 20px',
                  borderBottom: idx < Math.min(savedDocuments.length, 10) - 1 ? '1px solid var(--border-color)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {doc.format === 'docx' ? (
                    <FileText size={18} style={{ color: '#3b82f6' }} />
                  ) : (
                    <FileText size={18} style={{ color: '#ef4444' }} />
                  )}
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500' }}>{doc.template}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {doc.client} • {new Date(doc.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => loadDocument(doc)}
                    style={{
                      padding: '6px 12px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-secondary)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Edit2 size={12} /> Modifier
                  </button>
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    style={{
                      padding: '6px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#ef4444',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
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
