// Migration script: transfers hardcoded project data into YOUR Supabase account
// Run with: node supabase/migrate.js
// 
// This script:
// 1. Checks if tables exist (creates them if not - optional)
// 2. Inserts all projects linked to YOUR user UUID
// 3. Uses upsert logic to avoid duplicates
// 4. Reports detailed progress and errors

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Read .env manually
const envPath = resolve(__dirname, '../.env')
let envContent
try {
  envContent = readFileSync(envPath, 'utf-8')
} catch (err) {
  console.error('❌ Cannot read .env file:', err.message)
  console.error('Make sure .env exists in the project root with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const env = {}
envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) env[key.trim()] = rest.join('=').trim()
})

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

// YOUR UUID - all projects will be owned by you
const OWNER_UUID = 'bff69471-dca3-41cf-ac3d-4124053c940a'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Hardcoded project data (from src/stores/data/projects.js) ──────────────
const projectsData = [
  {
    id: 'p1', type: 'active', size: 'card-lg', year: 2025,
    status_tag: 'status.pnab',
    title: 'PRATA CULT',
    description: 'Profissionalização de jovens (18-29 anos) em música e audiovisual.',
    territory: 'Brasil', axis: ['Arte', 'Tecnologia'],
    kpi_label: 'labels.estimatedImpact', kpi_value: null, kpi_detail: '1 Álbum / 10 Docs / 1 Festival',
    meta: [
      { labelKey: 'project.partners', value: 'SOS Águas da Prata, Mídia Ninja' },
      { labelKey: 'project.role', value: 'RCC Escrita técnica & Coordenação' }
    ],
    category: 'culture', parent_id: null, connection_type: null
  },
  {
    id: 'p2', type: 'active', size: 'card-md', year: 2024,
    status_tag: 'status.cultsp',
    title: 'OFICINAS SEMANAIS',
    description: 'Workshops gratuitos: Música, Audiovisual, Agroecologia e Gestão de Projetos na SOS Águas da Prata.',
    territory: 'Brasil', axis: ['Arte', 'Água', 'Tecnologia'],
    kpi_label: 'labels.formation', kpi_value: null, kpi_detail: 'Base da Banda Impermanente',
    meta: [
      { labelKey: 'project.award', value: 'Prêmio 11 anos - Gov. SP' },
      { labelKey: 'project.origin', value: 'Prêmio CultSP - 11 anos de atuação' }
    ],
    category: 'culture', parent_id: null, connection_type: null
  },
  {
    id: 'p3', type: 'active', size: 'card-md', year: 2025,
    status_tag: 'status.virada2026',
    title: 'BEE GUARDIANS MELIPONARY',
    description: 'Workshops de meliponicultura (abelhas nativas sem ferrão) com escolas e comunidade.',
    territory: 'Brasil', axis: ['Água'],
    kpi_label: 'labels.biodiversity', kpi_value: null, kpi_detail: 'Abelhas Nativas Sem Ferrão',
    meta: [
      { labelKey: 'project.location', value: 'SOS - Horta Parque' },
      { labelKey: 'project.type', value: 'Educação Ambiental' }
    ],
    category: 'environmental', parent_id: null, connection_type: 'connections.subProject'
  },
  {
    id: 'p4', type: 'active', size: 'card-md', year: 2025,
    status_tag: 'status.virada2026',
    title: 'JARDIM MEDICINAL',
    description: 'Horta comunitária, atividades escolares, preservação de árvores nativas e frutíferas.',
    territory: 'Brasil', axis: ['Água'],
    kpi_label: 'labels.saf', kpi_value: null, kpi_detail: null,
    meta: [
      { labelKey: 'project.location', value: 'SOS - Horta Parque' },
      { labelKey: 'project.connection', value: 'Meliponário' }
    ],
    category: 'environmental', parent_id: null, connection_type: 'connections.subProject'
  },
  {
    id: 'p4b', type: 'active', size: 'card-sm', year: 2027,
    status_tag: 'status.virada2027',
    title: 'VIRADA CLIMÁTICA 2027',
    description: '4ª Edição - Celebração de 13 Anos de EG South America: 12 dias de atividades socioambientais.',
    territory: 'Brasil', axis: ['Arte', 'Direitos'],
    kpi_label: 'labels.duration', kpi_value: null, kpi_detail: 'Janeiro-Fevereiro 2027',
    meta: [
      { labelKey: 'project.edition', value: '4ª Edição' },
      { labelKey: 'project.type', value: 'Celebração & Rede' }
    ],
    category: 'climate', parent_id: null, connection_type: null
  },
  {
    id: 'p4c', type: 'active', size: 'card-lg', year: 2025,
    status_tag: 'status.active',
    title: 'EARTH DOC',
    description: 'Cobertura completa documental de todo o trabalho EG South America. COP30, Virada Climática, Vulcan Festival.',
    territory: 'Brasil', axis: ['Arte', 'Direitos'],
    kpi_label: 'labels.format', kpi_value: null, kpi_detail: 'Documentário, Fotos, Textos',
    meta: [
      { labelKey: 'project.focus', value: 'COP30 + Virada Climática + Vulcan Festival' },
      { labelKey: 'project.format', value: 'Documentário, Fotos, Textos' }
    ],
    category: 'climate', parent_id: null, connection_type: null
  },
  {
    id: 'p5', type: 'pipeline', size: 'card-lg', year: 2027,
    status_tag: 'status.submission',
    title: 'VULCAN OBSERVATORY',
    description: 'Pesquisa em zonas de sacrifício e impacto da mineração de Terras Raras. Segurança, Defesa e Restauração.',
    territory: 'Brasil', axis: ['Água', 'Direitos'],
    kpi_label: 'labels.territorialDefense', kpi_value: null, kpi_detail: 'Áreas de Terras Raras',
    meta: [
      { labelKey: 'project.status', value: 'Mapeamento Sul/Centro América' },
      { labelKey: 'project.scope', value: 'Segurança, Defesa, Restauração' }
    ],
    category: 'climate', parent_id: null, connection_type: null
  },
  {
    id: 'p6', type: 'pipeline', size: 'card-md', year: 2026,
    status_tag: 'status.submission',
    title: 'MONITORAMENTO CORPOS D\'ÁGUA',
    description: 'Advocacy e pesquisa contínua de corpos d\'água, flora e fauna.',
    territory: 'Brasil', axis: ['Água'],
    kpi_label: null, kpi_value: null, kpi_detail: null,
    meta: [
      { labelKey: 'project.type', value: 'Pesquisa & Advocacy' },
      { labelKey: 'project.connection', value: 'Vulcan Observatory' }
    ],
    category: 'environmental', parent_id: null, connection_type: 'connections.research'
  },
  {
    id: 'p7', type: 'pipeline', size: 'card-sm', year: 2026,
    status_tag: 'status.submission',
    title: 'KIT AMIGXS DA ÁGUA',
    description: 'Análise e controle de pH e qualidade da água com kits caseiros e acessíveis.',
    territory: 'Brasil', axis: ['Água', 'Tecnologia'],
    kpi_label: null, kpi_value: null, kpi_detail: null,
    meta: [
      { labelKey: 'project.origin', value: 'Escola São Roque' },
      { labelKey: 'project.production', value: 'SOS Águas da Prata' }
    ],
    category: 'environmental', parent_id: null, connection_type: 'connections.tool'
  },
  {
    id: 'p8', type: 'pipeline', size: 'card-sm', year: 2027,
    status_tag: 'status.submission',
    title: 'MAPEAMENTO ZONAS DE SACRIFÍCIO',
    description: 'Mapeamento inicial de comunidades vulneráveis na América do Sul e Central.',
    territory: 'Brasil', axis: ['Direitos'],
    kpi_label: null, kpi_value: null, kpi_detail: null,
    meta: [
      { labelKey: 'project.scope', value: 'Sul/Centro América' },
      { labelKey: 'project.connection', value: 'Vulcan Observatory' }
    ],
    category: 'climate', parent_id: null, connection_type: 'connections.mapping'
  },
  {
    id: 'p9', type: 'pipeline', size: 'card-sm', year: 2027,
    status_tag: 'status.submission',
    title: 'SEGURANÇA RADIOLÓGICA E ALIMENTAR',
    description: 'Áreas estratégicas de foco do observatório - radiologia e segurança alimentar.',
    territory: 'Brasil', axis: ['Água', 'Direitos'],
    kpi_label: null, kpi_value: null, kpi_detail: null,
    meta: [
      { labelKey: 'project.focus', value: 'Radiologia & Alimentos' },
      { labelKey: 'project.connection', value: 'Vulcan Observatory' }
    ],
    category: 'climate', parent_id: null, connection_type: 'connections.focusArea'
  },
  {
    id: 'p10', type: 'pipeline', size: 'card-md', year: 2026,
    status_tag: 'status.writing',
    title: 'ECOTRACK MAPBIOMAS',
    description: 'Ferramentas geohidrográficas para catalogação comunitária de nascentes e monitoramento de bacias.',
    territory: 'Brasil', axis: ['Água', 'Tecnologia'],
    kpi_label: 'labels.grantPhase', kpi_value: null, kpi_detail: null,
    meta: [
      { labelKey: 'project.type', value: 'MapBiomas + Geohidrografia' },
      { labelKey: 'project.scope', value: 'Nascentes & Bacias' }
    ],
    category: 'environmental', parent_id: null, connection_type: 'connections.tracking'
  },
  {
    id: 'p14', type: 'done', size: 'card-lg', year: 2016,
    status_tag: 'status.historic',
    title: 'XÔ MINERADORAS',
    description: 'Movimento comunitário contra mineração de bauxita que ameaçava fontes de água. Base para Vulcan Observatory.',
    territory: 'Brasil', axis: ['Água', 'Direitos'],
    kpi_label: 'labels.communityVictory', kpi_value: null, kpi_detail: 'Concurso Curta Prata 2016',
    meta: [
      { labelKey: 'project.legacy', value: 'Videoclipe "A Mensagem da Onça"' },
      { labelKey: 'project.sponsorship', value: 'Banco do Brasil' }
    ],
    category: 'climate', parent_id: null, connection_type: null
  },
  {
    id: 'p14b', type: 'done', size: 'card-sm', year: 2016,
    status_tag: 'status.award',
    title: 'A MENSAGEM DA ONÇA',
    description: 'Videoclipe expondo a crise climática e vozes jovens emergentes. Vencedor do Concurso Curta Prata 2016.',
    territory: 'Brasil', axis: ['Arte'],
    kpi_label: 'labels.award', kpi_value: null, kpi_detail: 'Concurso Curta Prata 2016',
    meta: [
      { labelKey: 'project.sponsorship', value: 'Banco do Brasil' },
      { labelKey: 'project.connection', value: 'Xô Mineradoras' }
    ],
    category: 'culture', parent_id: null, connection_type: 'connections.culturalProduction'
  },
  {
    id: 'p15', type: 'done', size: 'card-sm', year: 2025,
    status_tag: 'status.exchange',
    title: 'VULCAN FESTIVAL',
    description: 'Visibilidade internacional e fortalecimento de rede de advocacy via Mídia Ninja.',
    territory: 'Brasil', axis: ['Arte', 'Direitos'],
    kpi_label: null, kpi_value: null, kpi_detail: null,
    meta: [
      { labelKey: 'project.scope', value: 'Global Network' },
      { labelKey: 'project.connection', value: 'Vulcan Observatory' }
    ],
    category: 'climate', parent_id: null, connection_type: 'connections.relatedEvent'
  },
  {
    id: 'p16', type: 'done', size: 'card-md', year: 2025,
    status_tag: 'status.partnership',
    title: 'TRILHANDO CAMINHOS',
    description: 'Gestão administrativa rural, ervas e direitos sociais para mulheres na comunidade Cascata.',
    territory: 'Brasil', axis: ['Direitos', 'Água'],
    kpi_label: 'labels.empowerment', kpi_value: null, kpi_detail: null,
    meta: [
      { labelKey: 'project.partners', value: 'Instituto Federal do Brasil' },
      { labelKey: 'project.role', value: 'Isadora (EG Poços de Caldas)' }
    ],
    category: 'rights', parent_id: null, connection_type: null
  },
  {
    id: 'p16b', type: 'done', size: 'card-sm', year: 2025,
    status_tag: 'status.advisor',
    title: 'NANCI FERREIRA',
    description: 'Facilitadora idosa e ponte comunitária. Conselheira de Saberes do projeto EG Cascata.',
    territory: 'Brasil', axis: ['Direitos'],
    kpi_label: 'labels.communityConnection', kpi_value: null, kpi_detail: null,
    meta: [
      { labelKey: 'project.role', value: 'Conselheira de Saberes' },
      { labelKey: 'project.connection', value: 'EG Cascata' }
    ],
    category: 'rights', parent_id: null, connection_type: 'connections.facilitator'
  },
  {
    id: 'p17', type: 'done', size: 'card-md', year: 2024,
    status_tag: 'status.partnership',
    title: 'BAQUE MULHER',
    description: 'Movimento de empoderamento feminino através do maracatu. Apresentações em eventos culturais.',
    territory: 'Brasil', axis: ['Arte', 'Direitos'],
    kpi_label: 'labels.livingCulture', kpi_value: null, kpi_detail: null,
    meta: [
      { labelKey: 'project.type', value: 'Somente mulheres' },
      { labelKey: 'project.connection', value: 'Parceiro em eventos' }
    ],
    category: 'culture', parent_id: null, connection_type: null
  },
  {
    id: 'p18', type: 'active', size: 'card-lg', year: 2025,
    status_tag: 'status.virada2026',
    title: 'SOS - HORTA PARQUE (SAF)',
    description: 'Sistema agroflorestal como laboratório vivo para projetos de restauração e educação ambiental.',
    territory: 'Brasil', axis: ['Água'],
    kpi_label: 'Projetos Ativos', kpi_value: null, kpi_detail: null,
    meta: [
      { labelKey: 'project.type', value: 'SAF - Sistema Agroflorestal' },
      { labelKey: 'project.status', value: 'Base para projetos em execução' }
    ],
    category: 'restoration', parent_id: null, connection_type: null
  },
  {
    id: 'p19', type: 'done', size: 'card-md', year: 2024,
    status_tag: 'status.creativeEconomy',
    title: 'PRATA PRINT / BHUMISPRINT',
    description: 'Economia criativa: produtos impressos originais (camisetas, canecas) e reuso de materiais.',
    territory: 'Brasil', axis: ['Arte'],
    kpi_label: 'labels.sustainableFashion', kpi_value: null, kpi_detail: 'Camisetas, canecas, reuso',
    meta: [
      { labelKey: 'project.base', value: 'SOS Águas da Prata NGO' },
      { labelKey: 'project.focus', value: 'Redução impacto indústria fashion' }
    ],
    category: 'culture', parent_id: null, connection_type: null
  },
  {
    id: 'p20', type: 'done', size: 'card-sm', year: 2024,
    status_tag: 'status.partnership',
    title: 'SOS - HORTA PARQUE (SAF)',
    description: 'Sistema agroflorestal como laboratório vivo para projetos de restauração e educação ambiental.',
    territory: 'Brasil', axis: ['Arte'],
    kpi_label: null, kpi_value: null, kpi_detail: null,
    meta: [
      { labelKey: 'project.facilitators', value: 'RCC Tupã Levi, Crew Leader Isadora' },
      { labelKey: 'project.type', value: 'Educação Ambiental' }
    ],
    category: 'environmental', parent_id: null, connection_type: 'connections.educational'
  },
  {
    id: 'p21', type: 'done', size: 'card-sm', year: 2019,
    status_tag: 'status.founder',
    title: 'OFICINA DE MÚSICA',
    description: 'Projeto carro-chefe do coletivo - oficinas comunitárias gratuitas. Fundação da Banda Impermanente.',
    territory: 'Brasil', axis: ['Arte'],
    kpi_label: 'labels.founderProject', kpi_value: null, kpi_detail: 'Base da Banda Impermanente',
    meta: [
      { labelKey: 'project.type', value: 'Projeto Formativo' },
      { labelKey: 'project.legacy', value: 'Workshops semanais' }
    ],
    category: 'culture', parent_id: null, connection_type: null
  },
  {
    id: 'p21b', type: 'done', size: 'card-md', year: 2024,
    status_tag: 'status.professional',
    title: 'BANDA IMPERMANENTE',
    description: 'Projeto musical profissional nascido da Oficina de Música. Realiza apresentações e lançamentos.',
    territory: 'Brasil', axis: ['Arte'],
    kpi_label: 'labels.professionalProject', kpi_value: null, kpi_detail: 'Álbuns e Apresentações',
    meta: [
      { labelKey: 'project.origin', value: 'Oficina de Música e Meio Ambiente' },
      { labelKey: 'project.base', value: 'SOS Águas da Prata' }
    ],
    category: 'culture', parent_id: null, connection_type: 'connections.evolution'
  },
  {
    id: 'p22', type: 'done', size: 'card-lg', year: 2025,
    status_tag: 'status.completed',
    title: 'O DESPERTAR DAS MATAS',
    description: 'Circo e teatro com temas socioambientais na escola pública EMEB Áurea Soares.',
    territory: 'Brasil', axis: ['Arte', 'Direitos'],
    kpi_label: 'labels.fullCoverage', kpi_value: null, kpi_detail: 'COP30 + Todos os eventos',
    meta: [
      { labelKey: 'project.events', value: 'Virada Climática, COP30, Vulcan Festival' },
      { labelKey: 'project.format', value: 'Documentário, Fotos, Textos' }
    ],
    category: 'climate', parent_id: null, connection_type: null
  }
]

// ID mapping: old string IDs -> new UUIDs
const idMap = {}

async function checkTablesExist() {
  console.log('\n📋 CHECKING TABLES...')
  
  // Check if projects table exists
  const { data: tables, error } = await supabase
    .from('projects')
    .select('id', { count: 'exact', head: true })
  
  if (error) {
    console.error('❌ Projects table does not exist or RLS blocks access')
    console.error('   Error:', error.message)
    console.error('\n💡 SOLUTION:')
    console.error('   1. Go to Supabase Dashboard > SQL Editor')
    console.error('   2. Run the entire supabase/schema.sql file')
    console.error('   3. Then run this migration again')
    return false
  }
  
  console.log('✅ Projects table exists and accessible')
  return true
}

async function migrate() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('   EARTH GUARDIANS - SUPABASE DATA MIGRATION')
  console.log('═══════════════════════════════════════════════════════════')
  console.log(`\n👤 Owner UUID: ${OWNER_UUID}`)
  console.log(`📦 Projects to migrate: ${projectsData.length}`)
  console.log(`🔗 Supabase URL: ${supabaseUrl}`)

  // Step 1: Check if tables exist
  const tablesExist = await checkTablesExist()
  if (!tablesExist) {
    console.error('\n❌ Migration aborted. Please create tables first.')
    process.exit(1)
  }

  // Step 2: Check for existing data
  console.log('\n🔍 CHECKING EXISTING DATA...')
  const { count: existingCount, error: countError } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', OWNER_UUID)
  
  if (countError) {
    console.warn('⚠️  Could not count existing projects:', countError.message)
  } else if (existingCount > 0) {
    console.log(`⚠️  Found ${existingCount} existing project(s) owned by you`)
    console.log('   These will be SKIPPED (not overwritten)')
  } else {
    console.log('✅ No existing projects found - fresh migration')
  }

  // Step 3: Insert projects
  console.log('\n📥 MIGRATING PROJECTS...')
  
  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  // First pass: insert all projects (without parent_id)
  for (const p of projectsData) {
    const payload = {
      title: p.title,
      description: p.description,
      status: p.type,
      status_tag: p.status_tag,
      privacy: 'public',
      size: p.size,
      territory: p.territory,
      axis: p.axis || [],
      category: p.category,
      year: p.year,
      kpi_label: p.kpi_label,
      kpi_value: p.kpi_value,
      kpi_detail: p.kpi_detail,
      meta: p.meta || [],
      links: [],
      connection_type: p.connection_type,
      position_x: 0,
      position_y: 0,
      owner_id: OWNER_UUID  // ← KEY: All projects owned by YOU
    }

    // Check if project with same title already exists for this owner
    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('title', p.title)
      .eq('owner_id', OWNER_UUID)
      .single()
    
    if (existing) {
      console.log(`  ⏭️  SKIP: ${p.id} → ${p.title} (already exists)`)
      idMap[p.id] = existing.id
      skipCount++
      continue
    }

    console.log(`  📝 INSERT: ${p.id} → ${p.title}`)
    const { data, error } = await supabase
      .from('projects')
      .insert(payload)
      .select('id')
      .single()

    if (error) {
      console.error(`  ❌ ERROR inserting ${p.id}:`, error.message)
      errorCount++
      continue
    }

    idMap[p.id] = data.id
    successCount++
    console.log(`     ✅ OK: ${data.id}`)
  }

  // Second pass: update parent_id for child projects
  console.log('\n🔗 LINKING CHILD PROJECTS...')
  const children = projectsData.filter(p => p.parent_id)
  
  for (const p of children) {
    const parentUuid = idMap[p.parent_id]
    if (!parentUuid) {
      console.error(`  ⚠️  No UUID found for parent ${p.parent_id} of ${p.id}`)
      continue
    }

    const childUuid = idMap[p.id]
    if (!childUuid) {
      console.error(`  ⚠️  No UUID found for child ${p.id}`)
      continue
    }

    const { error } = await supabase
      .from('projects')
      .update({ parent_id: parentUuid })
      .eq('id', childUuid)

    if (error) {
      console.error(`  ❌ ERROR linking ${p.id} to parent:`, error.message)
    } else {
      console.log(`  ✅ Linked: ${p.id} → parent: ${p.parent_id}`)
    }
  }

  // Final report
  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('   MIGRATION COMPLETE')
  console.log('═══════════════════════════════════════════════════════════')
  console.log(`\n  ✅ Success: ${successCount} projects inserted`)
  console.log(`  ⏭️  Skipped: ${skipCount} projects (already existed)`)
  console.log(`  ❌ Errors:  ${errorCount} projects failed`)
  console.log(`\n  📊 Total in DB: ${successCount + skipCount} / ${projectsData.length}`)
  
  if (errorCount === 0 && successCount + skipCount === projectsData.length) {
    console.log('\n  🎉 ALL PROJECTS MIGRATED SUCCESSFULLY!')
    console.log('\n  Next steps:')
    console.log('  1. Run: pnpm run dev')
    console.log('  2. Login with your Supabase account')
    console.log('  3. You should see all projects owned by you')
  } else {
    console.log('\n  ⚠️  Migration completed with issues. Check errors above.')
  }
  
  console.log('\n  ID Mapping (for reference):')
  Object.entries(idMap).slice(0, 5).forEach(([old, newId]) => {
    console.log(`    ${old} → ${newId}`)
  })
  if (Object.keys(idMap).length > 5) {
    console.log(`    ... and ${Object.keys(idMap).length - 5} more`)
  }
}

migrate().catch(err => {
  console.error('\n💥 Migration failed catastrophically:', err)
  console.error(err.stack)
  process.exit(1)
})
