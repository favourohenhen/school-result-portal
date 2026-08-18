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
  const [classStats, setClassStats] = useState({}) // classId -> student count
  const [loading, setLoading] = useState(true)

  // Protect route
  useEffect(() => {
    if (!session || session.role !== 'teacher') {
      navigate('/admin/login', { replace: true })
    } else {
      loadClasses()
    }
  }, [session, navigate])

  async function loadClasses() {
    try {
      const data = await fetchAssignedClasses()
      setClasses(data)
      
      // Fetch student count for each class to show on dashboard
      const stats = {}
      for (const cls of data) {
        const students = await fetchStudentsByClass(cls.id)
        stats[cls.id] = students.length
      }
      setClassStats(stats)

    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!session || session.role !== 'teacher') return null

  return (
    <Layout role="teacher" sidebar pageTitle="Dashboard">

      <div className="page-header">
        <h2 className="page-title">Welcome back!</h2>
        <p className="page-subtitle">Here is a quick overview of your assigned classes.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'start' }}>
        
        {loading ? (
          <p>Loading your dashboard...</p>
        ) : classes.length === 0 ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <Card>
              <div className="empty-state" style={{ padding: 48 }}>
                <div className="empty-state__icon">🏫</div>
                <h3>No Classes Assigned</h3>
                <p>You have not been assigned to any classes yet. Please contact the administrator.</p>
              </div>
            </Card>
          </div>
        ) : (
          classes.map(cls => (
            <Card key={cls.id} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ padding: 24, flex: 1 }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>📚</div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 24, color: 'var(--text-primary)' }}>{cls.name}</h3>
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                  {classStats[cls.id] !== undefined ? `${classStats[cls.id]} Students Registered` : 'Loading students...'}
                </p>
              </div>
              <div style={{ padding: '16px 24px', backgroundColor: 'rgba(0,0,0,0.02)', borderTop: '1px solid var(--border-color)' }}>
                <button 
                  className="btn btn--primary" 
                  style={{ width: '100%' }}
                  onClick={() => navigate(`/teacher/classes?classId=${cls.id}`)}
                >
                  View Full Class →
                </button>
              </div>
            </Card>
          ))
        )}

      </div>
    </Layout>
  )
}
