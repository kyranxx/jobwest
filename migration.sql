-- Create a new schema for extensions
CREATE SCHEMA extensions;

-- Move the extensions to the new schema
ALTER EXTENSION pg_trgm SET SCHEMA extensions;
ALTER EXTENSION fuzzystrmatch SET SCHEMA extensions;
ALTER EXTENSION pgaudit SET SCHEMA extensions;
