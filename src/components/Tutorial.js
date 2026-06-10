import { AppState } from '../state.js';

let tutorialActive = false;
let currentView = "";
let currentSteps = [];
let currentStepIndex = 0;

/**
 * Localized Onboarding Tour Steps Configurations
 * - targetId: DOM Selector key of the HTML element
 * - title: Localized headline name
 * - content: The helpful localized description explaining the "nook and crannies"
 * - placement: Suggested position ('bottom', 'top', 'left', 'right')
 */
const getLocalizedSteps = (viewPath, lang) => {
    // English definitions
    const stepsEn = {
         home: [
             {
                 targetId: 'hero-search-input',
                 title: 'Smart Search Bar',
                 content: 'Type any keywords, technologies, or roles here to quickly query all matching freelance postings in real-time.',
                 placement: 'bottom'
             },
             {
                 targetId: 'search-btn',
                 title: 'Launch Query Searches',
                 content: 'Click this active trigger to load results instantly matching your entered semantic keywords in the database.',
                 placement: 'bottom'
             },
             {
                 targetId: 'category-filters',
                 title: 'Quick Categories',
                 content: 'Filter the catalog instantly by clicking direct buttons representing specialized domains (Web Code, Graphic Design, Marketing).',
                 placement: 'bottom'
             },
             {
                 targetId: 'freelance-search-home',
                 title: 'Talent Quick Filters',
                 content: 'Sort available freelancers directly by typing their structural skill tags, expertise or public profile names.',
                 placement: 'bottom'
             },
             {
                 targetId: 'home-see-all-btn',
                 title: 'See All Services',
                 content: 'This represents the global "Tout voir" portal of services! Click to explore the complete catalog with extensive budget and delivery filters.',
                 placement: 'bottom'
             },
             {
                 targetId: 'home-see-profiles-btn',
                 title: 'See All Profiles',
                 content: 'Interested in exploring expert portfolios? Click "Voir plus" here to browse our entire trusted talent directory directly!',
                 placement: 'bottom'
             }
         ],
         marketplace: [
             {
                 targetId: 'freelanceSearchInput',
                 title: 'Talent Quick Finder',
                 content: 'Enter names, specializations, or localized tags directly to filter matching freelancer accounts listed below.',
                 placement: 'bottom'
             },
             {
                 targetId: 'freelanceCategorySelect',
                 title: 'Category Targeter',
                 content: 'Select the precise professional category pool you want to browse (Development, Design, Marketing, etc.).',
                 placement: 'bottom'
             },
             {
                 targetId: 'freelanceLocationInput',
                 title: 'Geographic Location Locator',
                 content: 'Filter freelancers by geographic coordinates or physical place tag descriptors for close collaboration.',
                 placement: 'bottom'
             },
             {
                 targetId: 'budgetRange',
                 title: 'Budget Maximizer',
                 content: 'Drag this slider to set your maximum budget threshold and exclude services outside your price envelope.',
                 placement: 'bottom'
             },
             {
                 targetId: 'reset-filters',
                 title: 'Reset Filter Criteria',
                 content: 'Clear all selected categories and values instantaneously to restart your search from scratch.',
                 placement: 'bottom'
             },
             {
                 targetId: 'toggle-vview-studio',
                 title: 'HD Video Recommendations',
                 content: 'Switch layouts to watch premium video reviews and testimonials made by happy customers after receiving projects!',
                 placement: 'bottom'
             }
         ],
         publish: [
             {
                 targetId: 'template-selector',
                 title: 'AI Template Filler',
                 content: 'Save substantial time! Select a structured thematic template to pre-generate realistic pricing and description details.',
                 placement: 'bottom'
             },
             {
                 targetId: 'service-title',
                 title: 'Service Catchy Title',
                 content: 'Type descriptive title summarizing exactly what deliverable value you propose to buyers.',
                 placement: 'bottom'
             },
             {
                 targetId: 'service-desc',
                 title: 'Detailed Presentation Block',
                 content: 'Explain in length active parameters of your offer: technologies used, deliverables folder package structure, and features included.',
                 placement: 'bottom'
             },
             {
                 targetId: 'service-price',
                 title: 'Deliverable Pricing Base',
                 content: 'Specify your starting package price here. The platform handles currency conversion automatically based on active visitor preferences.',
                 placement: 'bottom'
             },
             {
                 targetId: 'service-delay',
                 title: 'Delivery Timespan Estimation',
                 content: 'Enter expected timeframe boundaries needed to deliver the completed service professionally.',
                 placement: 'bottom'
             },
             {
                 targetId: 'tab-img-url',
                 title: 'Visual Assets Selection',
                 content: 'Switch formats easily between typing a web URL link or uploading file binaries directly from your computer.',
                 placement: 'bottom'
             },
             {
                 targetId: 'btn-preview',
                 title: 'Pre-Publish Render',
                 content: 'Preview how your final service card looks to verify text descriptions and design layout prior to public publishing.',
                 placement: 'bottom'
             }
         ],
         dashboard: [
              {
                  targetId: 'analytics-root',
                  title: 'Cumulative Revenue Chart',
                  content: 'Follow your business monthly performance metrics beautifully drawn via chronological visual chart graphs.',
                  placement: 'bottom'
              },
              {
                  targetId: 'btn-download-pdf',
                  title: 'PDF Bookkeeping Export',
                  content: 'Compile and download a comprehensive paper-styled report statement summarizing active gig sales and earnings.',
                  placement: 'bottom'
              },
              {
                  targetId: 'col-pending',
                  title: 'Job Progress Kanban',
                  content: 'Easily drag or group contracts according to active phase progression tracks: Pending, In Progress, or Completed.',
                  placement: 'bottom'
              },
              {
                  targetId: 'col-progress',
                  title: 'Ongoing Gigs Track',
                  content: 'Active milestone contracts currently on your plate. Drag files or talk details securely inside dedicated tracks!',
                  placement: 'bottom'
              },
              {
                  targetId: 'col-completed',
                  title: 'Delivered Milestones Ledger',
                  content: 'All verified clean codes and delivered projects. This directly impacts your public profile review statistics.',
                  placement: 'bottom'
              }
         ],
         messaging: [
              {
                  targetId: 'contacts-list',
                  title: 'Direct Channels Directory',
                  content: 'Paruse ongoing conversation slots here. Check alert counts denoting incoming unread text pages.',
                  placement: 'bottom'
              },
              {
                  targetId: 'btn-new-chat',
                  title: 'Initiate Dynamic Conversations',
                  content: 'Click this button to launch a quick lookup and create a new secure conversation session with any freelancer or customer on the platform.',
                  placement: 'bottom'
              },
              {
                  targetId: 'btn-chat-attach',
                  title: 'Share Documentations',
                  content: 'Attach design frames, brief files, invoices, or zip archives securely to speed up project requirements.',
                  placement: 'bottom'
              },
              {
                  targetId: 'btn-chat-mic',
                  title: 'Record Voice Memos',
                  content: 'Explain guidelines without typing! Hold down the microphone icon to record high-fidelity voice notes.',
                  placement: 'bottom'
              },
              {
                  targetId: 'chat-input',
                  title: 'Message Center Controls',
                  content: 'Discuss specifications seamlessly: insert micro-emojis, type guidelines, or speak voice clips by holding the microphone.',
                  placement: 'bottom'
              }
         ],
         settings: [
              {
                  targetId: 'lang-select',
                  title: 'Global Translation Switcher',
                  content: 'Translate the complete user interface instantly between English, French, and Spanish.',
                  placement: 'bottom'
              },
              {
                  targetId: 'curr-select',
                  title: 'Preferred Currency Conversion',
                  content: 'Change the dynamic financial unit of display to compute pricing in EUR, USD, or XOF currency tags.',
                  placement: 'bottom'
              },
              {
                  targetId: 'btn-add-template',
                  title: 'Custom Client Templates',
                  content: 'Define custom template presets here to publish recurring design or coding listings in one click.',
                  placement: 'bottom'
              },
              {
                  targetId: 'btn-configure-2fa',
                  title: 'Security Shield (2FA)',
                  content: 'Fortify your earnings security! Activate 2-Factor Authentication requesting time-based codes to check security updates.',
                  placement: 'bottom'
              },
              {
                  targetId: 'db-old-password',
                  title: 'Credentials Renewal',
                  content: 'Renew your secure login password parameters by typing your current and new credentials instantly.',
                  placement: 'bottom'
              }
         ],
         profile: [
              {
                  targetId: 'toggle-availability',
                  title: 'Availability Badge Control',
                  content: 'Switch active busy states instantly so visitors know whether you accept new orders or are booked with milestones.',
                  placement: 'left'
              },
              {
                  targetId: 'btn-export-pdf',
                  title: 'Export Portfolio CV',
                  content: 'Compile and download your developer credentials, BIO, statistics, and reviews nicely structured in an offline PDF format.',
                  placement: 'bottom'
              },
              {
                  targetId: 'btn-upload-portfolio',
                  title: 'Expand Public Portfolio',
                  content: 'Highlight previous design milestones or code snippets with cover thumbnails to grow expert conversion ratings.',
                  placement: 'bottom'
              }
         ],
         tracking: [
              {
                  targetId: 'tracking-root',
                  title: 'Deal Tracking Hub',
                  content: 'Check contractual milestones, deliverable files, validation counts, and revision demands for your gigs.',
                  placement: 'bottom'
              }
         ]
    };

    // French definitions (Default master)
    const stepsFr = {
         home: [
             {
                 targetId: 'hero-search-input',
                 title: 'Recherche Intelligente',
                 content: 'Tapez des compétences ou mots-clés spécifiques ici pour trouver instantanément des offres adaptées en temps réel.',
                 placement: 'bottom'
             },
             {
                 targetId: 'search-btn',
                 title: 'Lancer la requête',
                 content: 'Cliquez sur ce bouton pour valider et déclencher la recherche sémantique de fiches services.',
                 placement: 'bottom'
             },
             {
                 targetId: 'category-filters',
                 title: 'Raccourcis Catégories',
                 content: 'Filtrez d\'un clic l\'ensemble de l\'offre par domaine d\'expertise métier (Développement Web, Design, Marketing).',
                 placement: 'bottom'
             },
             {
                 targetId: 'freelance-search-home',
                 title: 'Filtrer les Experts',
                 content: 'Saisissez directement une compétence technique ou un nom de freelance pour affiner le catalogue affiché ci-dessous.',
                 placement: 'bottom'
             },
             {
                 targetId: 'home-see-all-btn',
                 title: 'Tout Voir (Services)',
                 content: 'Il s\'agit du bouton "Tout voir" pour les services ! Cliquez dessus pour explorer le catalogue général avec filtres avancés de budget et délais.',
                 placement: 'bottom'
             },
             {
                 targetId: 'home-see-profiles-btn',
                 title: 'Voir Plus (Profils)',
                 content: 'Accédez à l\'annuaire exhaustif de tous nos freelances vérifiés, consultez leurs fiches et comparez leurs avis.',
                 placement: 'bottom'
             }
         ],
         marketplace: [
             {
                 targetId: 'freelanceSearchInput',
                 title: 'Moteur de Recherche',
                 content: 'Recherchez vos freelances favoris par mot-clé, compétence clé ou nom directement depuis cet espace.',
                 placement: 'bottom'
             },
             {
                 targetId: 'freelanceCategorySelect',
                 title: 'Sélecteur de Catégorie',
                 content: 'Spécifiez la thématique professionnelle qui vous intéresse (Dév, Design, Rédaction, etc.) pour ordonner les offres.',
                 placement: 'bottom'
             },
             {
                 targetId: 'freelanceLocationInput',
                 title: 'Filtre Géographique',
                 content: 'Ciblez vos prestataires selon leur pays ou ville de résidence pour simplifier les rendez-vous professionnels.',
                 placement: 'bottom'
             },
             {
                 targetId: 'budgetRange',
                 title: 'Contrôle Budgétaire',
                 content: 'Faites glisser ce curseur pour exclure instantanément les prestations de service qui dépassent votre budget.',
                 placement: 'bottom'
             },
             {
                 targetId: 'reset-filters',
                 title: 'Remise à Zéro des tris',
                 content: 'Effacez tous vos critères choisis pour réinitialiser la vue d\'ensemble du catalogue.',
                 placement: 'bottom'
             },
             {
                 targetId: 'toggle-vview-studio',
                 title: 'Témoignements Vidéo HD',
                 content: 'Changez de mode pour visionner les recommandations vidéo tournées par d\'anciens clients satisfaits !',
                 placement: 'bottom'
             }
         ],
         publish: [
             {
                 targetId: 'template-selector',
                 title: 'Modèles de création',
                 content: 'Gagnez un temps précieux ! Sélectionnez un modèle thématique de service pré-rempli à adapter selon vos besoins.',
                 placement: 'bottom'
             },
             {
                 targetId: 'service-title',
                 title: 'Nom commercial du service',
                 content: 'Déterminez un titre explicite et percutant récapitulant la plus-value de votre proposition.',
                 placement: 'bottom'
             },
             {
                 targetId: 'service-desc',
                 title: 'Description détaillée',
                 content: 'Présentez point par point le contenu de ce que vous livrez : technologies de pointe, livrables, clauses d\'assistance, etc.',
                 placement: 'bottom'
             },
             {
                 targetId: 'service-price',
                 title: 'Base de Tarification',
                 content: 'Configurez le coût de base de votre service. La plateforme convertira les chiffres selon la devise de l\'acheteur.',
                 placement: 'bottom'
             },
             {
                 targetId: 'service-delay',
                 title: 'Délai Réaliste estimé',
                 content: 'Définissez la durée nécessaire pour compléter et finaliser la réalisation de la prestation.',
                 placement: 'bottom'
             },
             {
                 targetId: 'tab-img-url',
                 title: 'Illustration de l\'Offre',
                 content: 'Déterminez si vous souhaitez coller le lien d\'un visuel en ligne ou téléverser un fichier depuis votre disque dur.',
                 placement: 'bottom'
             },
             {
                 targetId: 'btn-preview',
                 title: 'Prévisualisation en Direct',
                 content: 'Admirez le rendu visuel exact de votre carte d\'offre afin de fignoler les textes avant mise en ligne.',
                 placement: 'bottom'
             }
         ],
         dashboard: [
              {
                  targetId: 'analytics-root',
                  title: 'Graphique d\'Évolution',
                  content: 'Suivez la courbe de progression et l\'historique mensuel de votre chiffre d\'affaires de manière claire.',
                  placement: 'bottom'
              },
              {
                  targetId: 'btn-download-pdf',
                  title: 'Rapport Comptable PDF',
                  content: 'Générez un bilan récapitulatif paginé et imprimable de vos transactions pour votre comptabilité.',
                  placement: 'bottom'
              },
              {
                  targetId: 'col-pending',
                  title: 'Kanban - Demandes en Attente',
                  content: 'Consultez les requêtes de commandes formulées par les acheteurs à valider avant de commencer l\'exécution.',
                  placement: 'bottom'
              },
              {
                  targetId: 'col-progress',
                  title: 'Contrats En cours de réalisation',
                  content: 'La liste de vos chantiers actifs et de vos livraisons d\'étapes intermédiaires urgentes.',
                  placement: 'bottom'
              },
              {
                  targetId: 'col-completed',
                  title: 'Commandes Finalisées et Complétées',
                  content: 'Tous les projets validés par vos clients se rangent ici. Un excellent gage de crédibilité !',
                  placement: 'bottom'
              }
         ],
         messaging: [
              {
                  targetId: 'contacts-list',
                  title: 'Canaux Ouverts',
                  content: 'Sélectionnez vos discussions actives. Des compteurs colorés vous informent du nombre de messages en attente.',
                  placement: 'bottom'
              },
              {
                  targetId: 'btn-new-chat',
                  title: 'Nouveau Canal de Discussion',
                  content: 'Cliquez pour ouvrir la recherche d\'utilisateurs et initier instantanément une nouvelle liaison de messagerie en ligne.',
                  placement: 'bottom'
              },
              {
                  targetId: 'btn-chat-attach',
                  title: 'Livraison de Fichiers',
                  content: 'Partagez instantanément des captures d\'écran, des maquettes, des consignes ou des fichiers compressés.',
                  placement: 'bottom'
              },
              {
                  targetId: 'btn-chat-mic',
                  title: 'Enregistrements Vocaux',
                  content: 'Expliquez vos consignes sans taper au clavier en enregistrant un message audio court à la volée.',
                  placement: 'bottom'
              },
              {
                  targetId: 'chat-input',
                  title: 'Outils de Dialogue',
                  content: 'Communiquez efficacement : tapez votre texte, insérez des émojis ou transmettez un message vocal en maintenant le micro.',
                  placement: 'bottom'
              }
         ],
         settings: [
              {
                  targetId: 'lang-select',
                  title: 'Traduction Directe',
                  content: 'Basculez instantanément l\'interface globale de l\'application en Français, Anglais ou Espagnol.',
                  placement: 'bottom'
              },
              {
                  targetId: 'curr-select',
                  title: 'Sélecteur de Devise',
                  content: 'Définissez votre monnaie d\'affichage par défaut pour visualiser les prix (EUR, USD, ou XOF).',
                  placement: 'bottom'
              },
              {
                  targetId: 'btn-add-template',
                  title: 'Vos Modèles Structurés',
                  content: 'Créez vos propres modèles pré-définis de fiches de prestations récurrentes pour publier d\'un clic.',
                  placement: 'bottom'
              },
              {
                  targetId: 'btn-configure-2fa',
                  title: 'Protection renforcée (2FA)',
                  content: 'Sécurisez vos données sensibles et virements financiers en activant la vérification par double facteur.',
                  placement: 'bottom'
              },
              {
                  targetId: 'db-old-password',
                  title: 'Changer votre Mot de passe',
                  content: 'Modifiez de manière sécurisée votre mot de passe d\'accès en saisissant l\'ancien et le nouveau code.',
                  placement: 'bottom'
              }
         ],
         profile: [
              {
                  targetId: 'toggle-availability',
                  title: 'Statut de Disponibilité',
                  content: 'Changez de statut d\'activité d\'un clic pour indiquer si vous êtes disponible ou occupé avec vos contrats actifs.',
                  placement: 'left'
              },
              {
                  targetId: 'btn-export-pdf',
                  title: 'Exporter votre CV en PDF',
                  content: 'Téléchargez une version condensée et propre de votre profil, historique et notes d\'avis sous forme de fichier PDF.',
                  placement: 'bottom'
              },
              {
                  targetId: 'btn-upload-portfolio',
                  title: 'Valoriser votre Portfolio',
                  content: 'Partagez vos meilleures réalisations antérieures sous forme d\'images pour attirer de nouveaux clients.',
                  placement: 'bottom'
              }
         ],
         tracking: [
              {
                  targetId: 'tracking-root',
                  title: 'Espace de Suivi Contrats',
                  content: 'Passez au crible vos consignes interactives, factures, compteurs de sécurité et demandes de révisions.',
                  placement: 'bottom'
              }
         ]
    };

    // Spanish definitions
    const stepsEs = {
         home: [
             {
                 targetId: 'hero-search-input',
                 title: 'Búsqueda Inteligente',
                 content: 'Introduzca palabras clave o profesiones seleccionados para filtrar la base de datos rápidamente.',
                 placement: 'bottom'
             },
             {
                 targetId: 'search-btn',
                 title: 'Ejecutar Búsqueda',
                 content: 'Haga clic para validar e interrogar las propuestas de servicios indexadas en nuestra base de datos.',
                 placement: 'bottom'
             },
             {
                 targetId: 'category-filters',
                 title: 'Atajos de Categorías',
                 content: 'Filtre de inmediato las ofertas de servicios por especialidad (Código, Diseño, Marketing).',
                 placement: 'bottom'
             },
             {
                 targetId: 'freelance-search-home',
                 title: 'Filtro Rápido de Autónomos',
                 content: 'Escriba etiquetas o habilidades del profesional para enfocar la búsqueda inferior de forma instantánea.',
                 placement: 'bottom'
             },
             {
                 targetId: 'home-see-all-btn',
                 title: 'Ver Todo (Servicios)',
                 content: '¡Haga clic aquí para desplegar el catálogo global y filtrar las ofertas por coste y plazos de entrega!',
                 placement: 'bottom'
             },
             {
                 targetId: 'home-see-profiles-btn',
                 title: 'Ver Más (Perfiles)',
                 content: 'Descubra el perfil completo de nuestros autónomos mejor valorados con calificaciones verificadas.',
                 placement: 'bottom'
             }
         ],
         marketplace: [
             {
                 targetId: 'freelanceSearchInput',
                 title: 'Filtro de Profesionales',
                 content: 'Ubique expertos en base a áreas profesionales claves de manera ágil.',
                 placement: 'bottom'
             },
             {
                 targetId: 'freelanceCategorySelect',
                 title: 'Selección de Especialidad',
                 content: 'Encuentre perfiles adecuados según la rama tecnológica requerida.',
                 placement: 'bottom'
             },
             {
                 targetId: 'freelanceLocationInput',
                 title: 'Filtrar por Ubicación',
                 content: 'Encuentre autónomos en base a su ubicación urbana o nacional seleccionada.',
                 placement: 'bottom'
             },
             {
                 targetId: 'budgetRange',
                 title: 'Selección de Presupuesto',
                 content: 'Deslice para ocultar instantáneamente servicios por encima de su capacidad de inversión.',
                 placement: 'bottom'
             },
             {
                 targetId: 'reset-filters',
                 title: 'Restablecer Filtros',
                 content: 'Elimine en un segundo todos los filtros de búsqueda para refrescar el catálogo.',
                 placement: 'bottom'
             },
             {
                 targetId: 'toggle-vview-studio',
                 title: 'Testimonios en Video HD',
                 content: '¡Visualice grabaciones detalladas en video expresadas por clientes de proyectos completados!',
                 placement: 'bottom'
             }
         ],
         publish: [
             {
                 targetId: 'template-selector',
                 title: 'Plantillas de Creación',
                 content: 'Ahorre tiempo cargando plantillas de presupuestos realistas y descripciones.',
                 placement: 'bottom'
             },
             {
                 targetId: 'service-title',
                 title: 'Título del Servicio',
                 content: 'Indique un título comercial atractivo para su servicio para que capte la atención de los clientes.',
                 placement: 'bottom'
             },
             {
                 targetId: 'service-desc',
                 title: 'Detallar Propuesta',
                 content: 'Describa de manera pormenorizada las tareas que engloban su oferta técnica de trabajo.',
                 placement: 'bottom'
             },
             {
                 targetId: 'service-price',
                 title: 'Estructurar Tarifa',
                 content: 'Fije el coste inicial de su encargo. La plataforma se ocupa de convertir la divisa.',
                 placement: 'bottom'
             },
             {
                 targetId: 'service-delay',
                 title: 'Tiempo Estimado de Entrega',
                 content: 'Especifique qué cantidad de días u horas demandará la entrega adecuada de su labor.',
                 placement: 'bottom'
             },
             {
                 targetId: 'tab-img-url',
                 title: 'Ilustración del encargo',
                 content: 'Introduzca el enlace de una imagen compartida en internet o suba un archivo directamente.',
                 placement: 'bottom'
             },
             {
                 targetId: 'btn-preview',
                 title: 'Pre-visualización activa',
                 content: 'Visualice al momento la estética final de su servicio antes de publicarlo.',
                 placement: 'bottom'
             }
         ],
         dashboard: [
              {
                  targetId: 'analytics-root',
                  title: 'Evolución Trimestral',
                  content: 'Consulte la gráfica organizada que recopila la facturación histórica concretada.',
                  placement: 'bottom'
              },
              {
                  targetId: 'btn-download-pdf',
                  title: 'Exportar Facturación (PDF)',
                  content: 'Descargue un desglose formateado que agrupa el volumen de negocio y estado contable.',
                  placement: 'bottom'
              },
              {
                  targetId: 'col-pending',
                  title: 'Kanban - Tareas Pendientes',
                  content: 'Vigile las ofertas de contratos pendientes de autorización o aclaración de pliegos técnicos.',
                  placement: 'bottom'
              },
              {
                  targetId: 'col-progress',
                  title: 'Trabajos en Curso',
                  content: 'Los contratos actualmente activos en desarrollo. ¡Gestione entregas y hable con su cliente!',
                  placement: 'bottom'
              },
              {
                  targetId: 'col-completed',
                  title: 'Encargos Completados con Éxito',
                  content: 'Los entregables validados de forma satisfactoria por sus clientes finales.',
                  placement: 'bottom'
              }
         ],
         messaging: [
              {
                  targetId: 'contacts-list',
                  title: 'Canales abiertos',
                  content: 'Seleccione un chat para visualizar los textos archivados e índices de alertas.',
                  placement: 'bottom'
              },
              {
                  targetId: 'btn-new-chat',
                  title: 'Lanzar Conversación Nueva',
                  content: 'Cliquee aquí para abrir la guía y buscar profesionales en línea con los que conversar.',
                  placement: 'bottom'
              },
              {
                  targetId: 'btn-chat-attach',
                  title: 'Adjuntar Anexos',
                  content: 'Facilite diagramas, esquemas, facturas o capturas de forma segura.',
                  placement: 'bottom'
              },
              {
                  targetId: 'btn-chat-mic',
                  title: 'Grabar Notas de Voz',
                  content: 'Transmita consignas rápidas con audio manteniendo pulsado el capturador de micrófono.',
                  placement: 'bottom'
              },
              {
                  targetId: 'chat-input',
                  title: 'Herramientas de Texto',
                  content: 'Redacte oraciones, incorpore divertidos emojis o mande un mensaje de voz directo.',
                  placement: 'bottom'
              }
         ],
         settings: [
              {
                  targetId: 'lang-select',
                  title: 'Elegir Idioma',
                  content: 'Configure instantáneamente toda la aplicación en Español, Francés o Inglés.',
                  placement: 'bottom'
              },
              {
                  targetId: 'curr-select',
                  title: 'Sélecteur de Devise',
                  content: 'Establezca en qué divisa prefiere que se calculen los importes de los servicios.',
                  placement: 'bottom'
              },
              {
                  targetId: 'btn-add-template',
                  title: 'Modelos Personalizados',
                  content: 'Establezca plantillas pre-formateadas de encargos habituales para agilizar su publicación.',
                  placement: 'bottom'
              },
              {
                  targetId: 'btn-configure-2fa',
                  title: 'Protección con 2FA',
                  content: 'Resguarde los datos financieros de su perfil de autónomo activando la protección 2FA.',
                  placement: 'bottom'
              },
              {
                  targetId: 'db-old-password',
                  title: 'Modificar Contraseña de Acceso',
                  content: 'Renueve su contraseña secreta rellenando con seguridad los campos correspondientes.',
                  placement: 'bottom'
              }
         ],
         profile: [
              {
                  targetId: 'toggle-availability',
                  title: 'Disponibilidad Real',
                  content: 'Señale si se encuentra contratando ofertas de trabajo o con capacidad completa.',
                  placement: 'left'
              },
              {
                  targetId: 'btn-export-pdf',
                  title: 'Descargar Curriculum vitae (PDF)',
                  content: 'Exporte en un clic un documento formal de sus habilidades e historial de servicios completados.',
                  placement: 'bottom'
              },
              {
                  targetId: 'btn-upload-portfolio',
                  title: 'Potenciar Portafolio',
                  content: 'Añada muestras seleccionadas de sus trabajos con especificaciones para captar visibilidad.',
                  placement: 'bottom'
              }
         ],
         tracking: [
              {
                  targetId: 'tracking-root',
                  title: 'Espacio de Seguimiento',
                  content: 'Examine sus facturas asociadas, hitos concretados y estados de revisión.',
                  placement: 'bottom'
              }
         ]
    };

    if (lang === 'en') return stepsEn[viewPath] || stepsEn.home;
    if (lang === 'es') return stepsEs[viewPath] || stepsEs.home;
    return stepsFr[viewPath] || stepsFr.home;
};

/**
 * Wait for element to mount stably in DOM
 */
const waitForElement = (selector, callback) => {
    let attempts = 0;
    const interval = setInterval(() => {
        // First try exact ID
        let el = document.getElementById(selector);
        if (!el) {
            // Then fallback to CSS query
            el = document.querySelector(selector);
        }
        
        if (el && el.getBoundingClientRect().width > 0) {
            clearInterval(interval);
            callback(el);
        } else if (attempts >= 15) { // 1.5 seconds max
            clearInterval(interval);
            callback(null);
        }
        attempts++;
    }, 100);
};

export const startTutorialIfNeeded = () => {
    // Tutorial disabled as per user request to remove guided tour features
    return;
};

/**
 * Launches the tour sequence for a specific view
 * @param {string} viewPath - Key of the view (e.g. 'home', 'marketplace')
 * @param {boolean} force - If true, replays the guide even if already completed
 */
export const startViewTour = (viewPath, force = false) => {
    // Tutorial disabled as per user request to remove guided tour features
    return;
};

const renderCurrentStep = () => {
    cleanupTutorial();

    if (!tutorialActive || currentStepIndex >= currentSteps.length) {
        finishTutorial();
        return;
    }

    const step = currentSteps[currentStepIndex];

    waitForElement(step.targetId, (targetEl) => {
        if (!targetEl) {
            console.warn(`[Tour] Element ${step.targetId} is not in DOM. Skipping step.`);
            currentStepIndex++;
            renderCurrentStep();
            return;
        }

        // Smart Viewport Alignment Check
        const isInViewport = (el) => {
            const r = el.getBoundingClientRect();
            return (
                r.top >= 40 &&
                r.left >= 40 &&
                r.bottom <= (window.innerHeight - 40) &&
                r.right <= (window.innerWidth - 40)
            );
        };

        // Instant centering to secure 100% stable positioning coordinates
        if (!isInViewport(targetEl)) {
            targetEl.scrollIntoView({ behavior: 'auto', block: 'center' });
        }

        // Apply a beautiful outline without tampering with element curvature
        targetEl.classList.add(
            'tour-highlight-active',
            'relative',
            'z-[450]'
        );

        // Fetch coordinates immediately after scroll is stable
        const rect = targetEl.getBoundingClientRect();

        // Add dimming glass backdrop overlay with soft animations
        const backdrop = document.createElement('div');
        backdrop.id = 'tutorial-backdrop';
        backdrop.className = 'fixed inset-0 bg-slate-950/15 dark:bg-slate-950/40 z-[400] transition-all pointer-events-auto';
        document.body.appendChild(backdrop);

        // Tooltip container
        const tooltip = document.createElement('div');
        tooltip.id = 'tutorial-tooltip';
        tooltip.className = 'absolute z-[460] w-[320px] sm:w-[350px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800/80 shadow-[0_20px_50px_rgba(15,23,42,0.08)] transition-all';

        // Placement math & Arrow pointer logic
        const tooltipWidth = 340; 
        const tooltipHeight = 160; 

        let top = rect.bottom + window.scrollY + 14;
        let left = rect.left + window.scrollX + (rect.width / 2) - 170;
        let arrowStyle = "top"; // pointer orientation

        if (step.placement === 'left') {
            top = rect.top + window.scrollY + (rect.height / 2) - (tooltipHeight / 2);
            left = rect.left + window.scrollX - tooltipWidth - 14;
            arrowStyle = "right";
        } else if (step.placement === 'right') {
            top = rect.top + window.scrollY + (rect.height / 2) - (tooltipHeight / 2);
            left = rect.right + window.scrollX + 14;
            arrowStyle = "left";
        } else if (step.placement === 'top') {
            top = rect.top + window.scrollY - tooltipHeight - 14;
            left = rect.left + window.scrollX + (rect.width / 2) - 170;
            arrowStyle = "bottom";
        }

        // Out-of-screen viewport boundaries adjustments
        if (left < 12) left = 12;
        if (left + 340 > window.innerWidth - 12) {
            left = window.innerWidth - 352;
        }
        if (top < 12) top = 12;

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;

        const isAtBottom = (top - window.scrollY) > (window.innerHeight - 280);

        // Fine position arrow pointer exactly aligned to highlighted object
        let pointerStyle = "";
        let borderClass = "";

        if (arrowStyle === 'top') {
            let pointerLeft = (rect.left + (rect.width / 2)) - left - 7;
            if (pointerLeft < 20) pointerLeft = 20;
            if (pointerLeft > 320) pointerLeft = 320;
            pointerStyle = `left: ${pointerLeft}px; top: -7px;`;
            borderClass = "border-l border-t";
        } else if (arrowStyle === 'bottom') {
            let pointerLeft = (rect.left + (rect.width / 2)) - left - 7;
            if (pointerLeft < 20) pointerLeft = 20;
            if (pointerLeft > 320) pointerLeft = 320;
            pointerStyle = `left: ${pointerLeft}px; bottom: -7px;`;
            borderClass = "border-r border-b";
        } else if (arrowStyle === 'left') {
            pointerStyle = `top: calc(50% - 7px); left: -7px;`;
            borderClass = "border-l border-b";
        } else if (arrowStyle === 'right') {
            pointerStyle = `top: calc(50% - 7px); right: -7px;`;
            borderClass = "border-r border-t";
        }

        // Progressive indicator percentage & steps count
        const progPct = ((currentStepIndex + 1) / currentSteps.length) * 100;

        // Internationalized localized actions
        let textNext = "Suivant";
        let textPrev = "Précédent";
        let textSkip = "Passer";
        let textDone = "C'est parti !";

        if (AppState.lang === 'en') {
            textNext = "Next";
            textPrev = "Previous";
            textSkip = "Skip";
            textDone = "Got it !";
        } else if (AppState.lang === 'es') {
            textNext = "Siguiente";
            textPrev = "Anterior";
            textSkip = "Omitir";
            textDone = "¡Entendido!";
        }

        const isLastStep = currentStepIndex === currentSteps.length - 1;

        const buttonsHtml = `
            <div class="flex justify-between items-center ${isAtBottom ? 'pb-3 border-b mb-3' : 'pt-4 border-t mt-4'} border-slate-150/60 dark:border-slate-800/80 text-left">
                <button id="tut-skip" class="text-xs font-bold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 py-1.5 px-1 cursor-pointer transition select-none hover:-translate-y-0.5 active:translate-y-0 duration-200">
                    ${textSkip}
                </button>
                
                <div class="flex gap-2 items-center">
                    ${currentStepIndex > 0 ? `
                        <button id="tut-prev" class="text-xs font-extrabold text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white bg-slate-100/80 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 px-3.5 py-2 rounded-xl transition cursor-pointer select-none border border-slate-200/40 dark:border-slate-700/40 hover:-translate-y-0.5 active:translate-y-0 duration-250">
                            ${textPrev}
                        </button>
                    ` : ''}
                    
                    <button id="tut-next" class="text-xs font-black bg-indigo-600 hover:bg-indigo-550 dark:bg-indigo-500 dark:hover:bg-indigo-450 text-white px-4 py-2 rounded-xl transition shadow-lg shadow-indigo-600/12 dark:shadow-none cursor-pointer select-none hover:-translate-y-0.5 active:translate-y-0 duration-250 flex items-center gap-1.5">
                        <span>${isLastStep ? textDone : textNext}</span>
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        tooltip.innerHTML = `
            <!-- Arrow tip pointer matching card colors exactly -->
            <div class="absolute w-3.5 h-3.5 bg-white dark:bg-slate-900 rotate-45 border-slate-200/80 dark:border-slate-800/80 z-0 ${borderClass}" style="${pointerStyle}"></div>
            
            <div class="relative z-10 text-left">
                <!-- Tiny Progress Header Tag -->
                <div class="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800/40">
                    <div class="flex items-center gap-2">
                        <span class="flex h-2 w-2 relative">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-600 dark:bg-indigo-400"></span>
                        </span>
                        <span class="text-[10px] uppercase tracking-widest font-extrabold text-slate-400 dark:text-slate-500">Focus-Tour</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <span class="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md select-none border border-indigo-100/30">
                            ${currentStepIndex + 1} / ${currentSteps.length}
                        </span>
                    </div>
                </div>

                ${isAtBottom ? buttonsHtml : ''}

                <h4 class="font-bold text-slate-900 dark:text-white text-base tracking-tight mb-1.5 leading-snug">
                    ${step.title}
                </h4>
                
                <p class="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium mb-1 leading-relaxed">
                    ${step.content}
                </p>
                
                ${!isAtBottom ? buttonsHtml : ''}
            </div>
        `;

        document.body.appendChild(tooltip);

        // Bind events
        document.getElementById('tut-skip').addEventListener('click', () => {
            finishTutorial();
        });

        if (currentStepIndex > 0) {
            document.getElementById('tut-prev').addEventListener('click', () => {
                cleanupTargetHighlight(targetEl);
                currentStepIndex--;
                renderCurrentStep();
            });
        }

        document.getElementById('tut-next').addEventListener('click', () => {
            cleanupTargetHighlight(targetEl);
            currentStepIndex++;
            renderCurrentStep();
        });
    });
};

const cleanupTargetHighlight = (targetEl) => {
    if (targetEl) {
        targetEl.classList.remove(
            'tour-highlight-active',
            'relative',
            'z-[450]'
        );
    }
};

export const finishTutorial = () => {
    cleanupTutorial();
    tutorialActive = false;
    if (AppState.user && currentView) {
        // Record completed so it doesn't automatically fire again
        localStorage.setItem(`tour_seen_${AppState.user.uid}_${currentView}`, 'true');
        initHelpWidget(currentView);
    }
};

const cleanupTutorial = () => {
    const backdrop = document.getElementById('tutorial-backdrop');
    if (backdrop) backdrop.remove();

    const tooltip = document.getElementById('tutorial-tooltip');
    if (tooltip) tooltip.remove();

    // Scan complete DOM for any stray active highlight classes
    document.querySelectorAll('.tour-highlight-active').forEach(el => {
        el.classList.remove(
            'tour-highlight-active',
            'relative',
            'z-[450]'
        );
    });
};

/**
 * Renders help trigger float button
 */
export const initHelpWidget = (path) => {
    // Always remove existing launcher as the button is now suppressed
    const existing = document.getElementById('floating-tour-launcher');
    if (existing) existing.remove();
    return;
};
