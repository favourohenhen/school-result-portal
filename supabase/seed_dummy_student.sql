-- ==============================================================================
-- DUMMY DATA SEED SCRIPT FOR TESTING
-- ==============================================================================
-- Run this in your Supabase SQL Editor to create a test student.

-- 1. Create a dummy class (ignoring if it already exists)
INSERT INTO classes (id, name) 
VALUES ('c0000000-0000-0000-0000-000000000001', 'JSS 1A')
ON CONFLICT (id) DO NOTHING;

-- 2. Create a dummy student
-- This gives us credentials we can use to test the frontend login!
INSERT INTO students (full_name, examination_number, class_id, code_hash, code_status)
VALUES (
  'John Doe (Demo)', 
  'DEMO/2026/001', 
  'c0000000-0000-0000-0000-000000000001', 
  '12345', 
  'active'
)
ON CONFLICT (examination_number) DO NOTHING;
