-- Migration 002: Agent libraries + Project hierarchy
-- Run this in the Supabase SQL Editor

-- Agent libraries (GitHub repos containing .claude/agents/)
CREATE TABLE IF NOT EXISTS agent_libraries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  repo TEXT NOT NULL UNIQUE,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE OR REPLACE TRIGGER update_agent_libraries_updated_at
  BEFORE UPDATE ON agent_libraries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Default library
INSERT INTO agent_libraries (name, repo, description, is_default) VALUES
  ('Claude Code Official', 'anthropics/claude-code', 'Official Claude Code agents', true)
ON CONFLICT (repo) DO NOTHING;

-- Project hierarchy
ALTER TABLE projects ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES projects(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_projects_parent_id ON projects(parent_id);
