-- Setup script for test database
-- Run this with: psql -U postgres -f setup-test-db.sql

-- Create test database
DROP DATABASE IF EXISTS topic_similarity_test;
CREATE DATABASE topic_similarity_test;

-- Connect to the test database
\c topic_similarity_test

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify extension is installed
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Create a test user (optional)
-- CREATE USER test_user WITH PASSWORD 'test_password';
-- GRANT ALL PRIVILEGES ON DATABASE topic_similarity_test TO test_user;

-- Display success message
SELECT 'Test database setup complete!' as status;
