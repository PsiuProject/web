// Comprehensive Earth Guardians South America Projects Data
// Updated with full project information, relationships, and metadata

export const projectsData = [
  // ============================================
  // ONGOING PROJECTS (Em Execução)
  // ============================================
  
  // Culture & Art - Ongoing
  {
    id: 'banda-impermanente',
    titleKey: 'projects.bandaImpermanente.title',
    descriptionKey: 'projects.bandaImpermanente.description',
    statusTagKey: 'status.active',
    type: 'active',
    size: 'card-lg',
    territory: 'Brasil',
    axis: ['Arte', 'Tecnologia'],
    category: 'culture',
    position: { top: 200, left: 100 },
    kpiLabelKey: 'labels.performances',
    kpiValue: '50+',
    kpiDetail: 'Shows realizados',
    meta: [
      { labelKey: 'labels.location', value: 'Águas da Prata, SP' },
      { labelKey: 'labels.year', value: '2015 - Presente' },
      { labelKey: 'labels.partner', value: 'SOS Águas da Prata' }
    ],
    links: [
      { type: 'website', url: 'https://bhumisparshaschool.org' },
      { type: 'instagram', url: 'https://www.instagram.com/baquemulherpocosdecaldas/' }
    ],
    connectionTypeKey: 'connections.originatesFrom',
    relatedProjects: ['oficina-musica', 'virada-climatica-2026']
  },

  {
    id: 'baque-mulher',
    titleKey: 'projects.baqueMulher.title',
    descriptionKey: 'projects.baqueMulher.description',
    statusTagKey: 'status.active',
    type: 'active',
    size: 'card-md',
    territory: 'Brasil',
    axis: ['Arte', 'Direitos'],
    category: 'culture',
    position: { top: 200, left: 700 },
    kpiLabelKey: 'labels.participants',
    kpiValue: '30+',
    kpiDetail: 'Mulheres empoderadas',
    meta: [
      { labelKey: 'labels.location', value: 'Poços de Caldas, MG' },
      { labelKey: 'labels.year', value: '2018 - Presente' },
      { labelKey: 'labels.focus', value: 'Empoderamento Feminino' }
    ],
    links: [
      { type: 'instagram', url: 'https://www.instagram.com/baquemulherpocosdecaldas/' }
    ],
    relatedProjects: ['virada-climatica-2026']
  },

  {
    id: 'prata-print',
    titleKey: 'projects.prataPrint.title',
    descriptionKey: 'projects.prataPrint.description',
    statusTagKey: 'status.active',
    type: 'active',
    size: 'card-md',
    territory: 'Brasil',
    axis: ['Arte', 'Tecnologia'],
    category: 'culture',
    position: { top: 200, left: 1300 },
    kpiLabelKey: 'labels.products',
    kpiValue: '200+',
    kpiDetail: 'Peças produzidas',
    meta: [
      { labelKey: 'labels.location', value: 'SOS Águas da Prata' },
      { labelKey: 'labels.year', value: '2020 - Presente' },
      { labelKey: 'labels.focus', value: 'Economia Criativa' }
    ],
    relatedProjects: ['horta-parque']
  },

  // Environmental Education - Ongoing
  {
    id: 'meliponario',
    titleKey: 'projects.meliponario.title',
    descriptionKey: 'projects.meliponario.description',
    statusTagKey: 'status.active',
    type: 'active',
    size: 'card-lg',
    territory: 'Brasil',
    axis: ['Água', 'Tecnologia'],
    category: 'environmental',
    position: { top: 900, left: 100 },
    kpiLabelKey: 'labels.workshops',
    kpiValue: '15+',
    kpiDetail: 'Oficinas realizadas',
    meta: [
      { labelKey: 'labels.location', value: 'SOS Horta Parque' },
      { labelKey: 'labels.year', value: '2023 - Presente' },
      { labelKey: 'labels.grant', value: 'EG Grants' }
    ],
    parentId: 'horta-parque',
    connectionTypeKey: 'connections.partOf',
    relatedProjects: ['jardim-medicinal', 'horta-parque']
  },

  {
    id: 'jardim-medicinal',
    titleKey: 'projects.jardimMedicinal.title',
    descriptionKey: 'projects.jardimMedicinal.description',
    statusTagKey: 'status.active',
    type: 'active',
    size: 'card-md',
    territory: 'Brasil',
    axis: ['Água'],
    category: 'environmental',
    position: { top: 900, left: 700 },
    kpiLabelKey: 'labels.species',
    kpiValue: '40+',
    kpiDetail: 'Espécies medicinais',
    meta: [
      { labelKey: 'labels.location', value: 'SOS Horta Parque' },
      { labelKey: 'labels.year', value: '2023 - Presente' },
      { labelKey: 'labels.grant', value: 'EG Grants' }
    ],
    parentId: 'horta-parque',
    connectionTypeKey: 'connections.partOf',
    relatedProjects: ['meliponario', 'horta-parque']
  },

  {
    id: 'oficina-musica',
    titleKey: 'projects.oficinaMusicaTitle',
    descriptionKey: 'projects.oficinaMusicaDescription',
    statusTagKey: 'status.active',
    type: 'active',
    size: 'card-lg',
    territory: 'Brasil',
    axis: ['Arte', 'Tecnologia'],
    category: 'culture',
    position: { top: 900, left: 1300 },
    kpiLabelKey: 'labels.years',
    kpiValue: '10+',
    kpiDetail: 'Anos de atividade',
    meta: [
      { labelKey: 'labels.location', value: 'SOS Águas da Prata' },
      { labelKey: 'labels.year', value: '2014 - Presente' },
      { labelKey: 'labels.focus', value: 'Música, Audiovisual, Agroecologia' }
    ],
    links: [
      { type: 'website', url: 'https://bhumisparshaschool.org' }
    ],
    relatedProjects: ['banda-impermanente', 'virada-climatica-2026']
  },

  // Climate Justice & Advocacy - Ongoing
  {
    id: 'vulcan-observatory',
    titleKey: 'projects.vulcanObservatory.title',
    descriptionKey: 'projects.vulcanObservatory.description',
    statusTagKey: 'status.active',
    type: 'active',
    size: 'card-lg',
    territory: 'Brasil',
    axis: ['Água', 'Direitos', 'Tecnologia'],
    category: 'climate',
    position: { top: 1600, left: 100 },
    kpiLabelKey: 'labels.monitoring',
    kpiValue: '24/7',
    kpiDetail: 'Monitoramento contínuo',
    meta: [
      { labelKey: 'labels.location', value: 'América do Sul' },
      { labelKey: 'labels.year', value: '2025 - Presente' },
      { labelKey: 'labels.focus', value: 'Segurança e Defesa' }
    ],
    links: [
      { type: 'website', url: 'https://technosutra.bhumisparshaschool.org/' }
    ],
    relatedProjects: ['kit-amigos-agua', 'xo-mineradoras', 'prata-ativa']
  },

  {
    id: 'techno-sutra',
    titleKey: 'projects.technoSutra.title',
    descriptionKey: 'projects.technoSutra.description',
    statusTagKey: 'status.active',
    type: 'active',
    size: 'card-md',
    territory: 'Brasil',
    axis: ['Tecnologia', 'Arte'],
    category: 'climate',
    position: { top: 1600, left: 700 },
    kpiLabelKey: 'labels.reach',
    kpiValue: 'Global',
    kpiDetail: 'Alcance digital',
    meta: [
      { labelKey: 'labels.location', value: 'Serra da Mantiqueira' },
      { labelKey: 'labels.year', value: '2025' },
      { labelKey: 'labels.type', value: 'Peregrinação Digital' }
    ],
    links: [
      { type: 'website', url: 'https://technosutra.bhumisparshaschool.org/' }
    ],
    parentId: 'vulcan-observatory',
    connectionTypeKey: 'connections.partOf',
    relatedProjects: ['vulcan-observatory']
  },

  // Restoration - Ongoing
  {
    id: 'horta-parque',
    titleKey: 'projects.hortaParque.title',
    descriptionKey: 'projects.hortaParque.description',
    statusTagKey: 'status.active',
    type: 'active',
    size: 'card-lg',
    territory: 'Brasil',
    axis: ['Água', 'Tecnologia'],
    category: 'restoration',
    position: { top: 2300, left: 100 },
    kpiLabelKey: 'labels.area',
    kpiValue: '2000m²',
    kpiDetail: 'Sistema Agroflorestal',
    meta: [
      { labelKey: 'labels.location', value: 'SOS Águas da Prata' },
      { labelKey: 'labels.year', value: '2020 - Presente' },
      { labelKey: 'labels.type', value: 'SAF - Living Lab' }
    ],
    links: [
      { type: 'website', url: 'https://aguasdapratasos.wixstudio.com/2025' }
    ],
    relatedProjects: ['meliponario', 'jardim-medicinal', 'projeto-7k']
  },

  {
    id: 'kit-amigos-agua',
    titleKey: 'projects.kitAmigosAgua.title',
    descriptionKey: 'projects.kitAmigosAgua.description',
    statusTagKey: 'status.active',
    type: 'active',
    size: 'card-md',
    territory: 'Brasil',
    axis: ['Água', 'Tecnologia'],
    category: 'environmental',
    position: { top: 2300, left: 700 },
    kpiLabelKey: 'labels.kits',
    kpiValue: '50+',
    kpiDetail: 'Kits distribuídos',
    meta: [
      { labelKey: 'labels.location', value: 'São Roque / Águas da Prata' },
      { labelKey: 'labels.year', value: '2024 - Presente' },
      { labelKey: 'labels.focus', value: 'Análise de Qualidade da Água' }
    ],
    relatedProjects: ['vulcan-observatory', 'horta-parque']
  },

  // ============================================
  // PIPELINE / BEING WRITTEN (Pipeline/Escrita)
  // ============================================

  {
    id: 'virada-climatica-2026',
    titleKey: 'projects.viradaClimatica2026.title',
    descriptionKey: 'projects.viradaClimatica2026.description',
    statusTagKey: 'status.pipeline',
    type: 'pipeline',
    size: 'card-lg',
    territory: 'Brasil',
    axis: ['Arte', 'Direitos', 'Tecnologia'],
    category: 'climate',
    position: { top: 3000, left: 100 },
    kpiLabelKey: 'labels.duration',
    kpiValue: '12 dias',
    kpiDetail: 'Jan-Fev 2026',
    meta: [
      { labelKey: 'labels.location', value: 'Águas da Prata, SP' },
      { labelKey: 'labels.year', value: '2026' },
      { labelKey: 'labels.milestone', value: '12 Anos EG Sul' }
    ],
    links: [
      { type: 'website', url: 'https://bhumisparshaschool.org/virada-climatica' }
    ],
    relatedProjects: ['banda-impermanente', 'baque-mulher', 'oficina-musica']
  },

  {
    id: 'prata-ativa',
    titleKey: 'projects.prataAtiva.title',
    descriptionKey: 'projects.prataAtiva.description',
    statusTagKey: 'status.pipeline',
    type: 'pipeline',
    size: 'card-md',
    territory: 'Brasil',
    axis: ['Tecnologia', 'Direitos'],
    category: 'climate',
    position: { top: 3000, left: 700 },
    kpiLabelKey: 'labels.type',
    kpiValue: 'Documentário',
    kpiDetail: 'Produção audiovisual',
    meta: [
      { labelKey: 'labels.location', value: 'Águas da Prata, SP' },
      { labelKey: 'labels.year', value: '2025' },
      { labelKey: 'labels.focus', value: 'Radiologia e Socioambiental' }
    ],
    relatedProjects: ['vulcan-observatory', 'xo-mineradoras']
  },

  {
    id: 'trilhando-caminhos',
    titleKey: 'projects.trilhandoCaminhos.title',
    descriptionKey: 'projects.trilhandoCaminhos.description',
    statusTagKey: 'status.pipeline',
    type: 'pipeline',
    size: 'card-md',
    territory: 'Brasil',
    axis: ['Direitos', 'Água'],
    category: 'rights',
    position: { top: 3000, left: 1300 },
    kpiLabelKey: 'labels.participants',
    kpiValue: '25+',
    kpiDetail: 'Mulheres atendidas',
    meta: [
      { labelKey: 'labels.location', value: 'Cascata, Poços de Caldas' },
      { labelKey: 'labels.year', value: '2024 - 2025' },
      { labelKey: 'labels.partner', value: 'Instituto Federal' }
    ],
    relatedProjects: []
  },

  // ============================================
  // COMPLETED PROJECTS (Concluídos)
  // ============================================

  {
    id: 'projeto-7k',
    titleKey: 'projects.projeto7k.title',
    descriptionKey: 'projects.projeto7k.description',
    statusTagKey: 'status.done',
    type: 'done',
    size: 'card-lg',
    territory: 'Brasil',
    axis: ['Água'],
    category: 'restoration',
    position: { top: 3700, left: 100 },
    kpiLabelKey: 'labels.trees',
    kpiValue: '7.000+',
    kpiDetail: 'Árvores plantadas',
    meta: [
      { labelKey: 'labels.location', value: 'SOS Águas da Prata' },
      { labelKey: 'labels.year', value: '2021 - 2023' },
      { labelKey: 'labels.milestone', value: '7 Anos EG Brasil' }
    ],
    relatedProjects: ['horta-parque']
  },

  {
    id: 'xo-mineradoras',
    titleKey: 'projects.xoMineradoras.title',
    descriptionKey: 'projects.xoMineradoras.description',
    statusTagKey: 'status.done',
    type: 'done',
    size: 'card-lg',
    territory: 'Brasil',
    axis: ['Água', 'Direitos'],
    category: 'climate',
    position: { top: 3700, left: 700 },
    kpiLabelKey: 'labels.award',
    kpiValue: 'Vencedor',
    kpiDetail: 'Concurso Curta Prata 2016',
    meta: [
      { labelKey: 'labels.location', value: 'Águas da Prata, SP' },
      { labelKey: 'labels.year', value: '2012 - 2014' },
      { labelKey: 'labels.impact', value: 'Movimento Comunitário' }
    ],
    relatedProjects: ['vulcan-observatory', 'prata-ativa']
  },

  {
    id: 'virada-climatica-editions',
    titleKey: 'projects.viradaClimaticaEditions.title',
    descriptionKey: 'projects.viradaClimaticaEditions.description',
    statusTagKey: 'status.done',
    type: 'done',
    size: 'card-md',
    territory: 'Brasil',
    axis: ['Arte', 'Direitos'],
    category: 'climate',
    position: { top: 3700, left: 1300 },
    kpiLabelKey: 'labels.editions',
    kpiValue: '3',
    kpiDetail: 'Edições realizadas',
    meta: [
      { labelKey: 'labels.location', value: 'Águas da Prata, SP' },
      { labelKey: 'labels.year', value: '2018 - 2023' },
      { labelKey: 'labels.partners', value: 'Alana, Greenpeace, 350.org' }
    ],
    links: [
      { type: 'website', url: 'https://bhumisparshaschool.org/virada-climatica' }
    ],
    relatedProjects: ['virada-climatica-2026']
  },

  {
    id: 'despertar-matas',
    titleKey: 'projects.despertarMatas.title',
    descriptionKey: 'projects.despertarMatas.description',
    statusTagKey: 'status.done',
    type: 'done',
    size: 'card-sm',
    territory: 'Brasil',
    axis: ['Arte'],
    category: 'culture',
    position: { top: 3700, left: 1900 },
    kpiLabelKey: 'labels.students',
    kpiValue: '200+',
    kpiDetail: 'Estudantes impactados',
    meta: [
      { labelKey: 'labels.location', value: 'EMEB Áurea Soares' },
      { labelKey: 'labels.year', value: '2022' },
      { labelKey: 'labels.type', value: 'Circo e Teatro' }
    ],
    relatedProjects: []
  },

  {
    id: 'prata-cult',
    titleKey: 'projects.prataCult.title',
    descriptionKey: 'projects.prataCult.description',
    statusTagKey: 'status.done',
    type: 'done',
    size: 'card-sm',
    territory: 'Brasil',
    axis: ['Arte'],
    category: 'culture',
    position: { top: 4400, left: 100 },
    kpiLabelKey: 'labels.events',
    kpiValue: '15+',
    kpiDetail: 'Eventos culturais',
    meta: [
      { labelKey: 'labels.location', value: 'Águas da Prata, SP' },
      { labelKey: 'labels.year', value: '2016 - 2020' },
      { labelKey: 'labels.focus', value: 'Cultura Local' }
    ],
    relatedProjects: []
  }
]
