-- V1__create_jobs_table.sql
CREATE TABLE IF NOT EXISTS jobs (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    repo_url       TEXT        NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'QUEUED',
    container_id   VARCHAR(128),
    workspace_path TEXT,
    result_json    TEXT,
    error_message  TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at   TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs (status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs (created_at DESC);
