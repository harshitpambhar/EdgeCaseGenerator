-- V3__add_job_user_columns.sql
-- Adds columns for user ownership of jobs

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS user_name VARCHAR(255);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_jobs_user_email ON jobs (user_email);
