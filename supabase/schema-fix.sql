-- Fix infinite recursion in RLS policies
-- Run this in Supabase SQL Editor

-- Drop all existing policies on projects
DROP POLICY IF EXISTS "projects_owner_all" ON projects;
DROP POLICY IF EXISTS "projects_member_select" ON projects;
DROP POLICY IF EXISTS "projects_editor_update" ON projects;
DROP POLICY IF EXISTS "projects_public_select" ON projects;
DROP POLICY IF EXISTS "projects_link_only_select" ON projects;

-- Recreate policies without recursion
CREATE POLICY "projects_owner_all" ON projects
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "projects_public_select" ON projects
  FOR SELECT USING (privacy = 'public');

CREATE POLICY "projects_link_only_select" ON projects
  FOR SELECT USING (privacy = 'link_only');

CREATE POLICY "projects_member_select" ON projects
  FOR SELECT USING (
    id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "projects_editor_update" ON projects
  FOR UPDATE USING (
    id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid() AND role = 'editor'
    )
  );

-- Fix members policies
DROP POLICY IF EXISTS "members_member_select" ON project_members;

CREATE POLICY "members_member_select" ON project_members
  FOR SELECT USING (
    project_id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid()
    )
  );
