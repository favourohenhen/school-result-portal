import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { fetchClasses, fetchStudents, createStudent, resetStudentPin } from '../../services/admin'

export default function AdminStudents() {
  // Data state
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  // Filter state
  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('')

  // Modal states
  const [isAdding, setIsAdding] = useState(false)
  const [pinReveal, setPinReveal] = useState(null) // { name, pin }

  // Form state
  const [formData, setFormData] = useState({ fullName: '', examNumber: '', phone: '', classId: '', enablePin: true })
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

  async function handleAddSubmit(e) {
    e.preventDefault()
    if (!formData.fullName || !formData.examNumber || !formData.classId) {
      return setFormError('Name, Examination Number, and Class are required.')
    }

    setFormLoading(true)
    setFormError('')

    try {
      const { generatedPin } = await createStudent(formData, formData.enablePin)
      setIsAdding(false)
      setFormData({ fullName: '', examNumber: '', phone: '', classId: '', enablePin: true })
      loadStudents() // refresh list

      if (generatedPin) {
        setPinReveal({ name: formData.fullName, pin: generatedPin })
      }
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  async function handleResetPin(studentId, studentName) {
    if (!window.confirm(`Are you sure you want to reset the PIN for ${studentName}? The old PIN will immediately stop working.`)) return
    
    try {
      const { newPin } = await resetStudentPin(studentId)
      setPinReveal({ name: studentName, pin: newPin })
      loadStudents()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <Layout role="admin" sidebar pageTitle="Manage Students">
      
      {/* Top Actions */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Input 
            label="Search Students" 
            placeholder="Name or Exam Number..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ width: 200 }}>
          <Input 
            label="Filter by Class" 
            type="select"
            options={[{value: '', label: 'All Classes'}, ...classes.map(c => ({ value: c.id, label: c.name }))]}
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAdding(true)}>+ Add Student</Button>
      </div>

      {/* Student List */}
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <th style={{ padding: '16px 24px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Student Name</th>
                <th style={{ padding: '16px 24px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Exam No.</th>
                <th style={{ padding: '16px 24px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Class</th>
                <th style={{ padding: '16px 24px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>PIN Status</th>
                <th style={{ padding: '16px 24px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: 24, textAlign: 'center' }}>Loading...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>No students found.</td></tr>
              ) : (
                students.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 600 }}>{s.full_name}</td>
                    <td style={{ padding: '16px 24px', fontFamily: 'monospace' }}>{s.examination_number}</td>
                    <td style={{ padding: '16px 24px' }}>{s.classes?.name || '—'}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ 
                        padding: '4px 8px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                        backgroundColor: s.code_status === 'active' ? '#e6f4ea' : '#f8f9fa',
                        color: s.code_status === 'active' ? '#137333' : '#5f6368'
                      }}>
                        {s.code_status === 'active' ? 'Active' : 'No PIN'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <Button variant="outline" size="sm" onClick={() => handleResetPin(s.id, s.full_name)}>
                        Reset PIN
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Student Modal */}
      {isAdding && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <Card style={{ width: '100%', maxWidth: 500 }}>
            <Card.Header>
              <Card.Title>Add New Student</Card.Title>
            </Card.Header>
            <Card.Body>
              {formError && <div className="alert alert--warning" style={{ marginBottom: 16 }}>{formError}</div>}
              
              <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Input label="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required />
                <Input label="Examination Number" value={formData.examNumber} onChange={e => setFormData({...formData, examNumber: e.target.value})} required placeholder="e.g. 2026/001" />
                <Input label="Phone (Optional)" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                
                <Input 
                  label="Class" 
                  type="select" 
                  options={[{value: '', label: 'Select a class...'}, ...classes.map(c => ({ value: c.id, label: c.name }))]}
                  value={formData.classId} 
                  onChange={e => setFormData({...formData, classId: e.target.value})} 
                  required 
                />

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 8, padding: 12, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 8 }}>
                  <input type="checkbox" checked={formData.enablePin} onChange={e => setFormData({...formData, enablePin: e.target.checked})} style={{ width: 18, height: 18 }} />
                  <span style={{ fontWeight: 500 }}>Generate Access PIN?</span>
                </label>

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <Button type="button" variant="outline" onClick={() => setIsAdding(false)} disabled={formLoading} style={{ flex: 1 }}>Cancel</Button>
                  <Button type="submit" loading={formLoading} style={{ flex: 1 }}>Create Student</Button>
                </div>
              </form>
            </Card.Body>
          </Card>
        </div>
      )}

      {/* PIN Reveal Modal (CRITICAL) */}
      {pinReveal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: 16 }}>
          <Card style={{ width: '100%', maxWidth: 450, textAlign: 'center' }}>
            <Card.Body>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔑</div>
              <h2 style={{ marginBottom: 8 }}>Student Created!</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.5 }}>
                Here is the access PIN for <strong>{pinReveal.name}</strong>.<br/>
                <span style={{ color: '#d93025', fontWeight: 600 }}>Please write it down or copy it now. For security reasons, you will NEVER be able to see this PIN again.</span>
              </p>
              
              <div style={{ backgroundColor: '#f1f3f4', padding: 24, borderRadius: 12, fontSize: 36, fontWeight: 800, letterSpacing: 4, marginBottom: 24 }}>
                {pinReveal.pin}
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <Button variant="outline" style={{ flex: 1 }} onClick={() => navigator.clipboard.writeText(pinReveal.pin).then(() => alert('Copied!'))}>
                  Copy to Clipboard
                </Button>
                <Button style={{ flex: 1 }} onClick={() => setPinReveal(null)}>
                  I have saved it
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}

    </Layout>
  )
}
