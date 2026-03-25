// Direct SQL migration - bypasses RLS by using SQL executor
// This inserts data directly without going through RLS policies
// Run with: node supabase/migrate-direct.js

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env')
const envContent = readFileSync(envPath, 'utf-8')

const env = {}
envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) env[key.trim()] = rest.join('=').trim()
})

const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY

// YOUR UUID
const OWNER_UUID = 'bff69471-dca3-41cf-ac3d-4124053c940a'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Projects data
const projectsData = [
  { id: 'p1', type: 'active', size: 'card-lg', year: 2025, status_tag: 'status.pnab', title: 'PRATA CULT', description: 'Profissionalização de jovens (18-29 anos) em música e audiovisual.', territory: 'Brasil', axis: ['Arte', 'Tecnologia'], kpi_label: 'labels.estimatedImpact', kpi_detail: '1 Álbum / 10 Docs / 1 Festival', meta: [{ labelKey: 'project.partners', value: 'SOS Águas da Prata, Mídia Ninja' }, { labelKey: 'project.role', value: 'RCC Escrita técnica & Coordenação' }], category: 'culture' },
  { id: 'p2', type: 'active', size: 'card-md', year: 2024, status_tag: 'status.cultsp', title: 'OFICINAS SEMANAIS', description: 'Workshops gratuitos: Música, Audiovisual, Agroecologia e Gestão de Projetos na SOS Águas da Prata.', territory: 'Brasil', axis: ['Arte', 'Água', 'Tecnologia'], kpi_label: 'labels.formation', kpi_detail: 'Base da Banda Impermanente', meta: [{ labelKey: 'project.award', value: 'Prêmio 11 anos - Gov. SP' }, { labelKey: 'project.origin', value: 'Prêmio CultSP - 11 anos de atuação' }], category: 'culture' },
  { id: 'p3', type: 'active', size: 'card-md', year: 2025, status_tag: 'status.virada2026', title: 'BEE GUARDIANS MELIPONARY', description: 'Workshops de meliponicultura (abelhas nativas sem ferrão) com escolas e comunidade.', territory: 'Brasil', axis: ['Água'], kpi_label: 'labels.biodiversity', kpi_detail: 'Abelhas Nativas Sem Ferrão', meta: [{ labelKey: 'project.location', value: 'SOS - Horta Parque' }, { labelKey: 'project.type', value: 'Educação Ambiental' }], category: 'environmental' },
  { id: 'p4', type: 'active', size: 'card-md', year: 2025, status_tag: 'status.virada2026', title: 'JARDIM MEDICINAL', description: 'Horta comunitária, atividades escolares, preservação de árvores nativas e frutíferas.', territory: 'Brasil', axis: ['Água'], kpi_label: 'labels.saf', meta: [{ labelKey: 'project.location', value: 'SOS - Horta Parque' }, { labelKey: 'project.connection', value: 'Meliponário' }], category: 'environmental' },
  { id: 'p4b', type: 'active', size: 'card-sm', year: 2027, status_tag: 'status.virada2027', title: 'VIRADA CLIMÁTICA 2027', description: '4ª Edição - Celebração de 13 Anos de EG South America: 12 dias de atividades socioambientais.', territory: 'Brasil', axis: ['Arte', 'Direitos'], kpi_label: 'labels.duration', kpi_detail: 'Janeiro-Fevereiro 2027', meta: [{ labelKey: 'project.edition', value: '4ª Edição' }, { labelKey: 'project.type', value: 'Celebração & Rede' }], category: 'climate' },
  { id: 'p4c', type: 'active', size: 'card-lg', year: 2025, status_tag: 'status.active', title: 'EARTH DOC', description: 'Cobertura completa documental de todo o trabalho EG South America. COP30, Virada Climática, Vulcan Festival.', territory: 'Brasil', axis: ['Arte', 'Direitos'], kpi_label: 'labels.format', kpi_detail: 'Documentário, Fotos, Textos', meta: [{ labelKey: 'project.focus', value: 'COP30 + Virada Climática + Vulcan Festival' }, { labelKey: 'project.format', value: 'Documentário, Fotos, Textos' }], category: 'climate' },
  { id: 'p5', type: 'pipeline', size: 'card-lg', year: 2027, status_tag: 'status.submission', title: 'VULCAN OBSERVATORY', description: 'Pesquisa em zonas de sacrifício e impacto da mineração de Terras Raras. Segurança, Defesa e Restauração.', territory: 'Brasil', axis: ['Água', 'Direitos'], kpi_label: 'labels.territorialDefense', kpi_detail: 'Áreas de Terras Raras', meta: [{ labelKey: 'project.status', value: 'Mapeamento Sul/Centro América' }, { labelKey: 'project.scope', value: 'Segurança, Defesa, Restauração' }], category: 'climate' },
  { id: 'p6', type: 'pipeline', size: 'card-md', year: 2026, status_tag: 'status.submission', title: 'MONITORAMENTO CORPOS D\'ÁGUA', description: 'Advocacy e pesquisa contínua de corpos d\'água, flora e fauna.', territory: 'Brasil', axis: ['Água'], meta: [{ labelKey: 'project.type', value: 'Pesquisa & Advocacy' }, { labelKey: 'project.connection', value: 'Vulcan Observatory' }], category: 'environmental' },
  { id: 'p7', type: 'pipeline', size: 'card-sm', year: 2026, status_tag: 'status.submission', title: 'KIT AMIGXS DA ÁGUA', description: 'Análise e controle de pH e qualidade da água com kits caseiros e acessíveis.', territory: 'Brasil', axis: ['Água', 'Tecnologia'], meta: [{ labelKey: 'project.origin', value: 'Escola São Roque' }, { labelKey: 'project.production', value: 'SOS Águas da Prata' }], category: 'environmental' },
  { id: 'p8', type: 'pipeline', size: 'card-sm', year: 2027, status_tag: 'status.submission', title: 'MAPEAMENTO ZONAS DE SACRIFÍCIO', description: 'Mapeamento inicial de comunidades vulneráveis na América do Sul e Central.', territory: 'Brasil', axis: ['Direitos'], meta: [{ labelKey: 'project.scope', value: 'Sul/Centro América' }, { labelKey: 'project.connection', value: 'Vulcan Observatory' }], category: 'climate' },
  { id: 'p9', type: 'pipeline', size: 'card-sm', year: 2027, status_tag: 'status.submission', title: 'SEGURANÇA RADIOLÓGICA E ALIMENTAR', description: 'Áreas estratégicas de foco do observatório - radiologia e segurança alimentar.', territory: 'Brasil', axis: ['Água', 'Direitos'], meta: [{ labelKey: 'project.focus', value: 'Radiologia & Alimentos' }, { labelKey: 'project.connection', value: 'Vulcan Observatory' }], category: 'climate' },
  { id: 'p10', type: 'pipeline', size: 'card-md', year: 2026, status_tag: 'status.writing', title: 'ECOTRACK MAPBIOMAS', description: 'Ferramentas geohidrográficas para catalogação comunitária de nascentes e monitoramento de bacias.', territory: 'Brasil', axis: ['Água', 'Tecnologia'], kpi_label: 'labels.grantPhase', meta: [{ labelKey: 'project.type', value: 'MapBiomas + Geohidrografia' }, { labelKey: 'project.scope', value: 'Nascentes & Bacias' }], category: 'environmental' },
  { id: 'p14', type: 'done', size: 'card-lg', year: 2016, status_tag: 'status.historic', title: 'XÔ MINERADORAS', description: 'Movimento comunitário contra mineração de bauxita que ameaçava fontes de água. Base para Vulcan Observatory.', territory: 'Brasil', axis: ['Água', 'Direitos'], kpi_label: 'labels.communityVictory', kpi_detail: 'Concurso Curta Prata 2016', meta: [{ labelKey: 'project.legacy', value: 'Videoclipe "A Mensagem da Onça"' }, { labelKey: 'project.sponsorship', value: 'Banco do Brasil' }], category: 'climate' },
  { id: 'p14b', type: 'done', size: 'card-sm', year: 2016, status_tag: 'status.award', title: 'A MENSAGEM DA ONÇA', description: 'Videoclipe expondo a crise climática e vozes jovens emergentes. Vencedor do Concurso Curta Prata 2016.', territory: 'Brasil', axis: ['Arte'], kpi_label: 'labels.award', kpi_detail: 'Concurso Curta Prata 2016', meta: [{ labelKey: 'project.sponsorship', value: 'Banco do Brasil' }, { labelKey: 'project.connection', value: 'Xô Mineradoras' }], category: 'culture' },
  { id: 'p15', type: 'done', size: 'card-sm', year: 2025, status_tag: 'status.exchange', title: 'VULCAN FESTIVAL', description: 'Visibilidade internacional e fortalecimento de rede de advocacy via Mídia Ninja.', territory: 'Brasil', axis: ['Arte', 'Direitos'], meta: [{ labelKey: 'project.scope', value: 'Global Network' }, { labelKey: 'project.connection', value: 'Vulcan Observatory' }], category: 'climate' },
  { id: 'p16', type: 'done', size: 'card-md', year: 2025, status_tag: 'status.partnership', title: 'TRILHANDO CAMINHOS', description: 'Gestão administrativa rural, ervas e direitos sociais para mulheres na comunidade Cascata.', territory: 'Brasil', axis: ['Direitos', 'Água'], kpi_label: 'labels.empowerment', meta: [{ labelKey: 'project.partners', value: 'Instituto Federal do Brasil' }, { labelKey: 'project.role', value: 'Isadora (EG Poços de Caldas)' }], category: 'rights' },
  { id: 'p16b', type: 'done', size: 'card-sm', year: 2025, status_tag: 'status.advisor', title: 'NANCI FERREIRA', description: 'Facilitadora idosa e ponte comunitária. Conselheira de Saberes do projeto EG Cascata.', territory: 'Brasil', axis: ['Direitos'], kpi_label: 'labels.communityConnection', meta: [{ labelKey: 'project.role', value: 'Conselheira de Saberes' }, { labelKey: 'project.connection', value: 'EG Cascata' }], category: 'rights' },
  { id: 'p17', type: 'done', size: 'card-md', year: 2024, status_tag: 'status.partnership', title: 'BAQUE MULHER', description: 'Movimento de empoderamento feminino através do maracatu. Apresentações em eventos culturais.', territory: 'Brasil', axis: ['Arte', 'Direitos'], kpi_label: 'labels.livingCulture', meta: [{ labelKey: 'project.type', value: 'Somente mulheres' }, { labelKey: 'project.connection', value: 'Parceiro em eventos' }], category: 'culture' },
  { id: 'p18', type: 'active', size: 'card-lg', year: 2025, status_tag: 'status.virada2026', title: 'SOS - HORTA PARQUE (SAF)', description: 'Sistema agroflorestal como laboratório vivo para projetos de restauração e educação ambiental.', territory: 'Brasil', axis: ['Água'], kpi_label: 'Projetos Ativos', meta: [{ labelKey: 'project.type', value: 'SAF - Sistema Agroflorestal' }, { labelKey: 'project.status', value: 'Base para projetos em execução' }], category: 'restoration' },
  { id: 'p19', type: 'done', size: 'card-md', year: 2024, status_tag: 'status.creativeEconomy', title: 'PRATA PRINT / BHUMISPRINT', description: 'Economia criativa: produtos impressos originais (camisetas, canecas) e reuso de materiais.', territory: 'Brasil', axis: ['Arte'], kpi_label: 'labels.sustainableFashion', kpi_detail: 'Camisetas, canecas, reuso', meta: [{ labelKey: 'project.base', value: 'SOS Águas da Prata NGO' }, { labelKey: 'project.focus', value: 'Redução impacto indústria fashion' }], category: 'culture' },
  { id: 'p20', type: 'done', size: 'card-sm', year: 2024, status_tag: 'status.partnership', title: 'SOS - HORTA PARQUE (SAF)', description: 'Sistema agroflorestal como laboratório vivo para projetos de restauração e educação ambiental.', territory: 'Brasil', axis: ['Arte'], meta: [{ labelKey: 'project.facilitators', value: 'RCC Tupã Levi, Crew Leader Isadora' }, { labelKey: 'project.type', value: 'Educação Ambiental' }], category: 'environmental' },
  { id: 'p21', type: 'done', size: 'card-sm', year: 2019, status_tag: 'status.founder', title: 'OFICINA DE MÚSICA', description: 'Projeto carro-chefe do coletivo - oficinas comunitárias gratuitas. Fundação da Banda Impermanente.', territory: 'Brasil', axis: ['Arte'], kpi_label: 'labels.founderProject', kpi_detail: 'Base da Banda Impermanente', meta: [{ labelKey: 'project.type', value: 'Projeto Formativo' }, { labelKey: 'project.legacy', value: 'Workshops semanais' }], category: 'culture' },
  { id: 'p21b', type: 'done', size: 'card-md', year: 2024, status_tag: 'status.professional', title: 'BANDA IMPERMANENTE', description: 'Projeto musical profissional nascido da Oficina de Música. Realiza apresentações e lançamentos.', territory: 'Brasil', axis: ['Arte'], kpi_label: 'labels.professionalProject', kpi_detail: 'Álbuns e Apresentações', meta: [{ labelKey: 'project.origin', value: 'Oficina de Música e Meio Ambiente' }, { labelKey: 'project.base', value: 'SOS Águas da Prata' }], category: 'culture' },
  { id: 'p22', type: 'done', size: 'card-lg', year: 2025, status_tag: 'status.completed', title: 'O DESPERTAR DAS MATAS', description: 'Circo e teatro com temas socioambientais na escola pública EMEB Áurea Soares.', territory: 'Brasil', axis: ['Arte', 'Direitos'], kpi_label: 'labels.fullCoverage', kpi_detail: 'COP30 + Todos os eventos', meta: [{ labelKey: 'project.events', value: 'Virada Climática, COP30, Vulcan Festival' }, { labelKey: 'project.format', value: 'Documentário, Fotos, Textos' }], category: 'climate' }
]

async function migrate() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('   DIRECT SQL MIGRATION (Bypasses RLS)')
  console.log('═══════════════════════════════════════════════════════════')
  console.log(`\n👤 Owner UUID: ${OWNER_UUID}`)
  console.log(`📦 Projects: ${projectsData.length}\n`)

  // Build single INSERT statement for all projects
  const values = projectsData.map(p => {
    const metaJson = JSON.stringify(p.meta || []).replace(/'/g, "''")
    const axisJson = JSON.stringify(p.axis || []).replace(/'/g, "''")
    
    return `(
      gen_random_uuid(),
      '${OWNER_UUID}',
      '${p.title.replace(/'/g, "''")}',
      '${p.description ? p.description.replace(/'/g, "''") : ''}',
      '${p.type}',
      '${p.status_tag || ''}',
      'public',
      '${p.size}',
      '${p.territory}',
      '${axisJson}',
      '${p.category || ''}',
      ${p.year || 'NULL'},
      NULL,
      ${p.kpi_label ? `'${p.kpi_label}'` : 'NULL'},
      ${p.kpi_value ? `'${p.kpi_value}'` : 'NULL'},
      ${p.kpi_detail ? `'${p.kpi_detail}'` : 'NULL'},
      '${metaJson}',
      '[]',
      0,
      0,
      now(),
      now()
    )`
  }).join(',\n')

  const sql = `INSERT INTO projects (
    id, owner_id, title, description, status, status_tag, privacy, size, 
    territory, axis, category, year, parent_id, kpi_label, kpi_value, 
    kpi_detail, meta, links, position_x, position_y, created_at, updated_at
  ) VALUES ${values};`

  console.log('📝 Executing SQL INSERT...')
  
  // Execute via Supabase RPC (SQL executor)
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
  
  if (error) {
    // If rpc doesn't exist, try alternative approach
    if (error.message.includes('function') || error.message.includes('rpc')) {
      console.log('⚠️  RPC method not available. Trying direct REST insert...\n')
      
      // Try inserting one at a time with service role workaround
      let successCount = 0
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
          connection_type: null,
          position_x: 0,
          position_y: 0
        }
        
        // Note: This will still fail with RLS unless we disable it temporarily
        const result = await supabase.from('projects').insert(payload)
        if (result.error) {
          console.log(`  ❌ ${p.id}: ${result.error.message}`)
        } else {
          console.log(`  ✅ ${p.id}: ${p.title}`)
          successCount++
        }
      }
      
      console.log(`\n📊 Result: ${successCount}/${projectsData.length} inserted`)
      console.log('\n💡 If RLS blocks inserts, you need to:')
      console.log('   1. Temporarily disable RLS on projects table, OR')
      console.log('   2. Use Service Role key instead of anon key, OR')
      console.log('   3. Run INSERT directly in Supabase SQL Editor')
      return
    }
    
    console.error('❌ Migration failed:', error.message)
    return
  }
  
  console.log('✅ Migration complete!')
  console.log(`📊 Inserted ${projectsData.length} projects`)
}

migrate().catch(err => {
  console.error('💥 Migration failed:', err.message)
  console.error(err.stack)
  process.exit(1)
})
