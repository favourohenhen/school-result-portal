/**
 * Page: Teacher Dashboard  /teacher/dashboard
 * Class data fetched from Supabase in Phase 5.
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { Card   } from '../../components/Card'
import { Button } from '../../components/Button'
import { useAuth } from '../../context/AuthContext'

const PLACEHOLDER_CLASSES = [
  { id: 1, name: 'JSS 1A', studentCount: '—' },
  { id: 2, name: 'SS 2B',  studentCount: '—' },
]

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const { session } = useAuth()

  // Protect route
  useEffect(() => {
    if (!session || session.role !== 'teacher') {
      navigate('/teacher/login', { replace: true })
    }
  }, [session, navigate])

  if (!session || session.role !== 'teacher') return null

  return (
    <Layout role="teacher" sidebar pageTitle="My Classes">

      <div className="page-header">
        <h2 className="page-title">My Classes</h2>
        <p className="page-subtitle">Classes assigned to you this session.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
        {PLACEHOLDER_CLASSES.map(cls => (
          <Card key={cls.id} hoverable>
            <Card.Body>
              <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
                <div style={{
                  width: 44, height: 44, flexShrink: 0,
                  background: 'rgba(0,11,90,0.08)', borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                }}>🏫</div>
                <div>
                  <div className="font-semibold">{cls.name}</div>
                  <div className="text-sm text-secondary">{cls.studentCount} students</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => navigate('/teacher/classes')}>
                  View Students
                </Button>
                <Button size="sm" variant="secondary" onClick={() => navigate('/teacher/results')}>
                  Enter Results
                </Button>
              </div>
            </Card.Body>
          </Card>
        ))}
      </div>

      <div className="alert alert--warning mt-6" role="note">
        ⚠ Real class assignments will load from Supabase in Phase 5.
      </div>

    </Layout>
  )
}
