import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { useNavigate } from 'react-router-dom'
import { fetchClasses, fetchStudents } from '../../services/admin'

export default function AdminResults() {
  const navigate = useNavigate()
  
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  
  const [filters, setFilters] = useState({
    session: '2026/2027',
    term: 'First Term',
    classId: '',
    search: ''
  })
  
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadClasses()
  }, [])

  // Refetch students when filters change
  useEffect(() => {
    loadStudents()
  }, [filters.classId, filters.search])

  async function loadClasses() {
    try {
      const cls = await fetchClasses()
      setClasses(cls)
    } catch (err) {
      console.error(err)
    }
  }

  async function loadStudents() {
    setLoading(true)
    try {
      const data = await fetchStudents(filters.search, filters.classId)
      setStudents(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleViewStudent(studentId) {
    const params = new URLSearchParams({
      id: studentId,
      session: filters.session,
      term: filters.term
    })
    navigate(`/admin/results/student?${params.toString()}`)
  }

  return (
    <Layout role="admin" sidebar pageTitle="View Results">
      
      <div className="page-header">
        <h2 className="page-title">School Results Viewer</h2>
        <p className="page-subtitle">Select a session and term, then pick a student to view their detailed report card.</p>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Card.Header>
          <Card.Title>Result Context</Card.Title>
        </Card.Header>
        <Card.Body style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          
          <div style={{ flex: '1 1 200px' }}>
            <Input 
              label="Active Session" 
              type="select" 
              options={[{value: '2025/2026', label: '2025/2026'}, {value: '2026/2027', label: '2026/2027'}]}
              value={filters.session}
              onChange={e => setFilters({...filters, session: e.target.value})}
            />
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <Input 
              label="Active Term" 
              type="select" 
              options={[{value: 'First Term', label: 'First Term'}, {value: 'Second Term', label: 'Second Term'}, {value: 'Third Term', label: 'Third Term'}]}
              value={filters.term}
              onChange={e => setFilters({...filters, term: e.target.value})}
            />
          </div>

        </Card.Body>
      </Card>

      <Card>
        <Card.Header style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Card.Title>Student Directory</Card.Title>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
            <div style={{ flex: '1 1 150px', maxWidth: 300 }}>
              <Input 
                placeholder="Search name/exam no..." 
                value={filters.search}
                onChange={e => setFilters({...filters, search: e.target.value})}
              />
            </div>
            <div style={{ flex: '1 1 150px', maxWidth: 300 }}>
              <Input 
                type="select" 
                options={[{value: '', label: 'All Classes'}, ...classes.map(c => ({value: c.id, label: c.name}))]}
                value={filters.classId}
                onChange={e => setFilters({...filters, classId: e.target.value})}
              />
            </div>
          </div>
        </Card.Header>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <th style={{ padding: '16px 24px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Student Name</th>
                <th style={{ padding: '16px 24px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)', maxWidth: '120px' }}>Exam No.</th>
                <th style={{ padding: '16px 24px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Class</th>
                <th style={{ padding: '16px 24px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)', whiteSpace: 'nowrap', width: '1%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ padding: 24, textAlign: 'center' }}>Loading students...</td></tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ padding: 0 }}>
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
                    <td style={{ padding: '16px 24px', fontWeight: 600 }}>{s.full_name}</td>
                    <td style={{ padding: '16px 24px', fontFamily: 'monospace', wordBreak: 'break-all', maxWidth: '120px' }}>{s.examination_number}</td>
                    <td style={{ padding: '16px 24px' }}>{s.classes?.name || '—'}</td>
                    <td style={{ padding: '16px 24px', whiteSpace: 'nowrap', width: '1%' }}>
                      <Button variant="outline" size="sm" onClick={() => handleViewStudent(s.id)}>
                        View Results →
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </Layout>
  )
}
