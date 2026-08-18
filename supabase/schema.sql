-- 1. Schema Definition (Tables & Constraints)

-- Create an enum for user roles
CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');

-- Profiles: Maps Supabase Auth users to roles
CREATE TABLE profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    role user_role NOT NULL,
    created_at timestamptz DEFAULT now()
);

-- Classes
CREATE TABLE classes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE
);

-- Subjects
CREATE TABLE subjects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE
);

-- Students
CREATE TABLE students (
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
CREATE TABLE teachers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    full_name text NOT NULL
);

-- Teacher Class Assignments (Many-to-Many)
CREATE TABLE teacher_class_assignments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE NOT NULL,
    class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(teacher_id, class_id)
);

-- Results
CREATE TABLE results (
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


-- 2. Indexes for Performance
CREATE INDEX idx_students_exam_number ON students(examination_number);
CREATE INDEX idx_results_student_id ON results(student_id);
CREATE INDEX idx_results_subject_id ON results(subject_id);
CREATE INDEX idx_teacher_assign_teacher_id ON teacher_class_assignments(teacher_id);
CREATE INDEX idx_teacher_assign_class_id ON teacher_class_assignments(class_id);


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
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins have full access to profiles" ON profiles FOR ALL USING (get_user_role() = 'admin');

-- CLASSES & SUBJECTS
CREATE POLICY "Anyone authenticated can read classes" ON classes FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to classes" ON classes FOR ALL USING (get_user_role() = 'admin');

CREATE POLICY "Anyone authenticated can read subjects" ON subjects FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to subjects" ON subjects FOR ALL USING (get_user_role() = 'admin');

-- STUDENTS
CREATE POLICY "Students can read their own record" ON students FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Teachers can read students in assigned classes" ON students FOR SELECT USING (
  get_user_role() = 'teacher' AND 
  class_id IN (
    SELECT class_id FROM teacher_class_assignments 
    JOIN teachers ON teachers.id = teacher_class_assignments.teacher_id 
    WHERE teachers.user_id = auth.uid()
  )
);
CREATE POLICY "Admins have full access to students" ON students FOR ALL USING (get_user_role() = 'admin');

-- TEACHERS & ASSIGNMENTS
CREATE POLICY "Teachers can read own record" ON teachers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins have full access to teachers" ON teachers FOR ALL USING (get_user_role() = 'admin');

CREATE POLICY "Teachers can read own assignments" ON teacher_class_assignments FOR SELECT USING (
  teacher_id IN (SELECT id FROM teachers WHERE user_id = auth.uid())
);
CREATE POLICY "Admins have full access to assignments" ON teacher_class_assignments FOR ALL USING (get_user_role() = 'admin');

-- RESULTS
CREATE POLICY "Students can read own results" ON results FOR SELECT USING (
  student_id IN (SELECT id FROM students WHERE user_id = auth.uid())
);

CREATE POLICY "Teachers can read results of assigned classes" ON results FOR SELECT USING (
  get_user_role() = 'teacher' AND 
  student_id IN (
    SELECT s.id FROM students s
    JOIN teacher_class_assignments tca ON s.class_id = tca.class_id
    JOIN teachers t ON tca.teacher_id = t.id
    WHERE t.user_id = auth.uid()
  )
);

CREATE POLICY "Teachers can insert results for assigned classes" ON results FOR INSERT WITH CHECK (
  get_user_role() = 'teacher' AND 
  student_id IN (
    SELECT s.id FROM students s
    JOIN teacher_class_assignments tca ON s.class_id = tca.class_id
    JOIN teachers t ON tca.teacher_id = t.id
    WHERE t.user_id = auth.uid()
  )
);

CREATE POLICY "Teachers can update results for assigned classes" ON results FOR UPDATE USING (
  get_user_role() = 'teacher' AND 
  student_id IN (
    SELECT s.id FROM students s
    JOIN teacher_class_assignments tca ON s.class_id = tca.class_id
    JOIN teachers t ON tca.teacher_id = t.id
    WHERE t.user_id = auth.uid()
  )
);

CREATE POLICY "Admins have full access to results" ON results FOR ALL USING (get_user_role() = 'admin');
