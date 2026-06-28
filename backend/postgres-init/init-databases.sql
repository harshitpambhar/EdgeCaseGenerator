-- Create all required databases if they don't exist
SELECT 'CREATE DATABASE auth_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'auth_db')\gexec
SELECT 'CREATE DATABASE user_db' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'user_db')\gexec
SELECT 'CREATE DATABASE job_db'  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'job_db')\gexec
