import { supabase } from '../lib/supabase'

/**
 * PHASE 3: Student Authentication Service (RPC-Based)
 * 
 * Instead of issuing a JWT, we use a Postgres RPC to securely verify the PIN.
 * We store the exam number and PIN in sessionStorage so that future data fetches
 * (like getting results) can re-verify the PIN via another secure RPC.
 * This guarantees production security without a complex JWT stack.
 */

const SESSION_KEY = 'portal_student_session'

export async function loginStudent(examNumber, pin) {
  // Call the secure RPC function inside Supabase
  const { data, error } = await supabase.rpc('verify_student_login', {
    p_exam_number: examNumber,
    p_code: pin
  })

  // Handle network or RPC errors
  if (error) {
    console.error("Supabase RPC Error:", error)
    throw new Error(`Database Error: ${error.message}`)
  }

  // Handle invalid credentials
  if (!data.success) {
    throw new Error(data.message)
  }

  // Success: Store the student data as our session, INCLUDING the PIN
  // The PIN will be sent behind the scenes when fetching results to ensure security.
  const sessionData = {
    id: data.student_id,
    name: data.full_name,
    examNumber: examNumber,
    pin: pin, // Kept in memory/sessionStorage to secure future RPC calls
    role: 'student'
  }
  
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData))
  return sessionData
}

export function getStudentSession() {
  try {
    const sessionStr = sessionStorage.getItem(SESSION_KEY)
    return sessionStr ? JSON.parse(sessionStr) : null
  } catch (err) {
    return null
  }
}

export function logoutStudent() {
  sessionStorage.removeItem(SESSION_KEY)
}

// ============================================================================
// PHASE 4: Staff Authentication Service
// ============================================================================

export async function loginStaff(email, password) {
  // 1. Authenticate with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw new Error(`Login Failed: ${error.message}`)
  }

  // 2. Fetch their role from the profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', data.user.id)
    .single()

  if (profileError || !profile) {
    // If no profile found, sign them out for security
    await supabase.auth.signOut()
    throw new Error('Access Denied: No staff profile found for this account.')
  }

  // Return combined user and role
  return {
    ...data.user,
    role: profile.role
  }
}

export async function logoutStaff() {
  await supabase.auth.signOut()
}

export async function getStaffRole(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .single()
  
  if (error) return null
  return data.role
}
