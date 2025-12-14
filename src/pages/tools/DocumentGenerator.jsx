import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
  FileText,
  Download,
  Edit2,
  Trash2,
  Loader2,
  Building2,
  ChevronRight,
  ChevronLeft,
  X,
  FileCheck,
  Key,
  ClipboardList,
  Check,
  File,
  Settings,
  AlertTriangle,
  Info,
  ExternalLink
} from 'lucide-react';

const STORAGE_KEY = 'csx_documents';
const AGENCY_KEY = 'csx_agency_info';

// Document templates based on official UNIS/CNACIM 2024 models
const documentTemplates = [
  {
    id: 'mandat_simple_vente',
    name: 'Mandat simple de vente',
    description: 'Mandat non exclusif conforme UNIS - MAJ décembre 2024',
    category: 'Mandats',
    icon: FileCheck,
    pages: 7,
    source: 'UNIS/CNACIM',
  },
  {
    id: 'mandat_exclusif_vente',
    name: 'Mandat exclusif de vente',
    description: 'Mandat exclusif avec clause pénale - MAJ décembre 2024',
    category: 'Mandats',
    icon: FileCheck,
    pages: 7,
    source: 'UNIS/CNACIM',
  },
  {
    id: 'mandat_simple_vente_distance',
    name: 'Mandat simple - À distance',
    description: 'Mandat conclu à distance ou hors établissement (14j rétractation)',
    category: 'Mandats',
    icon: FileCheck,
    pages: 8,
    source: 'UNIS/CNACIM',
  },
  {
    id: 'mandat_exclusif_vente_distance',
    name: 'Mandat exclusif - À distance',
    description: 'Mandat exclusif conclu à distance (14j rétractation)',
    category: 'Mandats',
    icon: FileCheck,
    pages: 8,
    source: 'UNIS/CNACIM',
  },
  {
    id: 'bon_visite',
    name: 'Bon de visite',
    description: 'Attestation de visite avec engagement',
    category: 'Visites',
    icon: ClipboardList,
    pages: 1,
    source: 'Modèle standard',
  },
  {
    id: 'offre_achat',
    name: 'Offre d\'achat',
    description: 'Proposition d\'acquisition (Art. 1583 Code civil)',
    category: 'Transactions',
    icon: FileText,
    pages: 2,
    source: 'Modèle standard',
  },
];

const categories = ['Tous', 'Mandats', 'Visites', 'Transactions'];

function DocumentGenerator() {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [generating, setGenerating] = useState(false);
  const [savedDocuments, setSavedDocuments] = useState([]);
  const [showAgencySettings, setShowAgencySettings] = useState(false);
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  
  const [agencyInfo, setAgencyInfo] = useState({
    nom: '',
    forme_juridique: 'SARL',
    capital: '',
    siege: '',
    rcs: '',
    tva: '',
    telephone: '',
    email: '',
    carte_pro: '',
    carte_delivree_par: '',
    garantie_nom: '',
    garantie_montant: '',
    garantie_adresse: '',
    assurance_nom: '',
    assurance_adresse: '',
    compte_sequestre: '',
    banque_sequestre: '',
    mediateur_nom: '',
    mediateur_adresse: '',
    mediateur_email: '',
    site_web: '',
  });

  useEffect(() => {
    const savedDocs = localStorage.getItem(STORAGE_KEY);
    if (savedDocs) setSavedDocuments(JSON.parse(savedDocs));
    
    const savedAgency = localStorage.getItem(AGENCY_KEY);
    if (savedAgency) setAgencyInfo(JSON.parse(savedAgency));
    
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile && !savedAgency) {
          setAgencyInfo(prev => ({ ...prev, nom: profile.company_name || '', telephone: profile.phone || '', email: user.email }));
        }
        const { data: listingsData } = await supabase.from('listings').select('*').eq('user_id', user.id).limit(50);
        if (listingsData) setListings(listingsData);
      }
    };
    loadData();
  }, []);

  const saveAgencyInfo = () => {
    localStorage.setItem(AGENCY_KEY, JSON.stringify(agencyInfo));
    setShowAgencySettings(false);
  };

  const filteredTemplates = selectedCategory === 'Tous' ? documentTemplates : documentTemplates.filter(t => t.category === selectedCategory);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setStep(1);
    const now = new Date();
    setFormData({
      mandat_numero: `M${now.getFullYear()}-${String(savedDocuments.filter(d => d.templateId?.includes('mandat')).length + 1).padStart(4, '0')}`,
      mandat_date: now.toISOString().split('T')[0],
      mandat_duree: 3,
      mandat_tacite: 'non',
      honoraires_charge: 'acquereur',
      honoraires_pourcentage: 5,
      bien_libre: 'oui',
      diagnostics_charge: 'mandant',
      sequestre: 'notaire',
    });
  };

  const handleInputChange = (key, value) => {
    setFormData(prev => {
      const updated = { ...prev, [key]: value };
      if (key === 'prix_vente' && prev.honoraires_pourcentage) {
        updated.honoraires_montant = Math.round(value * prev.honoraires_pourcentage / 100);
      }
      if (key === 'honoraires_pourcentage' && prev.prix_vente) {
        updated.honoraires_montant = Math.round(prev.prix_vente * value / 100);
      }
      return updated;
    });
  };

  const autoFillFromListing = (listing) => {
    setSelectedListing(listing);
    setFormData(prev => ({
      ...prev,
      bien_type: listing.property_type || '',
      bien_adresse: listing.location || '',
      bien_description: listing.description || '',
      bien_surface: listing.surface || '',
      prix_vente: listing.price || '',
    }));
  };

  const formatCurrency = (amount) => amount ? new Intl.NumberFormat('fr-FR').format(amount) + ' €' : '..........';
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '....................';

  // Generate complete legal PDF
  const generatePDF = async () => {
    setGenerating(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pw = doc.internal.pageSize.getWidth();
      const ph = doc.internal.pageSize.getHeight();
      const m = 15;
      const cw = pw - 2 * m;
      let y = m;
      let pageNum = 1;

      const isExclusif = selectedTemplate.id.includes('exclusif');
      const isDistance = selectedTemplate.id.includes('distance');
      const isMandat = selectedTemplate.id.includes('mandat');

      const footer = () => {
        doc.setFontSize(8);
        doc.setTextColor(128);
        doc.text(`UNIS – Mandat ${isExclusif ? 'exclusif' : 'simple'}${isDistance ? ' à distance' : ''} - Page ${pageNum} sur ${selectedTemplate.pages}`, m, ph - 8);
        doc.text('MAJ décembre 2024 (clause pénale)', pw - m, ph - 8, { align: 'right' });
      };

      const newPage = () => {
        footer();
        doc.addPage();
        pageNum++;
        y = m;
      };

      const checkSpace = (needed) => { if (y > ph - needed - 15) newPage(); };

      const text = (t, opts = {}) => {
        const { size = 9, bold = false, italic = false, color = [0,0,0], indent = 0, center = false, box = false } = opts;
        doc.setFontSize(size);
        doc.setFont('helvetica', bold ? 'bold' : italic ? 'italic' : 'normal');
        doc.setTextColor(...color);
        const lines = doc.splitTextToSize(t, cw - indent);
        lines.forEach(line => {
          checkSpace(5);
          if (center) doc.text(line, pw / 2, y, { align: 'center' });
          else doc.text(line, m + indent, y);
          y += size * 0.4;
        });
        y += 1;
      };

      const title = (t) => { checkSpace(12); text(t, { size: 12, bold: true, center: true }); y += 3; };
      const article = (t) => { checkSpace(10); y += 3; text(t, { size: 10, bold: true }); y += 1; };
      const field = (label, value) => { text(`${label} : ${value || '............................'}`, { size: 9 }); };
      const checkbox = (t, checked = false) => {
        checkSpace(5);
        doc.rect(m, y - 2.5, 3, 3);
        if (checked) { doc.setFontSize(10); doc.text('×', m + 0.5, y); }
        doc.setFontSize(9);
        doc.text(t, m + 5, y);
        y += 4;
      };

      // ========== MANDATS DE VENTE ==========
      if (isMandat) {
        // Page 1 - Header & Warning
        doc.setFillColor(255, 252, 240);
        doc.setDrawColor(200, 180, 100);
        doc.rect(m, y, cw, 18, 'FD');
        doc.setFontSize(8);
        doc.setTextColor(120, 100, 40);
        doc.text('ATTENTION', m + 2, y + 5);
        doc.setFontSize(7);
        doc.text('Ce document est une trame susceptible d\'être adaptée par l\'agent immobilier à chaque situation ou dossier.', m + 2, y + 9);
        doc.text('Il ne pourra être utilisé en l\'état. En conséquence, la responsabilité de l\'UNIS ne pourra être engagée du fait de son utilisation.', m + 2, y + 13);
        y += 22;

        // Title
        title(`MANDAT ${isExclusif ? 'EXCLUSIF' : 'SIMPLE'} DE VENTE`);
        if (isDistance) title('CONCLU À DISTANCE OU HORS ÉTABLISSEMENT');
        y += 2;

        // Agency header for distance contracts
        if (isDistance) {
          text(`${agencyInfo.nom || 'Société .............................'} (${agencyInfo.forme_juridique || '.........'})`, { size: 9, bold: true });
          text(`Capital : ${agencyInfo.capital || '..........'} € - RCS : ${agencyInfo.rcs || '..........'} - TVA : ${agencyInfo.tva || '..........'}`, { size: 8 });
          text(`Siège : ${agencyInfo.siege || '..........'}`, { size: 8 });
          text(`Tél : ${agencyInfo.telephone || '..........'} - Email : ${agencyInfo.email || '..........'}`, { size: 8 });
          text(`Carte professionnelle n° ${agencyInfo.carte_pro || '..........'} délivrée par la CCI ${agencyInfo.carte_delivree_par || '..........'}`, { size: 8 });
          text(`Garantie financière : ${agencyInfo.garantie_nom || '..........'} - ${formatCurrency(agencyInfo.garantie_montant)}`, { size: 8 });
          text(`Assurance RCP : ${agencyInfo.assurance_nom || '..........'}`, { size: 8 });
          y += 3;
        }

        // Legal basis
        text('"Le titulaire de la carte Transactions sur immeubles et fonds de commerce ne peut négocier ou s\'engager à l\'occasion d\'opérations d\'achat, vente, échange, location ou sous-location, de biens et droits immobiliers ou de fonds de commerce, sans détenir un mandat écrit préalablement délivré à cet effet par l\'une des parties..."', { size: 8, italic: true, color: [80,80,80] });
        text('(Loi n°70-9 du 2 janvier 1970 – article 6 - décret n°72-678 du 20 juillet 1972 – article 72)', { size: 7, italic: true, color: [100,100,100] });
        y += 5;

        // Mandate number
        text(`N° de mandat : ${formData.mandat_numero || '____________'}`, { size: 11, bold: true });
        y += 5;

        // PARTIES
        text('ENTRE LES SOUSSIGNÉS', { size: 10, bold: true });
        y += 2;

        // Mandant
        text(`${formData.mandant_civilite || 'M./Mme'} ${formData.mandant_nom || '............................'}`, { size: 9 });
        if (formData.mandant_naissance) {
          text(`Né(e) le ${formatDate(formData.mandant_naissance)} à ${formData.mandant_lieu_naissance || '............'}, nationalité ${formData.mandant_nationalite || 'française'}`, { size: 8 });
        }
        text(`Régime matrimonial : ${formData.mandant_regime || '............................'}`, { size: 8 });
        text(`Demeurant : ${formData.mandant_adresse || '............................'}`, { size: 8 });
        text(`Tél : ${formData.mandant_telephone || '..........'} - Email : ${formData.mandant_email || '..........'}`, { size: 8 });
        y += 2;
        text('Ci-après dénommé « Le Mandant » d\'une part,', { size: 9, italic: true });
        y += 4;

        // Mandataire
        text('ET', { size: 10, bold: true, center: true });
        y += 2;
        if (!isDistance) {
          text(`Le Cabinet/l'agence ${agencyInfo.nom || '.............................'} (${agencyInfo.forme_juridique || '.........'})`, { size: 9 });
          text(`Capital : ${agencyInfo.capital || '..........'} € - Siège : ${agencyInfo.siege || '..........'}`, { size: 8 });
          text(`RCS : ${agencyInfo.rcs || '..........'} - Carte pro n° ${agencyInfo.carte_pro || '..........'} (CCI ${agencyInfo.carte_delivree_par || '..........'})`, { size: 8 });
          text(`Garantie : ${agencyInfo.garantie_nom || '..........'} pour ${formatCurrency(agencyInfo.garantie_montant)}`, { size: 8 });
          text(`Compte séquestre n° ${agencyInfo.compte_sequestre || '..........'} - ${agencyInfo.banque_sequestre || '..........'}`, { size: 8 });
        } else {
          text('Le Cabinet/l\'agence dont les informations sont détaillées en en-tête du présent contrat,', { size: 9 });
        }
        text('Ci-après dénommé « Le Mandataire » d\'autre part.', { size: 9, italic: true });
        y += 5;

        // IL A ETE CONVENU
        text('IL A ÉTÉ CONVENU CE QUI SUIT', { size: 10, bold: true });
        y += 2;
        const mandatType = isExclusif 
          ? 'Le Mandant donne au Mandataire, ci-dessus dénommé, MANDAT EXCLUSIF à l\'effet de rechercher un acquéreur et de négocier au mieux de ses intérêts avec la collaboration éventuelle de ses confrères, en vue d\'aboutir à la signature d\'une promesse de vente ou d\'un compromis de vente portant sur les biens suivants :'
          : 'Le Mandant donne au Mandataire, mandat sans exclusivité à l\'effet de rechercher un acquéreur et de négocier au mieux de ses intérêts avec la collaboration éventuelle de ses confrères, en vue d\'aboutir à la signature d\'une promesse de vente ou d\'un compromis de vente portant sur les biens suivants :';
        text(mandatType, { size: 9 });
        y += 3;

        // Article 1 - Désignation
        article('Art. 1er. Désignation');
        text('(En cas de lot de copropriété, mentionner la superficie de la partie privative du lot)', { size: 8, italic: true, color: [100,100,100] });
        y += 2;
        text(`Type de bien : ${formData.bien_type || '............................'}`, { size: 9 });
        text(`Adresse : ${formData.bien_adresse || '............................'}`, { size: 9 });
        if (formData.bien_surface) text(`Surface Carrez : ${formData.bien_surface} m²`, { size: 9 });
        if (formData.bien_description) {
          text('Description :', { size: 9 });
          text(formData.bien_description, { size: 8, indent: 5 });
        }
        y += 3;
        text('Étant précisé qu\'à la signature de l\'acte authentique, les biens vendus seront :', { size: 9 });
        checkbox('libres de toute occupation, location ou réquisition', formData.bien_libre === 'oui');
        checkbox('loués', formData.bien_libre === 'non');
        y += 3;

        // Diagnostics
        text('Dossier de diagnostics techniques', { size: 9, bold: true });
        checkbox('Le Mandant se charge de faire réaliser à ses frais et sous sa responsabilité l\'ensemble des constats, états, diagnostics, mesurage requis par la loi et s\'engage à les communiquer au Mandataire sans délai.', formData.diagnostics_charge === 'mandant');
        checkbox('Le Mandant charge le Mandataire de faire effectuer l\'ensemble des constats, états, diagnostics et mesurage requis par la loi. Les frais d\'établissement sont à la charge exclusive du Mandant.', formData.diagnostics_charge === 'mandataire');
        
        // Article 2 - Durée
        newPage();
        article('Art. 2. Durée – Révocation');
        text('A – Durée', { size: 9, bold: true });
        checkbox(`Le présent mandat est conclu pour une durée de ${formData.mandat_duree || '__'} mois à compter du ${formatDate(formData.mandat_date)}.`, formData.mandat_tacite === 'non');
        checkbox(`Le présent mandat est conclu pour une durée de ${formData.mandat_duree || '__'} mois à compter du ${formatDate(formData.mandat_date)}. Il se renouvellera par tacite reconduction par période de ${formData.mandat_duree || '__'} mois.`, formData.mandat_tacite === 'oui');
        y += 3;

        if (formData.mandat_tacite === 'oui') {
          doc.setFillColor(245, 245, 245);
          doc.rect(m, y, cw, 35, 'F');
          doc.setFontSize(7);
          doc.setTextColor(60, 60, 60);
          const taciteText = 'POUR LES CONTRATS DE PRESTATIONS DE SERVICES CONCLUS POUR UNE DURÉE DÉTERMINÉE AVEC UNE CLAUSE DE RECONDUCTION TACITE, LE PROFESSIONNEL PRESTATAIRE DE SERVICES INFORME LE CONSOMMATEUR PAR ÉCRIT, PAR LETTRE NOMINATIVE OU COURRIER ÉLECTRONIQUE DÉDIÉS, AU PLUS TÔT TROIS MOIS ET AU PLUS TARD UN MOIS AVANT LE TERME DE LA PÉRIODE AUTORISANT LE REJET DE LA RECONDUCTION, DE LA POSSIBILITÉ DE NE PAS RECONDUIRE LE CONTRAT QU\'IL A CONCLU AVEC UNE CLAUSE DE RECONDUCTION TACITE. (article L215-1 du code de la consommation)';
          const taciteLines = doc.splitTextToSize(taciteText, cw - 4);
          taciteLines.forEach((line, i) => {
            doc.text(line, m + 2, y + 4 + i * 3);
          });
          y += 38;
        }

        text('B – Révocation', { size: 9, bold: true });
        if (isExclusif) {
          doc.setFillColor(255, 250, 240);
          doc.rect(m, y, cw, 15, 'F');
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(100, 60, 0);
          doc.text('PASSÉ UN DÉLAI DE TROIS MOIS À COMPTER DE SA SIGNATURE, LE MANDAT PEUT ÊTRE DÉNONCÉ', m + 2, y + 5);
          doc.text('À TOUT MOMENT PAR CHACUNE DES PARTIES, À CHARGE POUR CELLE QUI ENTEND Y METTRE FIN', m + 2, y + 9);
          doc.text('D\'EN AVISER L\'AUTRE PARTIE QUINZE JOURS À L\'AVANCE PAR LETTRE RECOMMANDÉE AVEC AR.', m + 2, y + 13);
          y += 18;
        } else {
          text('Passé un délai de trois mois à compter de sa signature, le mandat peut être dénoncé à tout moment par chacune des parties, à charge pour celle qui entend y mettre fin d\'en aviser l\'autre partie quinze jours à l\'avance par lettre recommandée avec demande d\'avis de réception.', { size: 8 });
        }

        // Article 3 - Obligations du Mandant
        article('Art. 3. Obligations du Mandant');
        text('Pour permettre au Mandataire d\'exécuter sa mission, le Mandant lui donne pouvoir pour effectuer toutes démarches auprès des tiers afin d\'obtenir les pièces, actes, certificats concernant le bien objet des présentes et s\'engage à :', { size: 8 });
        y += 2;
        const obligations = [
          'Reconnaît avoir reçu du Mandataire le document d\'informations précontractuelles préalablement à la conclusion du présent mandat.',
          'S\'engage à répondre à toute demande du Mandataire pour l\'accomplissement de son obligation de vigilance dans le cadre du dispositif de lutte contre le blanchiment de capitaux.',
          'Autorise la délégation du présent mandat sans que les pouvoirs et obligations délégués excèdent ceux prévus au présent mandat.',
          'Autorise le Mandataire à signer tout mandat de recherche avec un acquéreur éventuel conformément aux dispositions de l\'article 1161 du code civil.',
          'S\'engage à lui fournir le DPE, lorsque la loi l\'exige, afin de permettre au Mandataire la diffusion d\'annonces relatives à la vente du bien.',
          'En copropriété : fournir le règlement de copropriété, les trois derniers appels de charges, les trois derniers procès-verbaux d\'assemblée générale.',
          'S\'engage à lui fournir toutes justifications relatives à la propriété des biens mis en vente.',
          'S\'engage à lui signaler immédiatement toutes modifications juridiques ou matérielles touchant les biens.',
          'Laisser effectuer la publicité et autoriser les photographies du bien.',
          'Communiquer les éléments prévus aux articles L721-2 et L271-4 du CCH.',
          'S\'engage à signer aux conditions prévues tout compromis ou promesse de vente.',
        ];
        obligations.forEach((ob, i) => {
          text(`${i + 1}. ${ob}`, { size: 7, indent: 3 });
        });

        if (isExclusif) {
          text('12. Compte tenu de l\'exclusivité consentie, s\'engage à ne pas négocier directement ou indirectement la vente du bien pendant la durée du mandat.', { size: 7, indent: 3, bold: true });
        } else {
          text('12. S\'engage à informer sans délai le mandataire que la vente a été conclue directement ou par un autre intermédiaire.', { size: 7, indent: 3 });
        }
        text('13. S\'engage à ne pas conclure l\'acquisition, pendant la durée du présent mandat et les douze mois suivants, directement avec un acquéreur présenté par le Mandataire.', { size: 7, indent: 3, bold: true });
        y += 3;

        // CLAUSE PENALE
        doc.setFillColor(255, 245, 245);
        doc.setDrawColor(200, 100, 100);
        checkSpace(30);
        doc.rect(m, y, cw, 25, 'FD');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(150, 50, 50);
        doc.text('CLAUSE PÉNALE', m + 2, y + 5);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 40, 40);
        const penaleText = 'En cas de non-respect des obligations énoncées ci-dessus le Mandant s\'engage expressément à verser au Mandataire, en vertu des articles 1217 et 1221 et 1231-5 du code civil, une indemnité compensatrice égale au montant de la rémunération prévue aux présentes, si le manquement se trouve à l\'origine de la perte de rémunération par le Mandataire. Le Mandant sera tenu au paiement notamment en cas de manquement aux obligations 11, 12 et 13.';
        const penaleLines = doc.splitTextToSize(penaleText, cw - 4);
        penaleLines.forEach((line, i) => doc.text(line, m + 2, y + 10 + i * 3));
        y += 28;

        // Article 4 - Obligations Mandataire
        newPage();
        article('Art. 4. Obligations du Mandataire');
        text('Le Mandataire s\'engage à :', { size: 8 });
        const oblMandataire = [
          'Conseiller et assister le mandant durant toute la durée du mandat.',
          'Effectuer toutes les démarches nécessaires à l\'accomplissement de sa mission.',
          'Réaliser les actions suivantes : visites, négociation, réception et communication des offres.',
          `Promouvoir le bien en diffusant les annonces auprès du public : ${formData.diffusion || 'internet, vitrine, réseaux partenaires'}.`,
          'Informer le mandant de l\'accomplissement de son mandat dans les conditions de l\'article 77 du décret du 20 juillet 1972.',
        ];
        oblMandataire.forEach((ob, i) => text(`${i + 1}. ${ob}`, { size: 7, indent: 3 }));
        if (isExclusif && formData.actions_exclusives) {
          text(`Actions spécifiques dans le cadre de l'exclusivité : ${formData.actions_exclusives}`, { size: 8, indent: 3 });
        }

        // Article 5 - Séquestre
        article('Art. 5. Séquestre');
        text('La somme versée par l\'acquéreur à titre de dépôt de garantie (10% max) sera détenue par :', { size: 8 });
        checkbox('Le Mandataire (dès lors qu\'il détient une garantie financière)', formData.sequestre === 'mandataire');
        checkbox(`Le notaire désigné : ${formData.notaire || '............................'}`, formData.sequestre === 'notaire');

        // Article 6 - Déclaration aliéner
        article('Art. 6. Déclaration d\'aliéner');
        text('Le Mandant charge spécialement le Mandataire d\'accomplir, le cas échéant, les formalités relatives à la déclaration d\'aliéner comme de négocier avec tout titulaire d\'un droit de préemption.', { size: 8 });

        // Article 7 - Prix
        article('Art. 7. Prix');
        text(`Les biens ci-dessus désignés seront présentés au prix de ${formatCurrency(formData.prix_vente)} TTC.`, { size: 9, bold: true });
        text('Dans le cas où les biens seraient soumis à la TVA, celle-ci sera à la charge du vendeur. Les frais d\'actes, droits d\'enregistrement sont à la charge de l\'acheteur.', { size: 8 });

        // Article 8 - Rémunération
        article('Art. 8. Rémunération');
        text(`En cas de réalisation de la vente, le Mandataire percevra une rémunération de ${formatCurrency(formData.honoraires_montant)} TTC (soit ${formData.honoraires_pourcentage || '__'}% du prix de vente).`, { size: 9 });
        y += 2;
        if (formData.honoraires_charge === 'vendeur') {
          text('La rémunération sera à la charge du Mandant.', { size: 9 });
        } else if (formData.honoraires_charge === 'acquereur') {
          text('La rémunération sera à la charge de l\'Acquéreur.', { size: 9 });
        } else {
          text('La rémunération sera partagée entre le Mandant et l\'Acquéreur.', { size: 9 });
        }
        text('Elle sera versée au Mandataire une fois l\'acte authentique de vente effectivement signé devant notaire après que toutes les conditions suspensives aient été levées.', { size: 8 });
        y += 3;
        text('Rappel des tarifs appliqués par le mandataire au jour de la conclusion du mandat :', { size: 8, italic: true });
        text(agencyInfo.tarifs || '............................', { size: 8, indent: 3 });

        // Article 9 - Litiges
        newPage();
        article('Art. 9. Règlement des litiges');
        text('Le contrat est régi par la loi française. Tout différend sera porté devant le tribunal compétent.', { size: 8 });
        text('En application de l\'ordonnance n°2015-1033 du 20 août 2015, le mandant peut saisir le médiateur de la consommation :', { size: 8 });
        text(`${agencyInfo.mediateur_nom || '............................'}`, { size: 8, indent: 3 });
        text(`${agencyInfo.mediateur_adresse || '............................'}`, { size: 8, indent: 3 });

        // Rétractation (distance only)
        if (isDistance) {
          article('Art. 10. Droit de rétractation');
          doc.setFillColor(240, 248, 255);
          doc.rect(m, y, cw, 30, 'F');
          doc.setFontSize(8);
          doc.setTextColor(0, 60, 120);
          doc.text('Le Mandant a le droit de se rétracter du présent contrat sans donner de motif dans un délai de QUATORZE JOURS.', m + 2, y + 5);
          doc.text('Le délai de rétractation expire quatorze jours après le jour de la conclusion du contrat.', m + 2, y + 10);
          doc.text('Pour exercer ce droit, le Mandant doit notifier au Mandataire sa décision par déclaration dénuée d\'ambiguïté', m + 2, y + 15);
          doc.text('(lettre recommandée, télécopie ou courrier électronique).', m + 2, y + 20);
          doc.text('Un formulaire de rétractation est joint en annexe du présent contrat.', m + 2, y + 25);
          y += 33;
        }

        // Article RGPD
        article(isDistance ? 'Art. 11. Traitement des données personnelles' : 'Art. 10. Traitement des données personnelles');
        text('Conformément à la loi n°78-17 du 6 janvier 1978 et au Règlement européen (UE) 2016/679 (RGPD), le Mandant est informé que le Mandataire procède au traitement de ses données personnelles. Ces données seront conservées 5 ans après la fin de la relation commerciale (10 ans pour les mandats et registres légaux).', { size: 7 });
        text('Le Mandant bénéficie d\'un droit d\'accès, de rectification et d\'effacement de ses données. Réclamation : CNIL - 3 Place de Fontenoy - 75334 PARIS CEDEX', { size: 7 });

        // Article Bloctel
        article(isDistance ? 'Art. 12. Opposition au démarchage' : 'Art. 11. Opposition au démarchage');
        text('Le Mandant est informé de l\'existence de la liste d\'opposition au démarchage téléphonique « Bloctel » : https://conso.bloctel.fr/', { size: 8 });

        // Article Non-discrimination
        article(isDistance ? 'Art. 13. Non-discrimination' : 'Art. 12. Non-discrimination');
        text('Aucune personne ne peut se voir refuser l\'acquisition d\'un logement pour un motif discriminatoire défini à l\'article 225-1 du Code pénal. Les parties prennent l\'engagement exprès de n\'opposer aucun refus discriminatoire. Toute discrimination est punie de 3 ans d\'emprisonnement et 45 000 € d\'amende (art. 225-2 CP).', { size: 8 });

        // Consentement RGPD
        y += 5;
        checkbox('J\'accepte que mes données soient utilisées pour m\'adresser des offres commerciales.', false);
        checkbox('J\'accepte que mes données soient transmises à des partenaires commerciaux.', false);

        // Signatures
        newPage();
        y += 10;
        text(`Fait à ${formData.lieu_signature || '.............................'} le ${formatDate(formData.mandat_date)} en deux originaux.`, { size: 10 });
        text('Un exemplaire numéroté, daté et signé est remis au Mandant qui le reconnaît.', { size: 9 });
        y += 5;
        text(`Approuvés ............... mots rayés nuls, ............... lignes.`, { size: 8, italic: true });
        y += 15;

        // Signature boxes
        const bw = (cw - 20) / 2;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0);
        doc.text('Le Mandant', m + bw / 2, y, { align: 'center' });
        doc.text('Le Mandataire', m + bw + 20 + bw / 2, y, { align: 'center' });
        y += 4;
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.text('Faire précéder la signature de', m + bw / 2, y, { align: 'center' });
        doc.text('Faire précéder la signature de', m + bw + 20 + bw / 2, y, { align: 'center' });
        y += 4;
        doc.text('"Lu et approuvé. Bon pour mandat"', m + bw / 2, y, { align: 'center' });
        doc.text('"Bon pour acceptation de mandat"', m + bw + 20 + bw / 2, y, { align: 'center' });
        y += 5;
        doc.setDrawColor(180);
        doc.rect(m, y, bw, 40);
        doc.rect(m + bw + 20, y, bw, 40);

        // Retractation form for distance
        if (isDistance) {
          newPage();
          title('FORMULAIRE DE RÉTRACTATION');
          text('(Veuillez compléter et renvoyer le présent formulaire uniquement si vous souhaitez vous rétracter du contrat)', { size: 8, italic: true });
          y += 5;
          text(`À l'attention de : ${agencyInfo.nom || '............................'}`, { size: 9 });
          text(`Adresse : ${agencyInfo.siege || '............................'}`, { size: 9 });
          text(`Email : ${agencyInfo.email || '............................'}`, { size: 9 });
          y += 5;
          text('Je vous notifie par la présente ma rétractation du contrat portant sur la prestation de service ci-dessous :', { size: 9 });
          y += 3;
          text('Commandé le / reçu le : ............................', { size: 9 });
          text('Nom du consommateur : ............................', { size: 9 });
          text('Adresse du consommateur : ............................', { size: 9 });
          y += 10;
          text('Signature :', { size: 9 });
          doc.rect(m, y + 2, 60, 25);
          y += 30;
          text('Date : ............................', { size: 9 });
        }
      }

      // ========== BON DE VISITE ==========
      else if (selectedTemplate.id === 'bon_visite') {
        title('BON DE VISITE');
        y += 10;
        text(`Je soussigné(e) ${formData.client_civilite || ''} ${formData.client_nom || '............................'}`, { size: 10 });
        text(`Demeurant : ${formData.client_adresse || '............................'}`, { size: 9 });
        text(`Téléphone : ${formData.client_telephone || '..........'} - Email : ${formData.client_email || '..........'}`, { size: 9 });
        y += 5;
        text('Reconnais avoir visité le bien suivant :', { size: 10, bold: true });
        y += 3;
        field('Référence', formData.bien_reference);
        field('Adresse', formData.bien_adresse);
        field('Prix affiché', formatCurrency(formData.prix_vente));
        y += 5;
        field('Date de la visite', formatDate(formData.visite_date));
        field('Heure', formData.visite_heure);
        field('Agent présent', formData.agent_nom);
        y += 8;
        text(`Présenté par l'intermédiaire de l'agence ${agencyInfo.nom || '............................'}`, { size: 9 });
        text('Je m\'engage à ne pas traiter directement ou indirectement avec le propriétaire ou tout autre intermédiaire pour ce bien, pendant la durée du mandat et les 12 mois suivants.', { size: 8 });
        y += 15;
        text(`Fait à ........................ le ${formatDate(formData.visite_date || new Date().toISOString())}`, { size: 10 });
        y += 10;
        text('Signature du visiteur :', { size: 9 });
        doc.rect(m, y + 2, 70, 30);
      }

      // ========== OFFRE D'ACHAT ==========
      else if (selectedTemplate.id === 'offre_achat') {
        title('OFFRE D\'ACHAT');
        text('(Article 1583 du Code civil)', { size: 8, italic: true, center: true, color: [100,100,100] });
        y += 8;

        text('L\'ACQUÉREUR', { size: 10, bold: true });
        text(`${formData.acquereur_civilite || ''} ${formData.acquereur_nom || '............................'}`, { size: 9 });
        text(`Demeurant : ${formData.acquereur_adresse || '............................'}`, { size: 9 });
        text(`Téléphone : ${formData.acquereur_telephone || '..........'} - Email : ${formData.acquereur_email || '..........'}`, { size: 9 });
        y += 5;

        text('FAIT L\'OFFRE D\'ACQUISITION DU BIEN SUIVANT', { size: 10, bold: true });
        field('Adresse du bien', formData.bien_adresse);
        field('Appartenant à', formData.vendeur_nom);
        y += 5;

        text('CONDITIONS DE L\'OFFRE', { size: 10, bold: true });
        field('Prix demandé', formatCurrency(formData.prix_demande));
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        y += 3;
        doc.text(`PRIX PROPOSÉ : ${formatCurrency(formData.prix_offre)}`, m, y);
        y += 8;
        field('Mode de financement', formData.financement);
        if (formData.apport) field('Apport personnel', formatCurrency(formData.apport));
        if (formData.pret) field('Montant du prêt envisagé', formatCurrency(formData.pret));
        y += 3;
        text(`Cette offre est valable ${formData.validite || '10'} jours à compter de ce jour.`, { size: 9, bold: true });
        y += 3;
        text('CONDITIONS SUSPENSIVES', { size: 10, bold: true });
        text(formData.conditions || 'Sous réserve de l\'obtention d\'un prêt immobilier aux conditions du marché.', { size: 9 });
        y += 10;
        text(`Fait à ........................ le ${formatDate(new Date().toISOString())}`, { size: 10 });
        y += 10;
        const sbw = (cw - 20) / 2;
        doc.text('Signature de l\'acquéreur', m, y);
        doc.text('Signature du vendeur (pour acceptation)', m + sbw + 20, y);
        y += 5;
        doc.rect(m, y, sbw, 35);
        doc.rect(m + sbw + 20, y, sbw, 35);
      }

      footer();

      // Save PDF
      const clientName = formData.mandant_nom || formData.client_nom || formData.acquereur_nom || 'document';
      const fileName = `${selectedTemplate.id}_${clientName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      doc.save(fileName);

      // Save to history
      const newDoc = {
        id: Date.now(),
        template: selectedTemplate.name,
        templateId: selectedTemplate.id,
        data: formData,
        date: new Date().toISOString(),
        client: clientName,
      };
      const updatedDocs = [newDoc, ...savedDocuments].slice(0, 30);
      setSavedDocuments(updatedDocs);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedDocs));

    } catch (err) {
      console.error('PDF error:', err);
      alert('Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  // Form sections based on template
  const getFormSections = () => {
    if (!selectedTemplate) return [];
    const isMandat = selectedTemplate.id.includes('mandat');
    const isVisit = selectedTemplate.id === 'bon_visite';
    const isOffer = selectedTemplate.id === 'offre_achat';

    if (isMandat) {
      return [
        { id: 1, title: 'Mandant (vendeur)', fields: [
          { key: 'mandant_civilite', label: 'Civilité', type: 'select', options: ['M.', 'Mme', 'M. et Mme'] },
          { key: 'mandant_nom', label: 'Nom complet', type: 'text', required: true },
          { key: 'mandant_naissance', label: 'Date de naissance', type: 'date' },
          { key: 'mandant_lieu_naissance', label: 'Lieu de naissance', type: 'text' },
          { key: 'mandant_nationalite', label: 'Nationalité', type: 'text', default: 'Française' },
          { key: 'mandant_regime', label: 'Régime matrimonial', type: 'select', options: ['Communauté légale', 'Séparation de biens', 'Communauté universelle', 'Célibataire', 'Pacsé(e)', 'Non applicable'] },
          { key: 'mandant_adresse', label: 'Adresse complète', type: 'text', required: true },
          { key: 'mandant_telephone', label: 'Téléphone', type: 'text' },
          { key: 'mandant_email', label: 'Email', type: 'email' },
        ]},
        { id: 2, title: 'Bien immobilier', fields: [
          { key: 'bien_type', label: 'Type de bien', type: 'select', options: ['Appartement', 'Maison', 'Villa', 'Terrain', 'Local commercial', 'Immeuble', 'Parking/Box'] },
          { key: 'bien_adresse', label: 'Adresse du bien', type: 'text', required: true },
          { key: 'bien_surface', label: 'Surface Carrez (m²)', type: 'number' },
          { key: 'bien_description', label: 'Description détaillée', type: 'textarea' },
          { key: 'bien_libre', label: 'Bien libre', type: 'select', options: [['oui', 'Libre de toute occupation'], ['non', 'Loué']] },
          { key: 'diagnostics_charge', label: 'Diagnostics', type: 'select', options: [['mandant', 'À la charge du mandant'], ['mandataire', 'À faire par le mandataire']] },
        ]},
        { id: 3, title: 'Conditions du mandat', fields: [
          { key: 'mandat_numero', label: 'N° de mandat', type: 'text', required: true },
          { key: 'mandat_date', label: 'Date de signature', type: 'date', required: true },
          { key: 'mandat_duree', label: 'Durée (mois)', type: 'number', default: 3, required: true },
          { key: 'mandat_tacite', label: 'Tacite reconduction', type: 'select', options: [['non', 'Non'], ['oui', 'Oui']] },
          { key: 'lieu_signature', label: 'Lieu de signature', type: 'text' },
          { key: 'diffusion', label: 'Moyens de diffusion', type: 'text', default: 'Internet, vitrine, réseaux partenaires' },
        ]},
        { id: 4, title: 'Prix et honoraires', fields: [
          { key: 'prix_vente', label: 'Prix de vente (€)', type: 'number', required: true },
          { key: 'honoraires_pourcentage', label: 'Honoraires (%)', type: 'number', default: 5 },
          { key: 'honoraires_montant', label: 'Honoraires (€)', type: 'number' },
          { key: 'honoraires_charge', label: 'À la charge de', type: 'select', options: [['acquereur', 'Acquéreur'], ['vendeur', 'Vendeur'], ['partage', 'Partagés']] },
          { key: 'sequestre', label: 'Séquestre', type: 'select', options: [['notaire', 'Notaire'], ['mandataire', 'Mandataire']] },
          { key: 'notaire', label: 'Notaire désigné', type: 'text' },
        ]},
      ];
    }
    if (isVisit) {
      return [
        { id: 1, title: 'Client visiteur', fields: [
          { key: 'client_civilite', label: 'Civilité', type: 'select', options: ['M.', 'Mme', 'M. et Mme'] },
          { key: 'client_nom', label: 'Nom complet', type: 'text', required: true },
          { key: 'client_adresse', label: 'Adresse', type: 'text' },
          { key: 'client_telephone', label: 'Téléphone', type: 'text', required: true },
          { key: 'client_email', label: 'Email', type: 'email' },
        ]},
        { id: 2, title: 'Bien et visite', fields: [
          { key: 'bien_reference', label: 'Référence du bien', type: 'text' },
          { key: 'bien_adresse', label: 'Adresse du bien', type: 'text', required: true },
          { key: 'prix_vente', label: 'Prix affiché (€)', type: 'number' },
          { key: 'visite_date', label: 'Date de visite', type: 'date', required: true },
          { key: 'visite_heure', label: 'Heure', type: 'time' },
          { key: 'agent_nom', label: 'Agent présent', type: 'text', required: true },
        ]},
      ];
    }
    if (isOffer) {
      return [
        { id: 1, title: 'Acquéreur', fields: [
          { key: 'acquereur_civilite', label: 'Civilité', type: 'select', options: ['M.', 'Mme', 'M. et Mme'] },
          { key: 'acquereur_nom', label: 'Nom complet', type: 'text', required: true },
          { key: 'acquereur_adresse', label: 'Adresse', type: 'text', required: true },
          { key: 'acquereur_telephone', label: 'Téléphone', type: 'text' },
          { key: 'acquereur_email', label: 'Email', type: 'email' },
        ]},
        { id: 2, title: 'Bien et offre', fields: [
          { key: 'bien_adresse', label: 'Adresse du bien', type: 'text', required: true },
          { key: 'vendeur_nom', label: 'Nom du vendeur', type: 'text' },
          { key: 'prix_demande', label: 'Prix demandé (€)', type: 'number' },
          { key: 'prix_offre', label: 'Prix proposé (€)', type: 'number', required: true },
          { key: 'financement', label: 'Mode de financement', type: 'select', options: ['Comptant', 'Crédit immobilier', 'Mixte (apport + crédit)'] },
          { key: 'apport', label: 'Apport personnel (€)', type: 'number' },
          { key: 'pret', label: 'Montant du prêt (€)', type: 'number' },
          { key: 'validite', label: 'Validité de l\'offre (jours)', type: 'number', default: 10 },
          { key: 'conditions', label: 'Conditions suspensives', type: 'textarea', default: 'Sous réserve de l\'obtention d\'un prêt immobilier aux conditions du marché.' },
        ]},
      ];
    }
    return [];
  };

  const sections = getFormSections();
  const currentSection = sections.find(s => s.id === step);
  const isAgencyConfigured = agencyInfo.nom && agencyInfo.carte_pro;

  return (
    <div style={{ maxWidth: '1200px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px', height: '48px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.05) 100%)',
              borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FileText size={24} style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '600' }}>Générateur de documents</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Documents conformes UNIS/CNACIM • Loi Hoguet • MAJ décembre 2024
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAgencySettings(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
              background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
              borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer',
            }}
          >
            <Settings size={16} /> Paramètres agence
          </button>
        </div>

        {!isAgencyConfigured && (
          <div style={{
            padding: '12px 16px', background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '8px',
            display: 'flex', alignItems: 'center', gap: '10px',
          }}>
            <AlertTriangle size={18} style={{ color: '#f59e0b' }} />
            <span style={{ fontSize: '13px', color: '#f59e0b' }}>
              Configurez votre agence (carte pro, garantie...) avant de générer des documents conformes.
            </span>
          </div>
        )}

        {/* Source link */}
        <a
          href="https://www.cnacim.immo/modeles-de-mandats/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '12px',
            padding: '6px 12px', background: 'var(--bg-tertiary)', borderRadius: '6px',
            color: 'var(--text-muted)', fontSize: '12px', textDecoration: 'none',
          }}
        >
          <ExternalLink size={12} /> Modèles officiels CNACIM
        </a>
      </div>

      {/* Agency Settings Modal */}
      {showAgencySettings && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
        }}>
          <div style={{
            width: '100%', maxWidth: '700px', background: 'var(--bg-card)',
            borderRadius: '16px', maxHeight: '90vh', overflow: 'auto',
          }}>
            <div style={{
              padding: '20px', borderBottom: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1,
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Paramètres de l'agence</h3>
              <button onClick={() => setShowAgencySettings(false)} style={{ padding: '8px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {[
                { key: 'nom', label: 'Nom de l\'agence *', span: 2 },
                { key: 'forme_juridique', label: 'Forme juridique', type: 'select', options: ['SARL', 'SAS', 'EURL', 'EI', 'Auto-entrepreneur'] },
                { key: 'capital', label: 'Capital (€)' },
                { key: 'siege', label: 'Siège social (adresse complète) *', span: 2 },
                { key: 'rcs', label: 'N° RCS' },
                { key: 'tva', label: 'N° TVA' },
                { key: 'telephone', label: 'Téléphone' },
                { key: 'email', label: 'Email' },
                { key: 'carte_pro', label: 'N° carte professionnelle *' },
                { key: 'carte_delivree_par', label: 'CCI délivrant la carte' },
                { key: 'garantie_nom', label: 'Organisme garantie financière' },
                { key: 'garantie_montant', label: 'Montant garantie (€)' },
                { key: 'assurance_nom', label: 'Assurance RCP' },
                { key: 'assurance_adresse', label: 'Adresse assurance' },
                { key: 'compte_sequestre', label: 'N° compte séquestre' },
                { key: 'banque_sequestre', label: 'Banque séquestre' },
                { key: 'mediateur_nom', label: 'Médiateur consommation', span: 2 },
                { key: 'mediateur_adresse', label: 'Coordonnées médiateur', span: 2 },
                { key: 'tarifs', label: 'Barème des honoraires', span: 2, type: 'textarea' },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: f.span === 2 ? '1 / -1' : 'auto' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>{f.label}</label>
                  {f.type === 'select' ? (
                    <select value={agencyInfo[f.key] || ''} onChange={(e) => setAgencyInfo(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: '100%', padding: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px' }}>
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : f.type === 'textarea' ? (
                    <textarea value={agencyInfo[f.key] || ''} onChange={(e) => setAgencyInfo(p => ({ ...p, [f.key]: e.target.value }))} rows={2}
                      style={{ width: '100%', padding: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px', resize: 'vertical' }} />
                  ) : (
                    <input type="text" value={agencyInfo[f.key] || ''} onChange={(e) => setAgencyInfo(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: '100%', padding: '10px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px' }} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)' }}>
              <button onClick={saveAgencyInfo} style={{
                width: '100%', padding: '14px',
                background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                border: 'none', borderRadius: '8px', color: 'var(--bg-primary)', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedTemplate ? '280px 1fr' : '1fr', gap: '24px' }}>
        {/* Templates List */}
        <div>
          {!selectedTemplate && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} style={{
                  padding: '8px 14px',
                  background: selectedCategory === cat ? 'var(--gold)' : 'var(--bg-card)',
                  border: `1px solid ${selectedCategory === cat ? 'var(--gold)' : 'var(--border-color)'}`,
                  borderRadius: '8px',
                  color: selectedCategory === cat ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  fontSize: '13px', fontWeight: '500', cursor: 'pointer',
                }}>{cat}</button>
              ))}
            </div>
          )}

          {!selectedTemplate ? (
            <div style={{ display: 'grid', gap: '12px' }}>
              {filteredTemplates.map(t => (
                <div key={t.id} onClick={() => handleSelectTemplate(t)} style={{
                  padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                  borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                  <div style={{ width: '40px', height: '40px', background: 'rgba(212, 175, 55, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <t.icon size={20} style={{ color: 'var(--gold)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600' }}>{t.name}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.description}</p>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                      <span style={{ padding: '2px 6px', background: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '10px', color: 'var(--text-muted)' }}>{t.pages} pages</span>
                      <span style={{ padding: '2px 6px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '4px', fontSize: '10px', color: '#22c55e' }}>{t.source}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)' }}>
                <button onClick={() => { setSelectedTemplate(null); setStep(1); }} style={{
                  padding: '6px 12px', background: 'var(--bg-tertiary)', border: 'none', borderRadius: '6px',
                  color: 'var(--text-muted)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                }}><ChevronLeft size={14} /> Retour</button>
              </div>
              {sections.map(s => (
                <div key={s.id} onClick={() => setStep(s.id)} style={{
                  padding: '12px 16px', borderBottom: '1px solid var(--border-color)', cursor: 'pointer',
                  background: step === s.id ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: step === s.id ? 'var(--gold)' : 'var(--bg-tertiary)',
                      color: step === s.id ? 'var(--bg-primary)' : 'var(--text-muted)', fontSize: '12px', fontWeight: '600',
                    }}>{s.id}</span>
                    <span style={{ fontSize: '13px', color: step === s.id ? 'var(--gold)' : 'var(--text-secondary)', fontWeight: step === s.id ? '500' : '400' }}>{s.title}</span>
                  </div>
                  {s.fields.filter(f => f.required).every(f => formData[f.key]) && <Check size={14} style={{ color: '#22c55e' }} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form */}
        {selectedTemplate && currentSection && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600' }}>{selectedTemplate.name}</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Étape {step}/{sections.length} : {currentSection.title}</p>
            </div>

            {/* Auto-fill from listing */}
            {step === 2 && selectedTemplate.id.includes('mandat') && listings.length > 0 && (
              <div style={{ padding: '16px 24px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Building2 size={16} style={{ color: 'var(--gold)' }} />
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>Remplir depuis une annonce</span>
                  <select
                    onChange={(e) => {
                      const listing = listings.find(l => l.id === e.target.value);
                      if (listing) autoFillFromListing(listing);
                    }}
                    value={selectedListing?.id || ''}
                    style={{ flex: 1, padding: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '13px', color: 'var(--text-primary)' }}
                  >
                    <option value="">Sélectionner un bien...</option>
                    {listings.map(l => <option key={l.id} value={l.id}>{l.title} - {l.location}</option>)}
                  </select>
                </div>
              </div>
            )}

            <div style={{ padding: '24px', maxHeight: '400px', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {currentSection.fields.map(f => (
                  <div key={f.key} style={{ gridColumn: f.type === 'textarea' ? '1 / -1' : 'auto' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                      {f.label} {f.required && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>
                    {f.type === 'select' ? (
                      <select value={formData[f.key] || ''} onChange={(e) => handleInputChange(f.key, e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px' }}>
                        <option value="">Sélectionner...</option>
                        {f.options.map(o => Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : f.type === 'textarea' ? (
                      <textarea value={formData[f.key] || f.default || ''} onChange={(e) => handleInputChange(f.key, e.target.value)} rows={3}
                        style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px', resize: 'vertical' }} />
                    ) : (
                      <input type={f.type} value={formData[f.key] || ''} onChange={(e) => handleInputChange(f.key, f.type === 'number' ? parseFloat(e.target.value) || '' : e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '14px' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} style={{
                padding: '12px 20px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                borderRadius: '8px', color: step === 1 ? 'var(--text-muted)' : 'var(--text-secondary)',
                fontSize: '14px', cursor: step === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
              }}><ChevronLeft size={18} /> Précédent</button>

              {step < sections.length ? (
                <button onClick={() => setStep(step + 1)} style={{
                  padding: '12px 24px', background: 'var(--gold)', border: 'none', borderRadius: '8px',
                  color: 'var(--bg-primary)', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>Suivant <ChevronRight size={18} /></button>
              ) : (
                <button onClick={generatePDF} disabled={generating} style={{
                  padding: '12px 24px',
                  background: generating ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
                  border: 'none', borderRadius: '8px',
                  color: generating ? 'var(--text-muted)' : 'var(--bg-primary)',
                  fontSize: '14px', fontWeight: '600', cursor: generating ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  {generating ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={18} />}
                  {generating ? 'Génération...' : 'Générer le PDF'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Recent Documents */}
      {!selectedTemplate && savedDocuments.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Documents récents</h3>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
            {savedDocuments.slice(0, 10).map((doc, idx) => (
              <div key={doc.id} style={{
                padding: '14px 20px', borderBottom: idx < 9 ? '1px solid var(--border-color)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <File size={18} style={{ color: '#ef4444' }} />
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500' }}>{doc.template}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{doc.client} • {new Date(doc.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { const t = documentTemplates.find(x => x.id === doc.templateId); if (t) { handleSelectTemplate(t); setFormData(doc.data); }}}
                    style={{ padding: '6px 12px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-secondary)', fontSize: '12px', cursor: 'pointer' }}>
                    <Edit2 size={12} style={{ marginRight: '4px' }} /> Modifier
                  </button>
                  <button onClick={() => { if (confirm('Supprimer ?')) { const u = savedDocuments.filter(d => d.id !== doc.id); setSavedDocuments(u); localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); }}}
                    style={{ padding: '6px', background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default DocumentGenerator;
