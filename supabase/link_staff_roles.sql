-- ==============================================================================
-- CLEANUP & LINK SCRIPT
-- ==============================================================================

-- 1. Delete the manually injected users that caused the schema error
DELETE FROM auth.users WHERE email IN ('admin@school.com', 'teacher@school.com');

-- (After running this, use the Supabase Dashboard UI to create the users, 
-- then run the section below!)

-- ==============================================================================
-- 2. Run this section AFTER creating the users in the Supabase Dashboard
-- ==============================================================================

-- Link Admin
INSERT INTO public.profiles (user_id, role)
SELECT id, 'admin' FROM auth.users WHERE email = 'admin@school.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Link Teacher
INSERT INTO public.profiles (user_id, role)
SELECT id, 'teacher' FROM auth.users WHERE email = 'teacher@school.com'
ON CONFLICT (user_id) DO UPDATE SET role = 'teacher';

INSERT INTO public.teachers (user_id, full_name)
SELECT id, 'Jane Teacher' FROM auth.users WHERE email = 'teacher@school.com'
ON CONFLICT (user_id) DO NOTHING;
