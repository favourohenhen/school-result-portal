import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { fetchClasses, createClass, deleteClass } from '../../services/admin'

export default function AdminClasses() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [isAdding, setIsAdding] = useState(false)
  const [className, setClassName] = useState('')
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    loadClasses()
  }, [])

  async function loadClasses() {
    try {
      const data = await fetchClasses()
      setClasses(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddSubmit(e) {
    e.preventDefault()
    if (!className.trim()) return setFormError('Class name is required.')
    
    setFormLoading(true)
    setFormError('')

    try {
      await createClass(className.trim())
      setIsAdding(false)
      setClassName('')
      loadClasses()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`Are you sure you want to delete the class "${name}"?`)) return
    
    try {
      await deleteClass(id)
      loadClasses()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <Layout role="admin" sidebar pageTitle="Manage Classes">
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <Button onClick={() => setIsAdding(true)}>+ Add Class</Button>
      </div>

      <Card>
        <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <th style={{ padding: '12px 16px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Class Name</th>
                <th style={{ padding: '12px 16px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)', whiteSpace: 'nowrap', width: '1%' }}>Date Created</th>
                <th style={{ padding: '12px 16px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)', whiteSpace: 'nowrap', width: '1%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="admin-table-utility"><td colSpan="3" style={{ padding: 24, textAlign: 'center' }}>Loading...</td></tr>
              ) : classes.length === 0 ? (
                <tr className="admin-table-utility">
                  <td colSpan="3" style={{ padding: 0 }}>
                    <div className="empty-state">
                      <div className="empty-state__icon">🏫</div>
                      <h3>No classes found</h3>
                      <p>You haven't added any classes yet. Click the button above to create your first class.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                classes.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td data-label="Class Name" style={{ padding: '12px 16px', fontWeight: 600 }}>{c.name}</td>
                    <td data-label="Date Created" style={{ padding: '12px 16px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', width: '1%' }}>
                      {c.created_at ? new Date(c.created_at).toLocaleDateString('en-GB') : 'N/A'}
                    </td>
                    <td data-label="Actions" style={{ padding: '12px 16px', whiteSpace: 'nowrap', width: '1%' }}>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(c.id, c.name)} style={{ color: '#d93025', borderColor: '#d93025' }}>
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
          <Card style={{ width: '100%', maxWidth: 400, maxHeight: '90vh', overflowY: 'auto' }}>
            <Card.Header>
              <Card.Title>Add New Class</Card.Title>
            </Card.Header>
            <Card.Body>
              {formError && <div className="alert alert--warning" style={{ marginBottom: 16 }}>{formError}</div>}
              
              <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Input 
                  label="Class Name" 
                  value={className} 
                  onChange={e => setClassName(e.target.value)} 
                  required 
                  placeholder="e.g. JSS 1A" 
                  autoFocus
                />

                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <Button type="button" variant="outline" onClick={() => setIsAdding(false)} disabled={formLoading} style={{ flex: 1 }}>Cancel</Button>
                  <Button type="submit" loading={formLoading} style={{ flex: 1 }}>Create Class</Button>
                </div>
              </form>
            </Card.Body>
          </Card>
        </div>
      )}

    </Layout>
  )
}
