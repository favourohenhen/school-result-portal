import { supabase } from '../lib/supabase'

/**
 * Fetches the classes currently assigned to the logged-in teacher.
 * Row Level Security (RLS) guarantees they only see their own assignments.
 */
export async function fetchAssignedClasses() {
  const { data, error } = await supabase
    .from('teacher_class_assignments')
    .select(`
      class_id,
      classes (
        id,
        name
      )
    `)
  
  if (error) throw new Error(error.message)
  
  // Flatten the payload for the UI
  return data.map(a => a.classes).sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Fetches all students in a specific class.
 * RLS guarantees the teacher can only read students if they are assigned to that class.
 */
export async function fetchStudentsByClass(classId) {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('class_id', classId)
    .order('full_name')

  if (error) throw new Error(error.message)
  return data
}

/**
 * Fetches all results for a specific class, term, and session.
 * Used by the Dashboard to track which students have results recorded.
 */
export async function fetchClassResults(classId, session, term) {
  let query = supabase
    .from('results')
    .select('student_id, subjects(id)')
    .eq('session', session)
    .eq('term', term)

  // Wait, RLS automatically filters results for the teacher, but we also 
  // want to filter specifically by the selected class to limit data payload.
  // The results table doesn't have class_id, but the UI only cares about
  // the students in `students` array, so we can just fetch all teacher's results 
  // for this term/session, and the frontend will map them to the class students.
  
  const { data, error } = await query
  
  if (error) throw new Error(error.message)
  return data
}
