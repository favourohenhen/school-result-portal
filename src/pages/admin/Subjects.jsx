import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { fetchSubjects, createSubject, deleteSubject } from '../../services/admin'

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [isAdding, setIsAdding] = useState(false)
  const [subjectName, setSubjectName] = useState('')
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    loadSubjects()
  }, [])

  async function loadSubjects() {
    try {
      const data = await fetchSubjects()
      setSubjects(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddSubmit(e) {
    e.preventDefault()
    if (!subjectName.trim()) return setFormError('Subject name is required.')
    
    setFormLoading(true)
    setFormError('')

    try {
      await createSubject(subjectName.trim())
      setIsAdding(false)
      setSubjectName('')
      loadSubjects()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Are you sure you want to delete the subject "${name}"?`)) return
    
    try {
      await deleteSubject(id)
      loadSubjects()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <Layout role="admin" sidebar pageTitle="Manage Subjects">
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <Button onClick={() => setIsAdding(true)}>+ Add Subject</Button>
      </div>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <th style={{ padding: '16px 24px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Subject Name</th>
                <th style={{ padding: '16px 24px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Date Created</th>
                <th style={{ padding: '16px 24px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="3" style={{ padding: 24, textAlign: 'center' }}>Loading...</td></tr>
              ) : subjects.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ padding: 0 }}>
                    <div className="empty-state">
                      <div className="empty-state__icon">📖</div>
                      <h3>No subjects found</h3>
                      <p>You haven't added any subjects yet. Click the button above to create one.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                subjects.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 600 }}>{s.name}</td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(s.id, s.name)} style={{ color: '#d93025', borderColor: '#d93025' }}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Modal */}
      {isAdding && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
          <Card style={{ width: '100%', maxWidth: 400 }}>
            <Card.Header>
              <Card.Title>Add New Subject</Card.Title>
            </Card.Header>
            <Card.Body>
              {formError && <div className="alert alert--warning" style={{ marginBottom: 16 }}>{formError}</div>}
              
              <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Input 
                  label="Subject Name" 
                  value={subjectName} 
                  onChange={e => setSubjectName(e.target.value)} 
                  required 
                  placeholder="e.g. Mathematics" 
                  autoFocus
                />

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <Button type="button" variant="outline" onClick={() => setIsAdding(false)} disabled={formLoading} style={{ flex: 1 }}>Cancel</Button>
                  <Button type="submit" loading={formLoading} style={{ flex: 1 }}>Create Subject</Button>
                </div>
              </form>
            </Card.Body>
          </Card>
        </div>
      )}

    </Layout>
  )
}
