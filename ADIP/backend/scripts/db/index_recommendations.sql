-- ============================================================================
-- ADIP — Production Index Recommendations (PostgreSQL)   [Role 3 — DBA]
-- ----------------------------------------------------------------------------
-- Idempotent (IF NOT EXISTS). Apply in production only. SQLite dev does not
-- need these (small data, single writer). Review with EXPLAIN ANALYZE before/after.
--
--   psql "$DATABASE_URL" -f backend/scripts/db/index_recommendations.sql
-- ============================================================================

-- --- Foreign-key hot paths (joins + cascade filters) ---
CREATE INDEX IF NOT EXISTS ix_applications_project_id        ON applications (project_id);
CREATE INDEX IF NOT EXISTS ix_requirements_project_id        ON requirements (project_id);
CREATE INDEX IF NOT EXISTS ix_dev_stories_project_id         ON development_stories (project_id);
CREATE INDEX IF NOT EXISTS ix_dev_stories_requirement_id     ON development_stories (requirement_id);
CREATE INDEX IF NOT EXISTS ix_dev_tasks_story_id             ON development_tasks (story_id);
CREATE INDEX IF NOT EXISTS ix_test_cases_project_id          ON test_cases (project_id);
CREATE INDEX IF NOT EXISTS ix_test_execution_test_case_id    ON test_execution (test_case_id);
CREATE INDEX IF NOT EXISTS ix_defects_project_id             ON defects (project_id);
CREATE INDEX IF NOT EXISTS ix_releases_project_id            ON releases (project_id);
CREATE INDEX IF NOT EXISTS ix_deployments_project_id         ON deployments (project_id);
CREATE INDEX IF NOT EXISTS ix_artifacts_project_id           ON artifacts (project_id);
CREATE INDEX IF NOT EXISTS ix_activity_log_project_id        ON activity_log (project_id);
CREATE INDEX IF NOT EXISTS ix_traceability_links_project_id  ON traceability_links (project_id);
CREATE INDEX IF NOT EXISTS ix_executive_scores_project_id    ON executive_scores (project_id);
CREATE INDEX IF NOT EXISTS ix_copilot_findings_project_id    ON copilot_findings (project_id);
CREATE INDEX IF NOT EXISTS ix_workbench_versions_prompt_id   ON workbench_prompt_versions (prompt_id);
CREATE INDEX IF NOT EXISTS ix_workbench_runs_prompt_id       ON workbench_runs (prompt_id);

-- --- Status / priority filters (dashboards, rollups) ---
CREATE INDEX IF NOT EXISTS ix_projects_status               ON projects (status);
CREATE INDEX IF NOT EXISTS ix_requirements_priority         ON requirements (priority);
CREATE INDEX IF NOT EXISTS ix_defects_severity              ON defects (severity);
CREATE INDEX IF NOT EXISTS ix_test_cases_status             ON test_cases (status);

-- --- Composite indexes (common multi-column predicates) ---
-- Project dashboards frequently filter by project + status.
CREATE INDEX IF NOT EXISTS ix_requirements_project_status   ON requirements (project_id, status);
CREATE INDEX IF NOT EXISTS ix_defects_project_severity      ON defects (project_id, severity);
CREATE INDEX IF NOT EXISTS ix_test_cases_project_status     ON test_cases (project_id, status);
-- Activity log queried by project ordered by time (audit trail).
CREATE INDEX IF NOT EXISTS ix_activity_log_project_created  ON activity_log (project_id, created_at DESC);

-- --- Prompt Studio search (tags/name) ---
CREATE INDEX IF NOT EXISTS ix_workbench_prompts_name        ON workbench_prompts (name);
CREATE INDEX IF NOT EXISTS ix_workbench_prompts_published   ON workbench_prompts (is_published) WHERE is_published = true;

-- --- Full-text (optional; requires pg_trgm) ---
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX IF NOT EXISTS ix_requirements_title_trgm ON requirements USING gin (title gin_trgm_ops);
-- CREATE INDEX IF NOT EXISTS ix_knowledge_articles_body_trgm ON knowledge_articles USING gin (body gin_trgm_ops);

-- --- Maintenance after creating indexes ---
-- ANALYZE;   -- refresh planner statistics
