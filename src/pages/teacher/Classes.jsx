import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchAssignedClasses, fetchStudentsByClass, fetchClassResults } from '../../services/teacher'

export default function TeacherClasses() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session } = useAuth()
  
  // Parse classId from URL query string
  const queryParams = new URLSearchParams(location.search)
  const initialClassId = queryParams.get('classId')
  
  const [classes, setClasses] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(true)
  
  const [selectedClassId, setSelectedClassId] = useState(initialClassId || '')
  const [students, setStudents] = useState([])
  const [resultsDict, setResultsDict] = useState({}) // student_id -> count of results
  const [loadingStudents, setLoadingStudents] = useState(false)

  const [filters, setFilters] = useState({
    session: '2026/2027',
    term: 'First Term'
  })

  // Protect route
  useEffect(() => {
    if (!session || session.role !== 'teacher') {
      navigate('/admin/login', { replace: true })
    } else {
      loadClasses()
    }
  }, [session, navigate])

  // Reload student data when filters or selected class change
  useEffect(() => {
    if (selectedClassId) {
      loadStudentsAndResults(selectedClassId, filters.session, filters.term)
    } else {
      setStudents([])
    }
  }, [filters, selectedClassId])

  async function loadClasses() {
    try {
      const data = await fetchAssignedClasses()
      setClasses(data)
      
      // If no class is selected and they have classes, select the first one automatically
      if (!initialClassId && data.length > 0) {
        setSelectedClassId(data[0].id)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingClasses(false)
    }
  }

  async function loadStudentsAndResults(classId, sessionYear, term) {
    setLoadingStudents(true)
    try {
      const [studentsData, resultsData] = await Promise.all([
        fetchStudentsByClass(classId),
        fetchClassResults(classId, sessionYear, term)
      ])
      
      setStudents(studentsData)

      const dict = {}
      resultsData.forEach(r => {
        if (!dict[r.student_id]) dict[r.student_id] = 0
        dict[r.student_id]++
      })
      setResultsDict(dict)

    } catch (err) {
      console.error(err)
    } finally {
      setLoadingStudents(false)
    }
  }

  if (!session || session.role !== 'teacher') return null

  return (
    <Layout role="teacher" sidebar pageTitle="My Classes">

      <div className="page-header">
        <h2 className="page-title">Class Tracker</h2>
        <p className="page-subtitle">Track result entry progress for all students in your class.</p>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px' }}>
          <Input 
            label="Select Class" 
            type="select" 
            options={[{value: '', label: '-- Select a class --'}, ...classes.map(c => ({value: c.id, label: c.name}))]}
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            disabled={loadingClasses}
          />
        </div>
        <div style={{ flex: '0 1 200px' }}>
          <Input 
            label="Session" 
            type="select" 
            options={[{value: '2025/2026', label: '2025/2026'}, {value: '2026/2027', label: '2026/2027'}]}
            value={filters.session}
            onChange={e => setFilters({...filters, session: e.target.value})}
          />
        </div>
        <div style={{ flex: '0 1 200px' }}>
          <Input 
            label="Term" 
            type="select" 
            options={[{value: 'First Term', label: 'First Term'}, {value: 'Second Term', label: 'Second Term'}, {value: 'Third Term', label: 'Third Term'}]}
            value={filters.term}
            onChange={e => setFilters({...filters, term: e.target.value})}
          />
        </div>
      </div>

      <Card>
        {!selectedClassId ? (
          <div className="empty-state">
            <div className="empty-state__icon">🏫</div>
            <h3>No Class Selected</h3>
            <p>Please select a class from the dropdown above to view students.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                  <th style={{ padding: '12px 16px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Student Name</th>
                  <th style={{ padding: '12px 16px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)', maxWidth: '120px' }}>Exam No.</th>
                  <th style={{ padding: '12px 16px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)', whiteSpace: 'nowrap', width: '1%' }}>Result Status</th>
                </tr>
              </thead>
              <tbody>
                {loadingStudents ? (
                  <tr><td colSpan="3" style={{ padding: 24, textAlign: 'center' }}>Loading student data...</td></tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ padding: 0 }}>
                      <div className="empty-state">
                        <div className="empty-state__icon">👥</div>
                        <h3>No students registered</h3>
                        <p>There are currently no students registered in this class.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  students.map(s => {
                    const count = resultsDict[s.id] || 0
                    const isRecorded = count > 0

                    return (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{s.full_name}</td>
                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', maxWidth: '120px' }}>
                          {s.examination_number.includes('/') ? (
                            <>{s.examination_number.split('/')[0]}/<br className="mobile-break" />{s.examination_number.split('/')[1]}</>
                          ) : s.examination_number}
                        </td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', width: '1%' }}>
                          {isRecorded ? (
                            <span className="status-badge status-badge--success">
                              <span className="status-badge__main">✅ Recorded</span>
                              <span className="status-badge__sub">({count} subjects)</span>
                            </span>
                          ) : (
                            <span className="status-badge status-badge--error">
                              ❌ Unrecorded
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Layout>
  )
}
