-- =============================================================================
-- Earth Guardians - Supabase Schema (idempotent - safe to re-run)
-- Translatable text fields use JSONB: {"pt":"...","en":"..."}
-- =============================================================================

-- 1. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title           JSONB NOT NULL DEFAULT '{}',   -- {"pt":"...","en":"..."}
  description     JSONB DEFAULT '{}',
  kpi_label       JSONB DEFAULT NULL,            -- {"pt":"...","en":"..."}
  kpi_value       TEXT,                          -- numeric/code, no translation needed
  kpi_detail      JSONB DEFAULT NULL,            -- {"pt":"...","en":"..."}
  status          TEXT DEFAULT 'active',         -- 'active'|'pipeline'|'done'
  status_tag      TEXT,                          -- i18n key e.g. 'status.pnab'
  privacy         TEXT DEFAULT 'private',
  size            TEXT DEFAULT 'card-md',
  territory       TEXT DEFAULT 'Brasil',
  axis            TEXT[] DEFAULT '{}',
  category        TEXT,
  year            INTEGER,
  parent_id       UUID REFERENCES projects(id) ON DELETE SET NULL,
  connection_type TEXT,                          -- i18n key
  meta            JSONB DEFAULT '[]',            -- [{"labelKey":"...","value":{"pt":"...","en":"..."}}]
  links           JSONB DEFAULT '[]',
  related_projects TEXT[] DEFAULT '{}',
  share_slug       TEXT UNIQUE,              -- funny encrypted slug for shareable links
  position_x      FLOAT DEFAULT 0,
  position_y      FLOAT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- Add share_slug if missing (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='projects' AND column_name='share_slug') THEN
    ALTER TABLE projects ADD COLUMN share_slug TEXT UNIQUE;
  END IF;
END $$;
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='projects' AND column_name='title' AND data_type='text'
  ) THEN
    ALTER TABLE projects ALTER COLUMN title TYPE JSONB USING jsonb_build_object('pt', title);
    ALTER TABLE projects ALTER COLUMN description TYPE JSONB USING jsonb_build_object('pt', description);
  END IF;
END $$;

-- Add JSONB kpi columns if they were TEXT before
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='projects' AND column_name='kpi_label' AND data_type='text'
  ) THEN
    ALTER TABLE projects ALTER COLUMN kpi_label TYPE JSONB USING CASE WHEN kpi_label IS NULL THEN NULL ELSE jsonb_build_object('pt', kpi_label) END;
    ALTER TABLE projects ALTER COLUMN kpi_detail TYPE JSONB USING CASE WHEN kpi_detail IS NULL THEN NULL ELSE jsonb_build_object('pt', kpi_detail) END;
  END IF;
END $$;

-- 2. SUBPROJECTS TABLE
CREATE TABLE IF NOT EXISTS subprojects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title       JSONB NOT NULL DEFAULT '{}',
  description JSONB DEFAULT '{}',
  status      TEXT DEFAULT 'active',
  position    INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 3. PROJECT MEMBERS TABLE
CREATE TABLE IF NOT EXISTS project_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        TEXT DEFAULT 'viewer' CHECK (role IN ('owner','editor','commenter','viewer')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, email)
);

-- 4. PROJECT CONTENT BLOCKS TABLE
CREATE TABLE IF NOT EXISTS project_content_blocks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  type        TEXT NOT NULL,                     -- 'text'|'image'|'link'
  content     JSONB DEFAULT NULL,               -- {"pt":"...","en":"..."} for text/caption; NULL for pure links
  url         TEXT,
  position    INTEGER DEFAULT 0,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Migrate content TEXT→JSONB if needed
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='project_content_blocks' AND column_name='content' AND data_type='text'
  ) THEN
    ALTER TABLE project_content_blocks
      ALTER COLUMN content TYPE JSONB
      USING CASE WHEN content IS NULL THEN NULL ELSE jsonb_build_object('pt', content) END;
  END IF;
END $$;

-- 5. CANVAS POSITIONS TABLE
CREATE TABLE IF NOT EXISTS canvas_positions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  position_x  FLOAT DEFAULT 0,
  position_y  FLOAT DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- 6. TRANSLATION GLOSSARY TABLE
-- Stores manually-corrected translations that must never be auto-overwritten.
CREATE TABLE IF NOT EXISTS translation_glossary (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_lang TEXT NOT NULL,               -- 'pt'
  source_text TEXT NOT NULL,               -- original phrase/word
  target_lang TEXT NOT NULL,               -- 'en'
  target_text TEXT NOT NULL,               -- human-corrected translation
  owner_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source_lang, source_text, target_lang)
);

-- =============================================================================
-- TRIGGERS
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_projects_updated_at') THEN
    CREATE TRIGGER update_projects_updated_at
      BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_content_blocks_updated_at') THEN
    CREATE TRIGGER update_content_blocks_updated_at
      BEFORE UPDATE ON project_content_blocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_canvas_positions_updated_at') THEN
    CREATE TRIGGER update_canvas_positions_updated_at
      BEFORE UPDATE ON canvas_positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- =============================================================================
-- RLS
-- =============================================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subprojects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_content_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE translation_glossary ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies idempotently
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies
    WHERE tablename IN ('projects','subprojects','project_members','project_content_blocks','canvas_positions')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- PROJECTS
CREATE POLICY "projects_owner_all"      ON projects FOR ALL    USING (auth.uid() = owner_id);
CREATE POLICY "projects_public_select"  ON projects FOR SELECT USING (privacy = 'public');
CREATE POLICY "projects_link_select"    ON projects FOR SELECT USING (privacy = 'link_only');
CREATE POLICY "projects_slug_select"    ON projects FOR SELECT USING (share_slug IS NOT NULL);
CREATE POLICY "projects_member_select"  ON projects FOR SELECT USING (EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid()));
CREATE POLICY "projects_editor_update"  ON projects FOR UPDATE USING (EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid() AND role = 'editor'));

-- SUBPROJECTS
CREATE POLICY "subprojects_select" ON subprojects FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE id = subprojects.project_id AND (privacy IN ('public','link_only') OR owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid())))
);
CREATE POLICY "subprojects_owner_all"    ON subprojects FOR ALL USING (EXISTS (SELECT 1 FROM projects WHERE id = subprojects.project_id AND owner_id = auth.uid()));
CREATE POLICY "subprojects_editor_all"   ON subprojects FOR ALL USING (EXISTS (SELECT 1 FROM project_members WHERE project_id = subprojects.project_id AND user_id = auth.uid() AND role = 'editor'));

-- MEMBERS
CREATE POLICY "members_owner_all"    ON project_members FOR ALL    USING (EXISTS (SELECT 1 FROM projects WHERE id = project_members.project_id AND owner_id = auth.uid()));
CREATE POLICY "members_self_select"  ON project_members FOR SELECT USING (EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = project_members.project_id AND pm.user_id = auth.uid()));

-- CONTENT BLOCKS
CREATE POLICY "blocks_select" ON project_content_blocks FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE id = project_content_blocks.project_id AND (privacy IN ('public','link_only') OR owner_id = auth.uid() OR EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid())))
);
CREATE POLICY "blocks_owner_all"  ON project_content_blocks FOR ALL USING (EXISTS (SELECT 1 FROM projects WHERE id = project_content_blocks.project_id AND owner_id = auth.uid()));
CREATE POLICY "blocks_editor_all" ON project_content_blocks FOR ALL USING (EXISTS (SELECT 1 FROM project_members WHERE project_id = project_content_blocks.project_id AND user_id = auth.uid() AND role = 'editor'));

-- CANVAS
CREATE POLICY "canvas_own"    ON canvas_positions FOR ALL    USING (auth.uid() = user_id);
CREATE POLICY "canvas_select" ON canvas_positions FOR SELECT USING (
  EXISTS (SELECT 1 FROM project_members WHERE project_id = canvas_positions.project_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM projects WHERE id = canvas_positions.project_id AND owner_id = auth.uid())
);

-- GLOSSARY — owner manages their own; all authenticated users can read (shared vocabulary)
CREATE POLICY "glossary_owner_all"  ON translation_glossary FOR ALL    USING (auth.uid() = owner_id);
CREATE POLICY "glossary_auth_read"  ON translation_glossary FOR SELECT USING (auth.uid() IS NOT NULL);

-- =============================================================================
-- AUTO-LINK MEMBER TRIGGER
-- =============================================================================
CREATE OR REPLACE FUNCTION link_member_to_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE project_members SET user_id = NEW.id WHERE email = NEW.email AND user_id IS NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_user_signup_link_member') THEN
    CREATE TRIGGER on_user_signup_link_member AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION link_member_to_user();
  END IF;
END $$;

-- =============================================================================
-- REALTIME + INDEXES
-- =============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE projects;
ALTER PUBLICATION supabase_realtime ADD TABLE project_content_blocks;
ALTER PUBLICATION supabase_realtime ADD TABLE canvas_positions;

CREATE INDEX IF NOT EXISTS idx_projects_owner    ON projects(owner_id);
CREATE INDEX IF NOT EXISTS idx_projects_privacy  ON projects(privacy);
CREATE INDEX IF NOT EXISTS idx_projects_status   ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_parent   ON projects(parent_id);
CREATE INDEX IF NOT EXISTS idx_projects_slug     ON projects(share_slug);
CREATE INDEX IF NOT EXISTS idx_members_project   ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_members_user      ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_blocks_project    ON project_content_blocks(project_id);
CREATE INDEX IF NOT EXISTS idx_canvas_project    ON canvas_positions(project_id);
CREATE INDEX IF NOT EXISTS idx_glossary_lookup   ON translation_glossary(source_lang, target_lang);
