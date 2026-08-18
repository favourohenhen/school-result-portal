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

function generatePin() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function createStudent(studentData, enablePin) {
  let pinPlaintext = null
  let code_hash = null
  let code_status = 'inactive'

  if (enablePin) {
    pinPlaintext = generatePin()
    code_hash = await hashPin(pinPlaintext)
    code_status = 'active'
  }

  const { data, error } = await supabase
    .from('students')
    .insert([{
      full_name: studentData.fullName,
      examination_number: studentData.examNumber,
      phone_number: studentData.phone || null,
      class_id: studentData.classId,
      code_hash,
      code_status
    }])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') { // Postgres unique violation error code
      throw new Error('This Examination Number already exists.')
    }
    throw new Error(error.message)
  }

  return { student: data, generatedPin: pinPlaintext }
}

export async function resetStudentPin(studentId) {
  const pinPlaintext = generatePin()
  const code_hash = await hashPin(pinPlaintext)

  const { data, error } = await supabase
    .from('students')
    .update({ code_hash, code_status: 'active' })
    .eq('id', studentId)
    .select('full_name')
    .single()

  if (error) throw new Error(error.message)

  return { studentName: data.full_name, newPin: pinPlaintext }
}
