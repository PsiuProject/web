-- =============================================================================
-- Earth Guardians - Advanced Canvas Features Schema
-- Run this AFTER your main schema.sql
-- =============================================================================

-- 1. CANVAS ELEMENTS TABLE (for free-form canvas content)
CREATE TABLE IF NOT EXISTS canvas_elements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('card', 'text', 'image', 'link', 'note', 'connection')),
  content         JSONB DEFAULT '{}',
  position_x      FLOAT DEFAULT 0,
  position_y      FLOAT DEFAULT 0,
  width           FLOAT DEFAULT 300,
  height          FLOAT DEFAULT 200,
  rotation        FLOAT DEFAULT 0,
  z_index         INTEGER DEFAULT 0,
  style           JSONB DEFAULT '{}',
  parent_id       UUID REFERENCES canvas_elements(id) ON DELETE SET NULL,
  connection_type TEXT,
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- 2. CONNECTION TYPES TABLE (predefined connection styles)
CREATE TABLE IF NOT EXISTS connection_types (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  label_key       TEXT,
  color           TEXT DEFAULT '#b55d3a',
  stroke_pattern  TEXT DEFAULT 'solid',
  arrow_style     TEXT DEFAULT 'classic',
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Insert default connection types
INSERT INTO connection_types (name, label_key, color, stroke_pattern, arrow_style) VALUES
  ('subProject', 'connections.subProject', '#ff5f1f', 'solid', 'classic'),
  ('related', 'connections.related', '#6a7d5b', 'dashed', 'classic'),
  ('inspiration', 'connections.inspiration', '#b55d3a', 'dotted', 'arrow'),
  ('evolution', 'connections.evolution', '#508cdc', 'solid', 'arrow'),
  ('dependency', 'connections.dependency', '#9b59b6', 'dashed', 'arrow'),
  ('reference', 'connections.reference', '#95a5a6', 'dotted', 'none')
ON CONFLICT DO NOTHING;

-- 3. CANVAS_HISTORY TABLE (for undo/redo)
CREATE TABLE IF NOT EXISTS canvas_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  action          TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete', 'move', 'resize', 'connect')),
  element_id      UUID REFERENCES canvas_elements(id) ON DELETE SET NULL,
  previous_state  JSONB,
  new_state       JSONB,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_canvas_elements_project ON canvas_elements(project_id);
CREATE INDEX IF NOT EXISTS idx_canvas_elements_type ON canvas_elements(type);
CREATE INDEX IF NOT EXISTS idx_canvas_elements_parent ON canvas_elements(parent_id);
CREATE INDEX IF NOT EXISTS idx_canvas_history_project ON canvas_history(project_id);
CREATE INDEX IF NOT EXISTS idx_canvas_history_element ON canvas_history(element_id);

-- RLS for canvas_elements
ALTER TABLE canvas_elements ENABLE ROW LEVEL SECURITY;

DO $$ DECLARE r RECORD; BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE tablename = 'canvas_elements' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- Canvas elements policies
CREATE POLICY "canvas_elements_select" ON canvas_elements FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE id = canvas_elements.project_id AND 
    (privacy IN ('public','link_only') OR owner_id = auth.uid() OR 
     EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid())))
);

CREATE POLICY "canvas_elements_owner_all" ON canvas_elements FOR ALL USING (
  EXISTS (SELECT 1 FROM projects WHERE id = canvas_elements.project_id AND owner_id = auth.uid())
);

CREATE POLICY "canvas_elements_editor_all" ON canvas_elements FOR ALL USING (
  EXISTS (SELECT 1 FROM project_members WHERE project_id = canvas_elements.project_id AND user_id = auth.uid() AND role = 'editor')
);

-- Canvas history policies
ALTER TABLE canvas_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "canvas_history_select" ON canvas_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE id = canvas_history.project_id AND 
    (privacy IN ('public','link_only') OR owner_id = auth.uid() OR 
     EXISTS (SELECT 1 FROM project_members WHERE project_id = projects.id AND user_id = auth.uid())))
);

CREATE POLICY "canvas_history_insert" ON canvas_history FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Triggers for auto-updating timestamps
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_canvas_elements_updated_at') THEN
    CREATE TRIGGER update_canvas_elements_updated_at
      BEFORE UPDATE ON canvas_elements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add to realtime publication
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE canvas_elements;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE canvas_history;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to get all connections for a project
CREATE OR REPLACE FUNCTION get_project_connections(p_project_id UUID)
RETURNS TABLE (
  id UUID,
  parent_id UUID,
  child_id UUID,
  connection_type TEXT,
  connection_label TEXT,
  color TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ce.id,
    ce.parent_id,
    ce.id as child_id,
    ce.connection_type,
    ct.label_key,
    ct.color
  FROM canvas_elements ce
  LEFT JOIN connection_types ct ON ce.connection_type = ct.name
  WHERE ce.project_id = p_project_id 
    AND ce.type = 'connection'
    AND ce.parent_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
