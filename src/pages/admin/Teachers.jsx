import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { fetchTeachers, fetchClasses, assignTeacherToClasses } from '../../services/admin'

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [isAssigning, setIsAssigning] = useState(false)
  const [currentTeacher, setCurrentTeacher] = useState(null)
  const [selectedClasses, setSelectedClasses] = useState([])
  
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [tData, cData] = await Promise.all([
        fetchTeachers(),
        fetchClasses()
      ])
      setTeachers(tData)
      setClasses(cData)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleAssignClick(teacher) {
    setCurrentTeacher(teacher)
    // Extract currently assigned class IDs
    const currentAssignments = teacher.teacher_class_assignments.map(a => a.class_id)
    setSelectedClasses(currentAssignments)
    setFormError('')
    setIsAssigning(true)
  }

  function toggleClass(classId) {
    setSelectedClasses(prev => 
      prev.includes(classId) 
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    )
  }

  async function handleAssignSubmit(e) {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')

    try {
      await assignTeacherToClasses(currentTeacher.id, selectedClasses)
      setIsAssigning(false)
      loadData() // Refresh assignments
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <Layout role="admin" sidebar pageTitle="Manage Teachers">

      <Card>
        <Card.Header>
          <Card.Title>Registered Teachers</Card.Title>
          <Card.Subtitle>Assign teachers to specific classes</Card.Subtitle>
        </Card.Header>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <th style={{ padding: '12px 16px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Teacher Name</th>
                <th style={{ padding: '12px 16px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Assigned Classes</th>
                <th style={{ padding: '12px 16px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)', whiteSpace: 'nowrap', width: '1%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" style={{ padding: 24, textAlign: 'center' }}>Loading...</td></tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ padding: 0 }}>
                    <div className="empty-state">
                      <div className="empty-state__icon">👨‍🏫</div>
                      <h3>No teachers registered</h3>
                      <p>Currently, there are no teachers registered in the system.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                teachers.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{t.full_name}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {t.teacher_class_assignments.length === 0 ? (
                        <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No classes assigned</span>
                      ) : (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {t.teacher_class_assignments.map(a => (
                            <span key={a.class_id} style={{ 
                              padding: '2px 8px', 
                              backgroundColor: '#e8f0fe', 
                              color: '#1a73e8', 
                              borderRadius: 12, 
                              fontSize: 12,
                              fontWeight: 500 
                            }}>
                              {a.classes.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', width: '1%' }}>
                      <Button variant="outline" size="sm" onClick={() => handleAssignClick(t)}>
                        Assign Classes
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Assign Modal */}
      {isAssigning && currentTeacher && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <Card style={{ width: '100%', maxWidth: 400, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <Card.Header>
              <Card.Title>Assign Classes</Card.Title>
              <Card.Subtitle>for {currentTeacher.full_name}</Card.Subtitle>
            </Card.Header>
            <Card.Body style={{ overflowY: 'auto' }}>
              {formError && <div className="alert alert--warning" style={{ marginBottom: 16 }}>{formError}</div>}
              
              <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {classes.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No classes exist yet. Please create classes first.</p>
                  ) : (
                    classes.map(c => (
                      <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 8 }}>
                        <input 
                          type="checkbox" 
                          checked={selectedClasses.includes(c.id)}
                          onChange={() => toggleClass(c.id)}
                          style={{ width: 18, height: 18 }}
                        />
                        <span style={{ fontWeight: 500 }}>{c.name}</span>
                      </label>
                    ))
                  )}
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <Button type="button" variant="outline" onClick={() => setIsAssigning(false)} disabled={formLoading} style={{ flex: 1 }}>Cancel</Button>
                  <Button type="submit" loading={formLoading} style={{ flex: 1 }}>Save Assignments</Button>
                </div>
              </form>
            </Card.Body>
          </Card>
        </div>
      )}

    </Layout>
  )
}
