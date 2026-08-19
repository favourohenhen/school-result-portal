import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { fetchClasses, fetchStudents, createStudent, updateStudent } from '../../services/admin'

export default function AdminStudents() {
  // Data state
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter state
  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)

  // Form state
  const defaultForm = { firstName: '', middleName: '', lastName: '', examNumber: '', phone: '', classId: '', dob: '' }
  const [formData, setFormData] = useState(defaultForm)
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  // Refetch when filters change
  useEffect(() => {
    loadStudents()
  }, [search, filterClass])

  async function loadData() {
    try {
      const cls = await fetchClasses()
      setClasses(cls)
      await loadStudents()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadStudents() {
    try {
      const studs = await fetchStudents(search, filterClass)
      setStudents(studs)
    } catch (err) {
      console.error(err)
    }
  }

  function handleAddClick() {
    setEditingId(null)
    setFormData(defaultForm)
    setFormError('')
    setIsModalOpen(true)
  }

  function handleEditClick(student) {
    setEditingId(student.id)
    
    // Heuristically split the full name into parts for the edit form
    const parts = student.full_name.split(' ')
    const firstName = parts[0] || ''
    const lastName = parts.length > 1 ? parts[parts.length - 1] : ''
    const middleName = parts.length > 2 ? parts.slice(1, -1).join(' ') : ''

    setFormData({
      firstName,
      middleName,
      lastName,
      examNumber: student.examination_number,
      phone: student.phone_number || '',
      classId: student.classes?.id || '',
      dob: '' // DOB is not editable
    })
    setFormError('')
    setIsModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!formData.firstName || !formData.lastName || !formData.examNumber || !formData.classId) {
      return setFormError('First Name, Last Name, Examination Number, and Class are required.')
    }

    if (!editingId && !formData.dob) {
      return setFormError('Date of Birth is required when adding a new student.')
    }

    setFormLoading(true)
    setFormError('')

    // Concatenate the full name for the database
    const fullName = [formData.firstName, formData.middleName, formData.lastName]
      .filter(Boolean)
      .join(' ')
      .trim()

    const payload = {
      fullName,
      examNumber: formData.examNumber,
      phone: formData.phone,
      classId: formData.classId,
      dob: formData.dob
    }

    try {
      if (editingId) {
        await updateStudent(editingId, payload)
      } else {
        await createStudent(payload)
      }
      
      setIsModalOpen(false)
      loadStudents()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <Layout role="admin" sidebar pageTitle="Manage Students">
      
      {/* Top Actions */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 200px' }}>
          <Input 
            label="Search Students" 
            placeholder="Name or Exam Number..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ flex: '1 1 200px' }}>
          <Input 
            label="Filter by Class" 
            type="select"
            options={[{value: '', label: 'All Classes'}, ...classes.map(c => ({ value: c.id, label: c.name }))]}
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
          />
        </div>
        <Button onClick={handleAddClick}>+ Add Student</Button>
      </div>

      {/* Student List */}
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <th style={{ padding: '12px 16px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Student Name</th>
                <th style={{ padding: '12px 16px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)', maxWidth: '120px' }}>Exam No.</th>
                <th style={{ padding: '12px 16px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Class</th>
                <th style={{ padding: '12px 16px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)', whiteSpace: 'nowrap', width: '1%' }}>Status</th>
                <th style={{ padding: '12px 16px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)', whiteSpace: 'nowrap', width: '1%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: 24, textAlign: 'center' }}>Loading...</td></tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: 0 }}>
                    <div className="empty-state">
                      <div className="empty-state__icon">👥</div>
                      <h3>No students found</h3>
                      <p>We couldn't find any students matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                students.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{s.full_name}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', maxWidth: '120px' }}>
                      {s.examination_number.includes('/') ? (
                        <>{s.examination_number.split('/')[0]}/<br className="mobile-break" />{s.examination_number.split('/')[1]}</>
                      ) : s.examination_number}
                    </td>
                    <td style={{ padding: '12px 16px' }}>{s.classes?.name || '—'}</td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', width: '1%' }}>
                      <span className="status-badge status-badge--success">
                        <span className="status-badge__main">Active</span>
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', width: '1%' }}>
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(s)}>
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <Card style={{ width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <Card.Header>
              <Card.Title>{editingId ? 'Edit Student' : 'Add New Student'}</Card.Title>
            </Card.Header>
            <Card.Body>
              {formError && <div className="alert alert--warning" style={{ marginBottom: 16 }}>{formError}</div>}
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <Input label="First Name *" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Input label="Last Name *" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
                  </div>
                </div>

                <Input label="Middle / Other Name (Optional)" value={formData.middleName} onChange={e => setFormData({...formData, middleName: e.target.value})} />
                
                <Input label="Examination Number *" value={formData.examNumber} onChange={e => setFormData({...formData, examNumber: e.target.value})} required placeholder="e.g. 2026/001" />
                <Input label="Phone (Optional)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                
                <Input 
                  label="Class *" 
                  type="select" 
                  options={[{value: '', label: 'Select a class...'}, ...classes.map(c => ({ value: c.id, label: c.name }))]}
                  value={formData.classId} 
                  onChange={e => setFormData({...formData, classId: e.target.value})} 
                  required 
                />

                {!editingId && (
                  <Input 
                    label="Date of Birth / Fallback PIN *" 
                    value={formData.dob} 
                    onChange={e => setFormData({...formData, dob: e.target.value})} 
                    required 
                    placeholder="e.g. 2010/04 or 2000/01" 
                  />
                )}

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={formLoading} style={{ flex: 1 }}>Cancel</Button>
                  <Button type="submit" loading={formLoading} style={{ flex: 1 }}>{editingId ? 'Save Changes' : 'Create Student'}</Button>
                </div>
              </form>
            </Card.Body>
          </Card>
        </div>
      )}

    </Layout>
  )
}
