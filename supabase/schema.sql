-- 1. Schema Definition (Tables & Constraints)

-- Create an enum for user roles idempotently
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Profiles: Maps Supabase Auth users to roles
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    role user_role NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE
);
-- Ensure created_at exists even if table was created previously
ALTER TABLE classes ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Subjects
CREATE TABLE IF NOT EXISTS subjects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    category text DEFAULT 'Junior Secondary'
);
-- Ensure created_at and category exist even if table was created previously
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS category text DEFAULT 'Junior Secondary';


-- Students
CREATE TABLE IF NOT EXISTS students (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL UNIQUE,
    full_name text NOT NULL,
    examination_number text UNIQUE NOT NULL,
    phone_number text,
    class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
    code_hash text,
    code_status text DEFAULT 'inactive',
    created_at timestamptz DEFAULT now()
);

-- Teachers
CREATE TABLE IF NOT EXISTS teachers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    full_name text NOT NULL
);
-- Ensure created_at exists even if table was created previously
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();


-- Teacher Class Assignments (Many-to-Many)
CREATE TABLE IF NOT EXISTS teacher_class_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE NOT NULL,
    class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(teacher_id, class_id)
);

-- Results
CREATE TABLE IF NOT EXISTS results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE NOT NULL,
    score numeric NOT NULL CHECK (score >= 0 AND score <= 100),
    term text NOT NULL,
    session text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(student_id, subject_id, term, session)
);


-- 2. Indexes for Performance (Idempotent)
CREATE INDEX IF NOT EXISTS idx_students_exam_number ON students(examination_number);
CREATE INDEX IF NOT EXISTS idx_results_student_id ON results(student_id);
CREATE INDEX IF NOT EXISTS idx_results_subject_id ON results(subject_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assign_teacher_id ON teacher_class_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assign_class_id ON teacher_class_assignments(class_id);


-- 3. Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_class_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role securely
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- PROFILES
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;
CREATE POLICY "Admins have full access to profiles" ON profiles FOR ALL USING (get_user_role() = 'admin');

-- CLASSES & SUBJECTS
DROP POLICY IF EXISTS "Anyone authenticated can read classes" ON classes;
CREATE POLICY "Anyone authenticated can read classes" ON classes FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins have full access to classes" ON classes;
CREATE POLICY "Admins have full access to classes" ON classes FOR ALL USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "Anyone authenticated can read subjects" ON subjects;
CREATE POLICY "Anyone authenticated can read subjects" ON subjects FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins have full access to subjects" ON subjects;
CREATE POLICY "Admins have full access to subjects" ON subjects FOR ALL USING (get_user_role() = 'admin');

-- STUDENTS
DROP POLICY IF EXISTS "Students can read their own record" ON students;
CREATE POLICY "Students can read their own record" ON students FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Teachers can read students in assigned classes" ON students;
CREATE POLICY "Teachers can read students in assigned classes" ON students FOR SELECT USING (
  get_user_role() = 'teacher' AND 
  class_id IN (
    SELECT class_id FROM teacher_class_assignments 
    JOIN teachers ON teachers.id = teacher_class_assignments.teacher_id 
    WHERE teachers.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins have full access to students" ON students;
CREATE POLICY "Admins have full access to students" ON students FOR ALL USING (get_user_role() = 'admin');

-- TEACHERS & ASSIGNMENTS
DROP POLICY IF EXISTS "Teachers can read own record" ON teachers;
CREATE POLICY "Teachers can read own record" ON teachers FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins have full access to teachers" ON teachers;
CREATE POLICY "Admins have full access to teachers" ON teachers FOR ALL USING (get_user_role() = 'admin');

DROP POLICY IF EXISTS "Teachers can read own assignments" ON teacher_class_assignments;
CREATE POLICY "Teachers can read own assignments" ON teacher_class_assignments FOR SELECT USING (
  teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins have full access to assignments" ON teacher_class_assignments;
CREATE POLICY "Admins have full access to assignments" ON teacher_class_assignments FOR ALL USING (get_user_role() = 'admin');

-- RESULTS
DROP POLICY IF EXISTS "Students can read own results" ON results;
CREATE POLICY "Students can read own results" ON results FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Teachers can read results of assigned classes" ON results;
CREATE POLICY "Teachers can read results of assigned classes" ON results FOR SELECT USING (
  get_user_role() = 'teacher' AND 
  student_id IN (
    SELECT s.id FROM students s
    JOIN teacher_class_assignments tca ON s.class_id = tca.class_id
    JOIN teachers t ON tca.teacher_id = t.id
    WHERE t.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Teachers can insert results for assigned classes" ON results;
CREATE POLICY "Teachers can insert results for assigned classes" ON results FOR INSERT WITH CHECK (
  get_user_role() = 'teacher' AND 
  student_id IN (
    SELECT s.id FROM students s
    JOIN teacher_class_assignments tca ON s.class_id = tca.class_id
    JOIN teachers t ON tca.teacher_id = t.id
    WHERE t.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Teachers can update results for assigned classes" ON results;
CREATE POLICY "Teachers can update results for assigned classes" ON results FOR UPDATE USING (
  get_user_role() = 'teacher' AND 
  student_id IN (
    SELECT s.id FROM students s
    JOIN teacher_class_assignments tca ON s.class_id = tca.class_id
    JOIN teachers t ON tca.teacher_id = t.id
    WHERE t.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Admins have full access to results" ON results;
CREATE POLICY "Admins have full access to results" ON results FOR ALL USING (get_user_role() = 'admin');
