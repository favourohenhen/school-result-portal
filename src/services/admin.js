import { supabase } from '../lib/supabase'
import { hashPin } from './auth'

// ============================================================================
// PHASE 5: Admin Student Management Service
// ============================================================================

export async function fetchClasses() {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .order('name')
  
  if (error) throw new Error(error.message)
  return data
}

export async function fetchDashboardStats() {
  // Run count queries in parallel
  const [studentsRes, classesRes, subjectsRes] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('classes').select('*', { count: 'exact', head: true }),
    supabase.from('subjects').select('*', { count: 'exact', head: true })
  ])

  return {
    students: studentsRes.count || 0,
    classes: classesRes.count || 0,
    subjects: subjectsRes.count || 0,
    results: 0 // Will implement in Phase 7
  }
}

export async function createClass(name) {
  const { data, error } = await supabase
    .from('classes')
    .insert([{ name }])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('This class already exists.')
    throw new Error(error.message)
  }
  return data
}

export async function fetchSubjects() {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .order('name')
  
  if (error) throw new Error(error.message)
  return data
}

export async function createSubject(name) {
  const { data, error } = await supabase
    .from('subjects')
    .insert([{ name }])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('This subject already exists.')
    throw new Error(error.message)
  }
  return data
}

export async function deleteClass(id) {
  const { error } = await supabase.from('classes').delete().eq('id', id)
  if (error) {
    if (error.code === '23503') {
      throw new Error('Cannot delete this class because there are students assigned to it.')
    }
    throw new Error(error.message)
  }
}

export async function deleteSubject(id) {
  const { error } = await supabase.from('subjects').delete().eq('id', id)
  if (error) {
    if (error.code === '23503') {
      throw new Error('Cannot delete this subject because it is already being used.')
    }
    throw new Error(error.message)
  }
}

export async function fetchTeachers() {
  const { data, error } = await supabase
    .from('teachers')
    .select(`
      *,
      teacher_class_assignments (
        class_id,
        classes (
          name
        )
      )
    `)
    .order('full_name')
  
  if (error) throw new Error(error.message)
  return data
}

export async function assignTeacherToClasses(teacherId, classIds) {
  // First, delete existing assignments for this teacher
  const { error: deleteError } = await supabase
    .from('teacher_class_assignments')
    .delete()
    .eq('teacher_id', teacherId)
  
  if (deleteError) throw new Error(deleteError.message)

  // If there are classes to assign, insert them
  if (classIds && classIds.length > 0) {
    const payloads = classIds.map(classId => ({
      teacher_id: teacherId,
      class_id: classId
    }))

    const { error: insertError } = await supabase
      .from('teacher_class_assignments')
      .insert(payloads)
    
    if (insertError) throw new Error(insertError.message)
  }
}

export async function fetchStudents(searchQuery = '', classId = '') {
  let query = supabase
    .from('students')
    .select(`
      id, full_name, examination_number, code_status,
      classes ( id, name )
    `)
    .order('created_at', { ascending: false })

  if (searchQuery) {
    query = query.or(`full_name.ilike.%${searchQuery}%,examination_number.ilike.%${searchQuery}%`)
  }

  if (classId) {
    query = query.eq('class_id', classId)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data
}

export async function createStudent(studentData) {
  // Hash the DOB directly as the student's permanent PIN
  const code_hash = await hashPin(studentData.dob)

  const { data, error } = await supabase
    .from('students')
    .insert([{
      full_name: studentData.fullName,
      examination_number: studentData.examNumber,
      phone_number: studentData.phone || null,
      class_id: studentData.classId,
      code_hash: code_hash,
      code_status: 'active'
    }])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') { // Postgres unique violation error code
      throw new Error('This Examination Number already exists.')
    }
    throw new Error(error.message)
  }

  return { student: data }
}

export async function updateStudent(studentId, studentData) {
  const { data, error } = await supabase
    .from('students')
    .update({
      full_name: studentData.fullName,
      examination_number: studentData.examNumber,
      phone_number: studentData.phone || null,
      class_id: studentData.classId,
    })
    .eq('id', studentId)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') { // Postgres unique violation error code
      throw new Error('This Examination Number already exists.')
    }
    throw new Error(error.message)
  }
  
  return { student: data }
}
