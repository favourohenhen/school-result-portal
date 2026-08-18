import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/Card'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchAssignedClasses, fetchStudentsByClass } from '../../services/teacher'

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { session } = useAuth()
  
  const [classes, setClasses] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(true)
  
  const [selectedClass, setSelectedClass] = useState(null)
  const [students, setStudents] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  // Protect route
  useEffect(() => {
    if (!session || session.role !== 'teacher') {
      navigate('/teacher/login', { replace: true })
    } else {
      loadClasses()
    }
  }, [session, navigate])

  async function loadClasses() {
    try {
      const data = await fetchAssignedClasses()
      setClasses(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingClasses(false)
    }
  }

  async function handleClassSelect(cls) {
    setSelectedClass(cls)
    setLoadingStudents(true)
    try {
      const data = await fetchStudentsByClass(cls.id)
      setStudents(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingStudents(false)
    }
  }

  if (!session || session.role !== 'teacher') return null

  return (
    <Layout role="teacher" sidebar pageTitle="Dashboard">

      <div className="page-header">
        <h2 className="page-title">My Classes</h2>
        <p className="page-subtitle">Select an assigned class to view your students.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'start' }}>
        
        {/* Left Column: Classes */}
        <Card>
          <Card.Header>
            <Card.Title>Assigned Classes</Card.Title>
          </Card.Header>
          <div style={{ padding: 24 }}>
            {loadingClasses ? (
              <p>Loading your classes...</p>
            ) : classes.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>You have not been assigned to any classes yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {classes.map(cls => (
                  <button 
                    key={cls.id}
                    onClick={() => handleClassSelect(cls)}
                    style={{
                      padding: '16px',
                      borderRadius: 12,
                      border: selectedClass?.id === cls.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                      backgroundColor: selectedClass?.id === cls.id ? 'rgba(26, 115, 232, 0.05)' : 'white',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontWeight: 500,
                      transition: 'all 0.2s',
                    }}
                  >
                    {cls.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Right Column: Students */}
        <Card>
          <Card.Header>
            <Card.Title>
              {selectedClass ? `Students in ${selectedClass.name}` : 'Student List'}
            </Card.Title>
          </Card.Header>
          
          {!selectedClass ? (
            <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>
              👈 Select a class from the left to view students.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    <th style={{ padding: '16px 24px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Student Name</th>
                    <th style={{ padding: '16px 24px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Exam No.</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingStudents ? (
                    <tr><td colSpan="2" style={{ padding: 24, textAlign: 'center' }}>Loading students...</td></tr>
                  ) : students.length === 0 ? (
                    <tr><td colSpan="2" style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>No students in this class.</td></tr>
                  ) : (
                    students.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '16px 24px', fontWeight: 600 }}>{s.full_name}</td>
                        <td style={{ padding: '16px 24px', fontFamily: 'monospace' }}>{s.examination_number}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>

      </div>

    </Layout>
  )
}
