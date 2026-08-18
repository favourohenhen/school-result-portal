import { supabase } from '../lib/supabase'

/**
 * Saves a student's result.
 * If a result already exists for this exact student + subject + term + session,
 * it will automatically update the score instead of duplicating it.
 * 
 * RLS Policies automatically ensure:
 * - Admins can save for anyone.
 * - Teachers can ONLY save for students in their assigned classes.
 */
export async function saveResult({ studentId, subjectId, score, term, session }) {
  const { data, error } = await supabase
    .from('results')
    .upsert(
      {
        student_id: studentId,
        subject_id: subjectId,
        score: parseFloat(score),
        term,
        session
      },
      {
        onConflict: 'student_id, subject_id, term, session'
      }
    )
    .select()

  if (error) throw new Error(error.message)
  return data
}
