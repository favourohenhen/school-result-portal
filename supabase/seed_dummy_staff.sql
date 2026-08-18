-- ==============================================================================
-- DUMMY STAFF SEED SCRIPT FOR TESTING
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Create Dummy Admin (admin@school.com / admin123)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'admin@school.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- NEW: Supabase recently required auth.identities for password login to work
INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  format('{"sub":"%s","email":"%s"}', 'a0000000-0000-0000-0000-000000000001', 'admin@school.com')::jsonb,
  'email',
  now(), now(), now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (user_id, role)
VALUES ('a0000000-0000-0000-0000-000000000001', 'admin')
ON CONFLICT (user_id) DO NOTHING;


-- 2. Create Dummy Teacher (teacher@school.com / teacher123)
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  'b0000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'teacher@school.com',
  crypt('teacher123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
) VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  format('{"sub":"%s","email":"%s"}', 'b0000000-0000-0000-0000-000000000001', 'teacher@school.com')::jsonb,
  'email',
  now(), now(), now()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.profiles (user_id, role)
VALUES ('b0000000-0000-0000-0000-000000000001', 'teacher')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.teachers (id, user_id, full_name)
VALUES ('b1111111-1111-1111-1111-111111111111', 'b0000000-0000-0000-0000-000000000001', 'Jane Teacher')
ON CONFLICT (id) DO NOTHING;
