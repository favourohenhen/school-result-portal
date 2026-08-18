import { supabase } from '../lib/supabase'
import { getStudentSession, hashPin } from './auth'

/**
 * Fetches the currently authenticated student's profile via RPC.
 */
export async function fetchMyProfile() {
  const session = getStudentSession()
  if (!session) throw new Error('Not logged in')

  const hashedPin = await hashPin(session.pin)

  const { data, error } = await supabase.rpc('get_student_profile', {
    p_exam_number: session.examNumber,
    p_code: hashedPin
  })

  if (error) throw new Error(error.message)
  return data
}

/**
 * Fetches the authenticated student's results for a specific term and session via RPC.
 */
export async function fetchMyResults(sessionYear, term) {
  const session = getStudentSession()
  if (!session) throw new Error('Not logged in')

  const hashedPin = await hashPin(session.pin)

  const { data, error } = await supabase.rpc('get_student_results', {
    p_exam_number: session.examNumber,
    p_code: hashedPin,
    p_session: sessionYear,
    p_term: term
  })

  if (error) throw new Error(error.message)
  return data
}
