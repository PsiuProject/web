-- =============================================================================
-- SECURE SCHEMA WITH AUDIT LOGS
-- Run this AFTER the base schema.sql
-- =============================================================================

-- 1) Create app schema for security functions
CREATE SCHEMA IF NOT EXISTS app;
REVOKE CREATE ON SCHEMA app FROM public;
REVOKE USAGE ON SCHEMA app FROM public;
GRANT USAGE ON SCHEMA app TO postgres;

-- 2) Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL,
  record_id TEXT,
  changed_by UUID,
  changed_at TIMESTAMPTZ DEFAULT now(),
  old_data JSONB,
  new_data JSONB
);

-- 3) Audit function
CREATE OR REPLACE FUNCTION app.audit_insert() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$ 
BEGIN
  INSERT INTO audit_logs(table_name, operation, record_id, changed_by, old_data, new_data)
  VALUES (
    TG_TABLE_NAME, 
    TG_OP, 
    COALESCE(NEW.id::text, OLD.id::text), 
    auth.uid(),
    to_jsonb(OLD), 
    to_jsonb(NEW)
  );
  RETURN COALESCE(NEW, OLD);
END; 
$$;

-- 4) Prevent owner_id changes
CREATE OR REPLACE FUNCTION app.prevent_owner_change() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$ 
BEGIN
  IF OLD.owner_id IS DISTINCT FROM NEW.owner_id THEN
    RAISE EXCEPTION 'owner_id cannot be changed';
  END IF;
  RETURN NEW;
END; 
$$;

-- 5) Prevent project_id changes
CREATE OR REPLACE FUNCTION app.prevent_project_change() 
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public 
AS $$ 
BEGIN
  IF OLD.project_id IS DISTINCT FROM NEW.project_id THEN
    RAISE EXCEPTION 'project_id cannot be changed';
  END IF;
  RETURN NEW;
END; 
$$;

-- 6) Drop old policies to avoid conflicts
DROP POLICY IF EXISTS "projects_owner_all" ON projects;
DROP POLICY IF EXISTS "projects_member_select" ON projects;
DROP POLICY IF EXISTS "projects_editor_update" ON projects;
DROP POLICY IF EXISTS "projects_public_select" ON projects;
DROP POLICY IF EXISTS "projects_link_only_select" ON projects;
DROP POLICY IF EXISTS "members_owner_all" ON project_members;
DROP POLICY IF EXISTS "members_member_select" ON project_members;
DROP POLICY IF EXISTS "subprojects_owner_all" ON subprojects;
DROP POLICY IF EXISTS "subprojects_member_select" ON subprojects;
DROP POLICY IF EXISTS "subprojects_editor_manage" ON subprojects;
DROP POLICY IF EXISTS "content_blocks_owner_all" ON project_content_blocks;
DROP POLICY IF EXISTS "content_blocks_select" ON project_content_blocks;
DROP POLICY IF EXISTS "content_blocks_editor_manage" ON project_content_blocks;
DROP POLICY IF EXISTS "canvas_positions_own" ON canvas_positions;
DROP POLICY IF EXISTS "canvas_positions_select" ON canvas_positions;

-- 7) Create secure policies (non-recursive)
-- PROJECTS
CREATE POLICY "projects_insert_auth" ON projects
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "projects_owner_all" ON projects
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "projects_public_select" ON projects
  FOR SELECT TO anon, authenticated
  USING (privacy = 'public');

CREATE POLICY "projects_link_only_select" ON projects
  FOR SELECT TO anon, authenticated
  USING (privacy = 'link_only');

CREATE POLICY "projects_member_select" ON projects
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "projects_editor_update" ON projects
  FOR UPDATE TO authenticated
  USING (
    id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND role = 'editor'
    )
  );

-- PROJECT_MEMBERS
CREATE POLICY "members_owner_manage" ON project_members
  FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "members_select_own" ON project_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- SUBPROJECTS
CREATE POLICY "subprojects_owner_all" ON subprojects
  FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "subprojects_editor_manage" ON subprojects
  FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND role = 'editor'
    )
  );

CREATE POLICY "subprojects_public_select" ON subprojects
  FOR SELECT TO anon, authenticated
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE privacy IN ('public', 'link_only')
    )
  );

-- CONTENT_BLOCKS
CREATE POLICY "content_blocks_owner_all" ON project_content_blocks
  FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "content_blocks_editor_manage" ON project_content_blocks
  FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND role = 'editor'
    )
  );

CREATE POLICY "content_blocks_public_select" ON project_content_blocks
  FOR SELECT TO anon, authenticated
  USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE privacy IN ('public', 'link_only')
    )
  );

-- CANVAS_POSITIONS
CREATE POLICY "canvas_positions_own" ON canvas_positions
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "canvas_positions_member_select" ON canvas_positions
  FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
      UNION
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

-- 8) Attach triggers
DROP TRIGGER IF EXISTS trg_prevent_owner_change ON projects;
CREATE TRIGGER trg_prevent_owner_change 
  BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE FUNCTION app.prevent_owner_change();

DROP TRIGGER IF EXISTS trg_audit_projects ON projects;
CREATE TRIGGER trg_audit_projects 
  AFTER INSERT OR UPDATE OR DELETE ON projects 
  FOR EACH ROW EXECUTE FUNCTION app.audit_insert();

DROP TRIGGER IF EXISTS trg_prevent_project_change ON project_members;
CREATE TRIGGER trg_prevent_project_change 
  BEFORE UPDATE ON project_members 
  FOR EACH ROW EXECUTE FUNCTION app.prevent_project_change();

DROP TRIGGER IF EXISTS trg_audit_project_members ON project_members;
CREATE TRIGGER trg_audit_project_members 
  AFTER INSERT OR UPDATE OR DELETE ON project_members 
  FOR EACH ROW EXECUTE FUNCTION app.audit_insert();

DROP TRIGGER IF EXISTS trg_prevent_project_change_sub ON subprojects;
CREATE TRIGGER trg_prevent_project_change_sub 
  BEFORE UPDATE ON subprojects 
  FOR EACH ROW EXECUTE FUNCTION app.prevent_project_change();

DROP TRIGGER IF EXISTS trg_audit_subprojects ON subprojects;
CREATE TRIGGER trg_audit_subprojects 
  AFTER INSERT OR UPDATE OR DELETE ON subprojects 
  FOR EACH ROW EXECUTE FUNCTION app.audit_insert();

DROP TRIGGER IF EXISTS trg_prevent_project_change_cb ON project_content_blocks;
CREATE TRIGGER trg_prevent_project_change_cb 
  BEFORE UPDATE ON project_content_blocks 
  FOR EACH ROW EXECUTE FUNCTION app.prevent_project_change();

DROP TRIGGER IF EXISTS trg_audit_content_blocks ON project_content_blocks;
CREATE TRIGGER trg_audit_content_blocks 
  AFTER INSERT OR UPDATE OR DELETE ON project_content_blocks 
  FOR EACH ROW EXECUTE FUNCTION app.audit_insert();

DROP TRIGGER IF EXISTS trg_audit_canvas_positions ON canvas_positions;
CREATE TRIGGER trg_audit_canvas_positions 
  AFTER INSERT OR UPDATE OR DELETE ON canvas_positions 
  FOR EACH ROW EXECUTE FUNCTION app.audit_insert();

-- 9) Performance indexes
CREATE INDEX IF NOT EXISTS idx_project_members_project_user ON project_members(project_id, user_id);
CREATE INDEX IF NOT EXISTS idx_projects_owner_privacy ON projects(owner_id, privacy);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_time ON audit_logs(table_name, changed_at);

-- 10) Grant minimal permissions
GRANT EXECUTE ON FUNCTION app.audit_insert() TO authenticated;
GRANT EXECUTE ON FUNCTION app.prevent_owner_change() TO authenticated;
GRANT EXECUTE ON FUNCTION app.prevent_project_change() TO authenticated;
