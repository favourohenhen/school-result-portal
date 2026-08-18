import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { fetchClasses, fetchStudents, fetchAllResults } from '../../services/admin'

export default function AdminResults() {
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [results, setResults] = useState([])
  
  const [filters, setFilters] = useState({
    session: '2026/2027',
    term: 'First Term',
    classId: '',
    studentId: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadClasses()
  }, [])

  // When class changes, fetch students for that class
  useEffect(() => {
    if (filters.classId) {
      loadStudents(filters.classId)
    } else {
      setStudents([])
      setFilters(prev => ({ ...prev, studentId: '' }))
    }
  }, [filters.classId])

  async function loadClasses() {
    try {
      const cls = await fetchClasses()
      setClasses(cls)
    } catch (err) {
      console.error(err)
    }
  }

  async function loadStudents(classId) {
    try {
      const data = await fetchStudents('', classId)
      setStudents(data)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleLoadResults(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await fetchAllResults(filters)
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout role="admin" sidebar pageTitle="View Results">
      
      <div className="page-header">
        <h2 className="page-title">School Results Viewer</h2>
        <p className="page-subtitle">View scores recorded by teachers across the school.</p>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Card.Header>
          <Card.Title>Filter Results</Card.Title>
        </Card.Header>
        <Card.Body>
          {error && <div className="alert alert--warning" style={{ marginBottom: 24 }}>{error}</div>}
          
          <form onSubmit={handleLoadResults} style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            
            <div style={{ flex: '1 1 150px' }}>
              <Input 
                label="Session" 
                type="select" 
                options={[{value: '', label: 'All Sessions'}, {value: '2025/2026', label: '2025/2026'}, {value: '2026/2027', label: '2026/2027'}]}
                value={filters.session}
                onChange={e => setFilters({...filters, session: e.target.value})}
              />
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <Input 
                label="Term" 
                type="select" 
                options={[{value: '', label: 'All Terms'}, {value: 'First Term', label: 'First Term'}, {value: 'Second Term', label: 'Second Term'}, {value: 'Third Term', label: 'Third Term'}]}
                value={filters.term}
                onChange={e => setFilters({...filters, term: e.target.value})}
              />
            </div>

            <div style={{ flex: '2 1 200px' }}>
              <Input 
                label="Class (Optional)" 
                type="select" 
                options={[{value: '', label: 'All Classes'}, ...classes.map(c => ({value: c.id, label: c.name}))]}
                value={filters.classId}
                onChange={e => setFilters({...filters, classId: e.target.value})}
              />
            </div>

            <div style={{ flex: '2 1 200px' }}>
              <Input 
                label="Student (Optional)" 
                type="select" 
                options={[{value: '', label: filters.classId ? 'All Students in Class' : 'Select a class first'}, ...students.map(s => ({value: s.id, label: `${s.full_name} (${s.examination_number})`}))]}
                value={filters.studentId}
                onChange={e => setFilters({...filters, studentId: e.target.value})}
                disabled={!filters.classId}
              />
            </div>

            <Button type="submit" loading={loading} style={{ height: 42 }}>
              Load Results
            </Button>
          </form>
        </Card.Body>
      </Card>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <th style={{ padding: '16px 24px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Student Name</th>
                <th style={{ padding: '16px 24px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Class</th>
                <th style={{ padding: '16px 24px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Subject</th>
                <th style={{ padding: '16px 24px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Score</th>
                <th style={{ padding: '16px 24px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Term / Session</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: 24, textAlign: 'center' }}>Loading results...</td></tr>
              ) : results.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>No results found for these filters.</td></tr>
              ) : (
                results.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 600 }}>
                      {r.students.full_name}
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 400, fontFamily: 'monospace' }}>
                        {r.students.examination_number}
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px' }}>{r.students.classes?.name || '—'}</td>
                    <td style={{ padding: '16px 24px', fontWeight: 500 }}>{r.subjects?.name || '—'}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        padding: '4px 8px', borderRadius: 4, fontWeight: 600,
                        backgroundColor: r.score >= 50 ? '#e6f4ea' : '#fce8e6',
                        color: r.score >= 50 ? '#137333' : '#c5221f'
                      }}>
                        {r.score}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: 14 }}>
                      {r.term} <br/> {r.session}
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
