-- ==============================================================================
-- PHASE 3: Student Authentication RPC (Production-Secure via RPC)
-- ==============================================================================
-- This function runs securely inside the Supabase database.
-- It verifies the student's examination number and PIN without exposing the
-- database rows directly to the frontend.

CREATE OR REPLACE FUNCTION verify_student_login(p_exam_number text, p_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges to safely check the students table
AS $$
DECLARE
  v_student record;
BEGIN
  -- 1. Lookup the student by their unique examination number
  SELECT * INTO v_student FROM students WHERE examination_number = p_exam_number;
  
  -- If no student found, return a generic error to prevent enumeration attacks
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'message', 'Invalid examination number or PIN');
  END IF;

  -- 2. Verify the PIN (code_hash)
  IF v_student.code_hash = p_code THEN 
    -- Return success and the student details needed for the frontend session
    RETURN json_build_object(
      'success', true, 
      'student_id', v_student.id,
      'full_name', v_student.full_name
    );
  ELSE
    RETURN json_build_object('success', false, 'message', 'Invalid examination number or PIN');
  END IF;
END;
$$;
