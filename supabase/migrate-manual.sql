-- =============================================================================
-- MIGRATE PROJECT DATA — PT only (Edge Function fills other languages)
-- Owner: bff69471-dca3-41cf-ac3d-4124053c940a
-- Run AFTER schema.sql in Supabase SQL Editor
-- =============================================================================

DO $$
DECLARE
  o   UUID := 'bff69471-dca3-41cf-ac3d-4124053c940a';
  p1  UUID := gen_random_uuid(); p2  UUID := gen_random_uuid();
  p3  UUID := gen_random_uuid(); p4  UUID := gen_random_uuid();
  p4b UUID := gen_random_uuid(); p4c UUID := gen_random_uuid();
  p5  UUID := gen_random_uuid(); p6  UUID := gen_random_uuid();
  p7  UUID := gen_random_uuid(); p8  UUID := gen_random_uuid();
  p9  UUID := gen_random_uuid(); p10 UUID := gen_random_uuid();
  p14 UUID := gen_random_uuid(); p14b UUID := gen_random_uuid();
  p15 UUID := gen_random_uuid(); p16 UUID := gen_random_uuid();
  p16b UUID := gen_random_uuid(); p17 UUID := gen_random_uuid();
  p18 UUID := gen_random_uuid(); p19 UUID := gen_random_uuid();
  p20 UUID := gen_random_uuid(); p21 UUID := gen_random_uuid();
  p21b UUID := gen_random_uuid(); p22 UUID := gen_random_uuid();
BEGIN

-- Helper: wrap a PT string as JSONB
-- All text values stored as {"pt":"..."} — translation service fills the rest

INSERT INTO projects
  (id, owner_id, title, description, kpi_label, kpi_detail, meta,
   status, status_tag, privacy, size, territory, axis, category, year,
   parent_id, connection_type, links, position_x, position_y)
VALUES

-- ── EM EXECUÇÃO ──────────────────────────────────────────────────────────────
(p1, o,
  '{"pt":"PRATA CULT"}',
  '{"pt":"Profissionalização de jovens (18-29 anos) em música e audiovisual."}',
  '{"pt":"Impacto Estimado"}', '{"pt":"1 Álbum / 10 Docs / 1 Festival"}',
  '[{"labelKey":"project.partners","value":{"pt":"SOS Águas da Prata, Mídia Ninja"}},{"labelKey":"project.role","value":{"pt":"RCC Escrita técnica & Coordenação"}}]',
  'active','status.pnab','public','card-lg','Brasil',ARRAY['Arte','Tecnologia'],'culture',2025,
  NULL,NULL,'[]',0,0),

(p2, o,
  '{"pt":"OFICINAS SEMANAIS"}',
  '{"pt":"Workshops gratuitos: Música, Audiovisual, Agroecologia e Gestão de Projetos na SOS Águas da Prata."}',
  '{"pt":"Formação"}', '{"pt":"Base da Banda Impermanente"}',
  '[{"labelKey":"project.award","value":{"pt":"Prêmio 11 anos - Gov. SP"}},{"labelKey":"project.origin","value":{"pt":"Prêmio CultSP - 11 anos de atuação"}}]',
  'active','status.cultsp','public','card-md','Brasil',ARRAY['Arte','Água','Tecnologia'],'culture',2024,
  NULL,NULL,'[]',0,0),

(p18, o,
  '{"pt":"SOS - HORTA PARQUE (SAF)"}',
  '{"pt":"Sistema agroflorestal como laboratório vivo para projetos de restauração e educação ambiental."}',
  '{"pt":"Projetos Ativos"}', NULL,
  '[{"labelKey":"project.type","value":{"pt":"SAF - Sistema Agroflorestal"}},{"labelKey":"project.status","value":{"pt":"Base para projetos em execução"}}]',
  'active','status.virada2026','public','card-lg','Brasil',ARRAY['Água'],'restoration',2025,
  NULL,NULL,'[]',0,0),

(p3, o,
  '{"pt":"BEE GUARDIANS MELIPONARY"}',
  '{"pt":"Workshops de meliponicultura (abelhas nativas sem ferrão) com escolas e comunidade."}',
  '{"pt":"Biodiversidade"}', '{"pt":"Abelhas Nativas Sem Ferrão"}',
  '[{"labelKey":"project.location","value":{"pt":"SOS - Horta Parque"}},{"labelKey":"project.type","value":{"pt":"Educação Ambiental"}}]',
  'active','status.virada2026','public','card-md','Brasil',ARRAY['Água'],'environmental',2025,
  p18,'connections.subProject','[]',0,0),

(p4, o,
  '{"pt":"JARDIM MEDICINAL"}',
  '{"pt":"Horta comunitária, atividades escolares, preservação de árvores nativas e frutíferas."}',
  '{"pt":"SAF Vivo"}', NULL,
  '[{"labelKey":"project.location","value":{"pt":"SOS - Horta Parque"}},{"labelKey":"project.connection","value":{"pt":"Meliponário"}}]',
  'active','status.virada2026','public','card-md','Brasil',ARRAY['Água'],'environmental',2025,
  p18,'connections.subProject','[]',0,0),

(p4b, o,
  '{"pt":"VIRADA CLIMÁTICA 2027"}',
  '{"pt":"4ª Edição - Celebração de 13 Anos de EG South America: 12 dias de atividades socioambientais. Em Planejamento/Escrita."}',
  '{"pt":"Duração"}', '{"pt":"Janeiro-Fevereiro 2027"}',
  '[{"labelKey":"project.edition","value":{"pt":"4ª Edição"}},{"labelKey":"project.type","value":{"pt":"Celebração & Rede"}}]',
  'active','status.virada2027','public','card-sm','Brasil',ARRAY['Arte','Direitos'],'climate',2027,
  NULL,NULL,'[]',0,0),

(p4c, o,
  '{"pt":"EARTH DOC"}',
  '{"pt":"Cobertura completa documental de todo o trabalho EG South America. COP30, Virada Climática, Vulcan Festival e todos os eventos EG."}',
  '{"pt":"Formato"}', '{"pt":"Documentário, Fotos, Textos"}',
  '[{"labelKey":"project.focus","value":{"pt":"COP30 + Virada Climática + Vulcan Festival"}},{"labelKey":"project.format","value":{"pt":"Documentário, Fotos, Textos"}}]',
  'active','status.active','public','card-lg','Brasil',ARRAY['Arte','Direitos'],'climate',2025,
  NULL,NULL,'[]',0,0),

-- ── PIPELINE ─────────────────────────────────────────────────────────────────
(p5, o,
  '{"pt":"VULCAN OBSERVATORY"}',
  '{"pt":"Pesquisa em zonas de sacrifício e impacto da mineração de Terras Raras. Segurança, Defesa e Restauração."}',
  '{"pt":"Defesa Territorial"}', '{"pt":"Áreas de Terras Raras"}',
  '[{"labelKey":"project.status","value":{"pt":"Mapeamento Sul/Centro América"}},{"labelKey":"project.scope","value":{"pt":"Segurança, Defesa, Restauração"}}]',
  'pipeline','status.submission','public','card-lg','Brasil',ARRAY['Água','Direitos'],'climate',2027,
  NULL,NULL,'[]',0,0),

(p6, o,
  '{"pt":"MONITORAMENTO CORPOS D''ÁGUA"}',
  '{"pt":"Advocacy e pesquisa contínua de corpos d''água, flora e fauna."}',
  NULL, NULL,
  '[{"labelKey":"project.type","value":{"pt":"Pesquisa & Advocacy"}},{"labelKey":"project.connection","value":{"pt":"Vulcan Observatory"}}]',
  'pipeline','status.submission','public','card-md','Brasil',ARRAY['Água'],'environmental',2026,
  p5,'connections.research','[]',0,0),

(p7, o,
  '{"pt":"KIT AMIGXS DA ÁGUA"}',
  '{"pt":"Análise e controle de pH e qualidade da água com kits caseiros e acessíveis."}',
  NULL, NULL,
  '[{"labelKey":"project.origin","value":{"pt":"Escola São Roque"}},{"labelKey":"project.production","value":{"pt":"SOS Águas da Prata"}}]',
  'pipeline','status.submission','public','card-sm','Brasil',ARRAY['Água','Tecnologia'],'environmental',2026,
  p5,'connections.tool','[]',0,0),

(p8, o,
  '{"pt":"MAPEAMENTO ZONAS DE SACRIFÍCIO"}',
  '{"pt":"Mapeamento inicial de comunidades vulneráveis na América do Sul e Central."}',
  NULL, NULL,
  '[{"labelKey":"project.scope","value":{"pt":"Sul/Centro América"}},{"labelKey":"project.connection","value":{"pt":"Vulcan Observatory"}}]',
  'pipeline','status.submission','public','card-sm','Brasil',ARRAY['Direitos'],'climate',2027,
  p5,'connections.mapping','[]',0,0),

(p9, o,
  '{"pt":"SEGURANÇA RADIOLÓGICA E ALIMENTAR"}',
  '{"pt":"Áreas estratégicas de foco do observatório - radiologia e segurança alimentar."}',
  NULL, NULL,
  '[{"labelKey":"project.focus","value":{"pt":"Radiologia & Alimentos"}},{"labelKey":"project.connection","value":{"pt":"Vulcan Observatory"}}]',
  'pipeline','status.submission','public','card-sm','Brasil',ARRAY['Água','Direitos'],'climate',2027,
  p5,'connections.focusArea','[]',0,0),

(p10, o,
  '{"pt":"ECOTRACK MAPBIOMAS"}',
  '{"pt":"Ferramentas geohidrográficas para catalogação comunitária de nascentes e monitoramento de bacias."}',
  '{"pt":"Fase de Grant"}', NULL,
  '[{"labelKey":"project.type","value":{"pt":"MapBiomas + Geohidrografia"}},{"labelKey":"project.scope","value":{"pt":"Nascentes & Bacias"}}]',
  'pipeline','status.writing','public','card-md','Brasil',ARRAY['Água','Tecnologia'],'environmental',2026,
  p5,'connections.tracking','[]',0,0),

-- ── CONCLUÍDOS ───────────────────────────────────────────────────────────────
(p14, o,
  '{"pt":"XÔ MINERADORAS"}',
  '{"pt":"Movimento comunitário contra mineração de bauxita que ameaçava fontes de água. Base para Vulcan Observatory."}',
  '{"pt":"Vitória Comunitária"}', '{"pt":"Concurso Curta Prata 2016"}',
  '[{"labelKey":"project.legacy","value":{"pt":"Videoclipe \"A Mensagem da Onça\""}},{"labelKey":"project.sponsorship","value":{"pt":"Banco do Brasil"}}]',
  'done','status.historic','public','card-lg','Brasil',ARRAY['Água','Direitos'],'climate',2016,
  NULL,NULL,'[]',0,0),

(p14b, o,
  '{"pt":"A MENSAGEM DA ONÇA"}',
  '{"pt":"Videoclipe expondo a crise climática e vozes jovens emergentes. Vencedor do Concurso Curta Prata 2016."}',
  '{"pt":"Prêmio"}', '{"pt":"Concurso Curta Prata 2016"}',
  '[{"labelKey":"project.sponsorship","value":{"pt":"Banco do Brasil"}},{"labelKey":"project.connection","value":{"pt":"Xô Mineradoras"}}]',
  'done','status.award','public','card-sm','Brasil',ARRAY['Arte'],'culture',2016,
  p14,'connections.culturalProduction','[]',0,0),

(p15, o,
  '{"pt":"VULCAN FESTIVAL"}',
  '{"pt":"Visibilidade internacional e fortalecimento de rede de advocacy via Mídia Ninja."}',
  NULL, NULL,
  '[{"labelKey":"project.scope","value":{"pt":"Global Network"}},{"labelKey":"project.connection","value":{"pt":"Vulcan Observatory"}}]',
  'done','status.exchange','public','card-sm','Brasil',ARRAY['Arte','Direitos'],'climate',2025,
  p5,'connections.relatedEvent','[]',0,0),

(p16, o,
  '{"pt":"TRILHANDO CAMINHOS"}',
  '{"pt":"Gestão administrativa rural, ervas e direitos sociais para mulheres na comunidade Cascata."}',
  '{"pt":"Empoderamento"}', NULL,
  '[{"labelKey":"project.partners","value":{"pt":"Instituto Federal do Brasil"}},{"labelKey":"project.role","value":{"pt":"Isadora (EG Poços de Caldas)"}}]',
  'done','status.partnership','public','card-md','Brasil',ARRAY['Direitos','Água'],'rights',2025,
  NULL,NULL,'[]',0,0),

(p16b, o,
  '{"pt":"NANCI FERREIRA"}',
  '{"pt":"Facilitadora idosa e ponte comunitária. Conselheira de Saberes do projeto EG Cascata."}',
  '{"pt":"Conexão Comunitária"}', NULL,
  '[{"labelKey":"project.role","value":{"pt":"Conselheira de Saberes"}},{"labelKey":"project.connection","value":{"pt":"EG Cascata"}}]',
  'done','status.advisor','public','card-sm','Brasil',ARRAY['Direitos'],'rights',2025,
  p16,'connections.facilitator','[]',0,0),

(p17, o,
  '{"pt":"BAQUE MULHER"}',
  '{"pt":"Movimento de empoderamento feminino através do maracatu. Apresentações em eventos culturais."}',
  '{"pt":"Cultura Viva"}', NULL,
  '[{"labelKey":"project.type","value":{"pt":"Somente mulheres"}},{"labelKey":"project.connection","value":{"pt":"Parceiro em eventos"}}]',
  'done','status.partnership','public','card-md','Brasil',ARRAY['Arte','Direitos'],'culture',2024,
  NULL,NULL,'[]',0,0),

(p19, o,
  '{"pt":"PRATA PRINT / BHUMISPRINT"}',
  '{"pt":"Economia criativa: produtos impressos originais (camisetas, canecas) e reuso de materiais."}',
  '{"pt":"Moda Sustentável"}', '{"pt":"Camisetas, canecas, reuso"}',
  '[{"labelKey":"project.base","value":{"pt":"SOS Águas da Prata NGO"}},{"labelKey":"project.focus","value":{"pt":"Redução impacto indústria fashion"}}]',
  'done','status.creativeEconomy','public','card-md','Brasil',ARRAY['Arte'],'culture',2024,
  NULL,NULL,'[]',0,0),

(p20, o,
  '{"pt":"SOS - HORTA PARQUE (SAF)"}',
  '{"pt":"Sistema agroflorestal como laboratório vivo para projetos de restauração e educação ambiental."}',
  NULL, NULL,
  '[{"labelKey":"project.facilitators","value":{"pt":"RCC Tupã Levi, Crew Leader Isadora"}},{"labelKey":"project.type","value":{"pt":"Educação Ambiental"}}]',
  'done','status.partnership','public','card-sm','Brasil',ARRAY['Arte'],'environmental',2024,
  p16,'connections.educational','[]',0,0),

(p21, o,
  '{"pt":"OFICINA DE MÚSICA"}',
  '{"pt":"Projeto carro-chefe do coletivo - oficinas comunitárias gratuitas. Fundação da Banda Impermanente."}',
  '{"pt":"Projeto Fundador"}', '{"pt":"Base da Banda Impermanente"}',
  '[{"labelKey":"project.type","value":{"pt":"Projeto Formativo"}},{"labelKey":"project.legacy","value":{"pt":"Workshops semanais"}}]',
  'done','status.founder','public','card-sm','Brasil',ARRAY['Arte'],'culture',2019,
  NULL,NULL,'[]',0,0),

(p21b, o,
  '{"pt":"BANDA IMPERMANENTE"}',
  '{"pt":"Projeto musical profissional nascido da Oficina de Música. Realiza apresentações e lançamentos."}',
  '{"pt":"Projeto Profissional"}', '{"pt":"Álbuns e Apresentações"}',
  '[{"labelKey":"project.origin","value":{"pt":"Oficina de Música e Meio Ambiente"}},{"labelKey":"project.base","value":{"pt":"SOS Águas da Prata"}}]',
  'done','status.professional','public','card-md','Brasil',ARRAY['Arte'],'culture',2024,
  p21,'connections.evolution','[]',0,0),

(p22, o,
  '{"pt":"O DESPERTAR DAS MATAS"}',
  '{"pt":"Circo e teatro com temas socioambientais na escola pública EMEB Áurea Soares."}',
  '{"pt":"Cobertura Completa"}', '{"pt":"COP30 + Todos os eventos"}',
  '[{"labelKey":"project.events","value":{"pt":"Virada Climática, COP30, Vulcan Festival"}},{"labelKey":"project.format","value":{"pt":"Documentário, Fotos, Textos"}}]',
  'done','status.completed','public','card-lg','Brasil',ARRAY['Arte','Direitos'],'climate',2025,
  NULL,NULL,'[]',0,0);

RAISE NOTICE '✅ 24 projects migrated. Run the translate Edge Function to fill EN translations.';
RAISE NOTICE '📊 Total: %', (SELECT count(*) FROM projects WHERE owner_id = o);

END $$;
