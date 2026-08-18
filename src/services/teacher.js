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
