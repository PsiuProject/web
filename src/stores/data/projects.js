// Project data for Earth Guardians South America
// Using translation keys for i18n support
// Layout is now automatic - no hardcoded positions

export const projectsData = [
  // ═══════════════════════════════════════════════════════════════════
  // EM EXECUÇÃO - Active Projects (2025-2027)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'p1',
    type: 'active',
    size: 'card-lg',
    year: 2025,
    statusTagKey: 'status.pnab',
    titleKey: 'projects.p1.title',
    descriptionKey: 'projects.p1.description',
    territory: 'Brasil',
    axis: ['Arte', 'Tecnologia'],
    kpiLabelKey: 'labels.estimatedImpact',
    kpiValue: '28.000 PESSOAS',
    kpiDetail: '1 Álbum / 10 Docs / 1 Festival',
    meta: [
      { labelKey: 'project.partners', value: 'SOS Águas da Prata, Mídia Ninja' },
      { labelKey: 'project.role', value: 'RCC Escrita técnica & Coordenação' }
    ],
    category: 'culture'
  },
  {
    id: 'p2',
    type: 'active',
    size: 'card-md',
    year: 2024,
    statusTagKey: 'status.cultsp',
    titleKey: 'projects.p2.title',
    descriptionKey: 'projects.p2.description',
    territory: 'Brasil',
    axis: ['Arte', 'Água', 'Tecnologia'],
    kpiLabelKey: 'labels.formation',
    kpiValue: 'COMUNIDADE',
    kpiDetail: 'Base da Banda Impermanente',
    meta: [
      { labelKey: 'project.award', value: 'Prêmio 11 anos - Gov. SP' },
      { labelKey: 'project.origin', value: 'projects.p2.origin' }
    ],
    category: 'culture'
  },
  {
    id: 'p3',
    type: 'active',
    size: 'card-md',
    year: 2025,
    statusTagKey: 'status.egGrants',
    titleKey: 'projects.p3.title',
    descriptionKey: 'projects.p3.description',
    territory: 'Brasil',
    axis: ['Água'],
    kpiLabelKey: null,
    kpiValue: 'BIODIVERSIDADE',
    kpiDetail: 'Abelhas Nativas Sem Ferrão',
    meta: [
      { labelKey: 'project.location', value: 'SOS - Horta Parque' },
      { labelKey: 'project.type', value: 'Educação Ambiental' }
    ],
    parentId: 'p20',
    connectionTypeKey: 'connections.subProject',
    category: 'environmental'
  },
  {
    id: 'p4',
    type: 'active',
    size: 'card-md',
    year: 2025,
    statusTagKey: 'status.egGrants',
    titleKey: 'projects.p4.title',
    descriptionKey: 'projects.p4.description',
    territory: 'Brasil',
    axis: ['Água'],
    kpiLabelKey: null,
    kpiValue: 'SAF VIVO',
    kpiDetail: null,
    meta: [
      { labelKey: 'project.location', value: 'SOS - Horta Parque' },
      { labelKey: 'project.connection', value: 'Meliponário' }
    ],
    parentId: 'p20',
    connectionTypeKey: 'connections.subProject',
    category: 'environmental'
  },
  {
    id: 'p4b',
    type: 'active',
    size: 'card-sm',
    year: 2027,
    statusTagKey: 'status.virada2027',
    titleKey: 'projects.p4b.title',
    descriptionKey: 'projects.p4b.description',
    territory: 'Brasil',
    axis: ['Arte', 'Direitos'],
    kpiLabelKey: 'labels.duration',
    kpiValue: '12 DIAS',
    kpiDetail: 'Janeiro-Fevereiro 2027',
    meta: [
      { labelKey: 'project.edition', value: '4ª Edição' },
      { labelKey: 'project.type', value: 'Celebração & Rede' }
    ],
    category: 'climate'
  },
  {
    id: 'p4c',
    type: 'active',
    size: 'card-md',
    year: 2025,
    statusTagKey: 'status.completed',
    titleKey: 'projects.p4c.title',
    descriptionKey: 'projects.p4c.description',
    territory: 'Brasil',
    axis: ['Arte', 'Direitos'],
    kpiLabelKey: null,
    kpiValue: 'COBERTURA CONCLUÍDA',
    kpiDetail: 'Novembro 2025',
    meta: [
      { labelKey: 'project.focus', value: 'Justiça Climática' },
      { labelKey: 'project.network', value: 'Youth Climate Network' }
    ],
    category: 'climate'
  },

  // ═══════════════════════════════════════════════════════════════════
  // PIPELINE / WRITING - Future Projects
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'p5',
    type: 'pipeline',
    size: 'card-lg',
    year: 2027,
    statusTagKey: 'status.submission',
    titleKey: 'projects.p5.title',
    descriptionKey: 'projects.p5.description',
    territory: 'Brasil',
    axis: ['Água', 'Direitos'],
    kpiLabelKey: null,
    kpiValue: 'DEFESA TERRITORIAL',
    kpiDetail: 'Áreas de Terras Raras',
    meta: [
      { labelKey: 'project.status', value: 'projects.p5.meta.status' },
      { labelKey: 'project.scope', value: 'projects.p5.meta.pillars' }
    ],
    category: 'climate'
  },
  {
    id: 'p6',
    type: 'pipeline',
    size: 'card-md',
    year: 2026,
    statusTagKey: 'status.submission',
    titleKey: 'projects.p6.title',
    descriptionKey: 'projects.p6.description',
    territory: 'Brasil',
    axis: ['Água'],
    kpiLabelKey: null,
    kpiValue: null,
    kpiDetail: null,
    meta: [
      { labelKey: 'project.type', value: 'Pesquisa & Advocacy' },
      { labelKey: 'project.connection', value: 'Vulcan Observatory' }
    ],
    parentId: 'p5',
    connectionTypeKey: 'connections.research',
    category: 'environmental'
  },
  {
    id: 'p7',
    type: 'pipeline',
    size: 'card-sm',
    year: 2026,
    statusTagKey: 'status.submission',
    titleKey: 'projects.p7.title',
    descriptionKey: 'projects.p7.description',
    territory: 'Brasil',
    axis: ['Água', 'Tecnologia'],
    kpiLabelKey: null,
    kpiValue: null,
    kpiDetail: null,
    meta: [
      { labelKey: 'project.origin', value: 'Escola São Roque' },
      { labelKey: 'project.production', value: 'SOS Águas da Prata' }
    ],
    parentId: 'p5',
    connectionTypeKey: 'connections.tool',
    category: 'environmental'
  },
  {
    id: 'p8',
    type: 'pipeline',
    size: 'card-sm',
    year: 2027,
    statusTagKey: 'status.submission',
    titleKey: 'projects.p8.title',
    descriptionKey: 'projects.p8.description',
    territory: 'Brasil',
    axis: ['Direitos'],
    kpiLabelKey: null,
    kpiValue: null,
    kpiDetail: null,
    meta: [
      { labelKey: 'project.scope', value: 'Sul/Centro América' },
      { labelKey: 'project.connection', value: 'Vulcan Observatory' }
    ],
    parentId: 'p5',
    connectionTypeKey: 'connections.mapping',
    category: 'climate'
  },
  {
    id: 'p9',
    type: 'pipeline',
    size: 'card-sm',
    year: 2027,
    statusTagKey: 'status.submission',
    titleKey: 'projects.p9.title',
    descriptionKey: 'projects.p9.description',
    territory: 'Brasil',
    axis: ['Água', 'Direitos'],
    kpiLabelKey: null,
    kpiValue: null,
    kpiDetail: null,
    meta: [
      { labelKey: 'project.focus', value: 'Radiologia & Alimentos' },
      { labelKey: 'project.connection', value: 'Vulcan Observatory' }
    ],
    parentId: 'p5',
    connectionTypeKey: 'connections.focusArea',
    category: 'climate'
  },
  {
    id: 'p10',
    type: 'pipeline',
    size: 'card-md',
    year: 2026,
    statusTagKey: 'status.writing',
    titleKey: 'projects.p10.title',
    descriptionKey: 'projects.p10.description',
    territory: 'Brasil',
    axis: ['Água', 'Tecnologia'],
    kpiLabelKey: null,
    kpiValue: 'GRANT PHASE',
    kpiDetail: null,
    meta: [
      { labelKey: 'project.type', value: 'MapBiomas + Geohidrografia' },
      { labelKey: 'project.scope', value: 'Nascentes & Bacias' }
    ],
    parentId: 'p5',
    connectionTypeKey: 'connections.tracking',
    category: 'environmental'
  },
  {
    id: 'p11',
    type: 'pipeline',
    size: 'card-lg',
    year: 2027,
    statusTagKey: 'status.largeScale',
    titleKey: 'projects.p11.title',
    descriptionKey: 'projects.p11.description',
    territory: 'Brasil',
    axis: ['Arte', 'Água'],
    kpiLabelKey: null,
    kpiValue: 'LARGE GLOBAL PROJECT',
    kpiDetail: null,
    meta: [
      { labelKey: 'project.scope', value: 'Internacional' },
      { labelKey: 'project.role', value: 'Suporte Estratégico' }
    ],
    category: 'culture'
  },
  {
    id: 'p11b',
    type: 'pipeline',
    size: 'card-sm',
    year: 2027,
    statusTagKey: 'status.writing',
    titleKey: 'projects.p11b.title',
    descriptionKey: 'projects.p11b.description',
    territory: 'Brasil',
    axis: ['Tecnologia', 'Direitos'],
    kpiLabelKey: null,
    kpiValue: 'TERRAS RARAS',
    kpiDetail: 'Área mais visada do Brasil',
    meta: [
      { labelKey: 'project.production', value: 'Estúdios SOS Águas da Prata' },
      { labelKey: 'project.connection', value: 'Vulcan Observatory' }
    ],
    parentId: 'p5',
    connectionTypeKey: 'connections.research',
    category: 'climate'
  },

  // ═══════════════════════════════════════════════════════════════════
  // CONCLUÍDOS - Completed Projects (2024-2025)
  // ═══════════════════════════════════════════════════════════════════
  {
    id: 'p12',
    type: 'done',
    size: 'card-lg',
    year: 2025,
    statusTagKey: 'status.completed',
    titleKey: 'projects.p12.title',
    descriptionKey: 'projects.p12.description',
    territory: 'Brasil',
    axis: ['Arte', 'Direitos'],
    kpiLabelKey: 'project.partners',
    kpiValue: 'REDE GLOBAL',
    kpiDetail: 'Alana Institute, Our Kids Climate, GREENPEACE, 350.org',
    meta: [
      { labelKey: 'project.edition', value: '1ª, 2ª e 3ª Edições' },
      { labelKey: 'project.status', value: 'Concluídas com sucesso' },
      { labelKey: 'project.facilitators', value: 'BhumisparshaSchool, Mídia Ninja' }
    ],
    category: 'climate'
  },
  {
    id: 'p13',
    type: 'done',
    size: 'card-md',
    year: 2024,
    statusTagKey: 'status.completed',
    titleKey: 'projects.p13.title',
    descriptionKey: 'projects.p13.description',
    territory: 'Brasil',
    axis: ['Água'],
    kpiLabelKey: 'labels.target',
    kpiValue: '7.000 ÁRVORES',
    kpiDetail: 'Concursos ambientais, audiovisuais e sociais',
    meta: [
      { labelKey: 'project.period', value: '2021-2024' },
      { labelKey: 'project.result', value: 'Restauração Ecossistemas Locais' }
    ],
    category: 'restoration'
  },
  {
    id: 'p14',
    type: 'done',
    size: 'card-lg',
    year: 2016,
    statusTagKey: 'status.historic',
    titleKey: 'projects.p14.title',
    descriptionKey: 'projects.p14.description',
    territory: 'Brasil',
    axis: ['Água', 'Direitos'],
    kpiLabelKey: 'labels.award',
    kpiValue: 'VITÓRIA COMUNITÁRIA',
    kpiDetail: 'Concurso Curta Prata 2016',
    meta: [
      { labelKey: 'project.legacy', value: 'Videoclipe "A Mensagem da Onça"' },
      { labelKey: 'project.sponsorship', value: 'Banco do Brasil' }
    ],
    category: 'climate'
  },
  {
    id: 'p14b',
    type: 'done',
    size: 'card-sm',
    year: 2016,
    statusTagKey: 'status.award',
    titleKey: 'projects.p14b.title',
    descriptionKey: 'projects.p14b.description',
    territory: 'Brasil',
    axis: ['Arte'],
    kpiLabelKey: null,
    kpiValue: 'PRÊMIO',
    kpiDetail: 'Concurso Curta Prata 2016',
    meta: [
      { labelKey: 'project.sponsorship', value: 'Banco do Brasil' },
      { labelKey: 'project.connection', value: 'Xô Mineradoras' }
    ],
    parentId: 'p14',
    connectionTypeKey: 'connections.culturalProduction',
    category: 'culture'
  },
  {
    id: 'p15',
    type: 'done',
    size: 'card-sm',
    year: 2025,
    statusTagKey: 'status.exchange',
    titleKey: 'projects.p15.title',
    descriptionKey: 'projects.p15.description',
    territory: 'Brasil',
    axis: ['Arte', 'Direitos'],
    kpiLabelKey: null,
    kpiValue: null,
    kpiDetail: null,
    meta: [
      { labelKey: 'project.scope', value: 'Global Network' },
      { labelKey: 'project.connection', value: 'Vulcan Observatory' }
    ],
    parentId: 'p5',
    connectionTypeKey: 'connections.relatedEvent',
    category: 'climate'
  },
  {
    id: 'p16',
    type: 'done',
    size: 'card-md',
    year: 2025,
    statusTagKey: 'status.partnership',
    titleKey: 'projects.p16.title',
    descriptionKey: 'projects.p16.description',
    territory: 'Brasil',
    axis: ['Direitos', 'Água'],
    kpiLabelKey: null,
    kpiValue: 'EMPODERAMENTO',
    kpiDetail: null,
    meta: [
      { labelKey: 'project.partners', value: 'Instituto Federal do Brasil' },
      { labelKey: 'project.role', value: 'Isadora (EG Poços de Caldas)' }
    ],
    category: 'rights'
  },
  {
    id: 'p16b',
    type: 'done',
    size: 'card-sm',
    year: 2025,
    statusTagKey: 'status.advisor',
    titleKey: 'projects.p16b.title',
    descriptionKey: 'projects.p16b.description',
    territory: 'Brasil',
    axis: ['Direitos'],
    kpiLabelKey: null,
    kpiValue: 'CONEXÃO COMUNITÁRIA',
    kpiDetail: null,
    meta: [
      { labelKey: 'project.role', value: 'Conselheira de Saberes' },
      { labelKey: 'project.connection', value: 'EG Cascata' }
    ],
    parentId: 'p16',
    connectionTypeKey: 'connections.facilitator',
    category: 'rights'
  },
  {
    id: 'p17',
    type: 'done',
    size: 'card-md',
    year: 2024,
    statusTagKey: 'status.partnership',
    titleKey: 'projects.p17.title',
    descriptionKey: 'projects.p17.description',
    territory: 'Brasil',
    axis: ['Arte', 'Direitos'],
    kpiLabelKey: null,
    kpiValue: 'CULTURA VIVA',
    kpiDetail: null,
    meta: [
      { labelKey: 'project.type', value: 'Somente mulheres' },
      { labelKey: 'project.connection', value: 'Parceiro em eventos' }
    ],
    category: 'culture'
  },
  {
    id: 'p18',
    type: 'done',
    size: 'card-lg',
    year: 2025,
    statusTagKey: 'status.activeBase',
    titleKey: 'projects.p18.title',
    descriptionKey: 'projects.p18.description',
    territory: 'Brasil',
    axis: ['Água'],
    kpiLabelKey: 'projects.p18.kpiLabel',
    kpiValue: 'JARDIM + MELIPONÁRIO',
    kpiDetail: null,
    meta: [
      { labelKey: 'project.type', value: 'SAF - Sistema Agroflorestal' },
      { labelKey: 'project.status', value: 'Base para projetos em execução' }
    ],
    category: 'restoration'
  },
  {
    id: 'p19',
    type: 'done',
    size: 'card-md',
    year: 2024,
    statusTagKey: 'status.creativeEconomy',
    titleKey: 'projects.p19.title',
    descriptionKey: 'projects.p19.description',
    territory: 'Brasil',
    axis: ['Arte'],
    kpiLabelKey: null,
    kpiValue: 'MODA SUSTENTÁVEL',
    kpiDetail: 'Camisetas, canecas, reuso',
    meta: [
      { labelKey: 'project.base', value: 'SOS Águas da Prata NGO' },
      { labelKey: 'project.focus', value: 'Redução impacto indústria fashion' }
    ],
    category: 'culture'
  },
  {
    id: 'p20',
    type: 'done',
    size: 'card-sm',
    year: 2024,
    statusTagKey: 'status.partnership',
    titleKey: 'projects.p20.title',
    descriptionKey: 'projects.p20.description',
    territory: 'Brasil',
    axis: ['Arte'],
    kpiLabelKey: null,
    kpiValue: null,
    kpiDetail: null,
    meta: [
      { labelKey: 'project.facilitators', value: 'RCC Tupã Levi, Crew Leader Isadora' },
      { labelKey: 'project.type', value: 'Educação Ambiental' }
    ],
    parentId: 'p16',
    connectionTypeKey: 'connections.educational',
    category: 'environmental'
  },
  {
    id: 'p21',
    type: 'done',
    size: 'card-sm',
    year: 2019,
    statusTagKey: 'status.founder',
    titleKey: 'projects.p21.title',
    descriptionKey: 'projects.p21.description',
    territory: 'Brasil',
    axis: ['Arte'],
    kpiLabelKey: null,
    kpiValue: 'PROJETO FUNDADOR',
    kpiDetail: 'Base da Banda Impermanente',
    meta: [
      { labelKey: 'project.type', value: 'Projeto Formativo' },
      { labelKey: 'project.legacy', value: 'Workshops semanais' }
    ],
    category: 'culture'
  },
  {
    id: 'p21b',
    type: 'done',
    size: 'card-md',
    year: 2024,
    statusTagKey: 'status.professional',
    titleKey: 'projects.p21b.title',
    descriptionKey: 'projects.p21b.description',
    territory: 'Brasil',
    axis: ['Arte'],
    kpiLabelKey: null,
    kpiValue: 'PROJETO PROFISSIONAL',
    kpiDetail: 'Álbuns e Apresentações',
    meta: [
      { labelKey: 'project.origin', value: 'Oficina de Música e Meio Ambiente' },
      { labelKey: 'project.base', value: 'SOS Águas da Prata' }
    ],
    parentId: 'p21',
    connectionTypeKey: 'connections.evolution',
    category: 'culture'
  },
  {
    id: 'p22',
    type: 'done',
    size: 'card-lg',
    year: 2025,
    statusTagKey: 'status.completed',
    titleKey: 'projects.p22.title',
    descriptionKey: 'projects.p22.description',
    territory: 'Brasil',
    axis: ['Arte', 'Direitos'],
    kpiLabelKey: null,
    kpiValue: 'COBERTURA COMPLETA',
    kpiDetail: 'COP30 + Todos os eventos',
    meta: [
      { labelKey: 'project.events', value: 'Virada Climática, COP30, Vulcan Festival' },
      { labelKey: 'project.format', value: 'Documentário, Fotos, Textos' }
    ],
    category: 'climate'
  }
]