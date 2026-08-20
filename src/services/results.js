import { supabase } from '../lib/supabase'

/**
 * Saves a student's result.
 * If a result already exists for this exact student + subject + term + session,
 * it will throw an error to prevent accidental overwriting.
 * 
 * RLS Policies automatically ensure:
 * - Admins can save for anyone.
 * - Teachers can ONLY save for students in their assigned classes.
 */
export async function saveResult({ studentId, subjectId, score, term, session }) {
  const { data, error } = await supabase
    .from('results')
    .insert([
      {
        student_id: studentId,
        subject_id: subjectId,
        score: parseFloat(score),
        term,
        session
      }
    ])
    .select()

  if (error) {
    if (error.code === '23505') {
      throw new Error('This result already exists. Please go to the View/Edit tab to update it.')
    }
    throw new Error(error.message)
  }
  return data
}

/**
 * Updates an existing result score.
 */
export async function updateResultScore(resultId, newScore) {
  const { data, error } = await supabase
    .from('results')
    .update({ score: parseFloat(newScore), updated_at: new Date().toISOString() })
    .eq('id', resultId)
    .select()

  if (error) throw new Error(error.message)
  return data
}
