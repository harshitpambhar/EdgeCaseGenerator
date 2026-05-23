-- V2__add_job_tracking_columns.sql
-- Adds columns for richer Docker container lifecycle tracking

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS container_status VARCHAR(30);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS logs TEXT;
