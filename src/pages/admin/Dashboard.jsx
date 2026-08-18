/**
 * Page: Admin Dashboard  /admin/dashboard
 * Stat data fetched from Supabase in Phase 4.
 */
import { useEffect } from 'react'
import { Layout  } from '../../components/Layout'
import { Card    } from '../../components/Card'
import { StatCard } from '../../components/Card'
import { Button  } from '../../components/Button'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { session } = useAuth()

  // Protect route
  useEffect(() => {
    if (!session || session.role !== 'admin') {
      navigate('/admin/login', { replace: true })
    }
  }, [session, navigate])

  if (!session || session.role !== 'admin') return null

  return (
    <Layout role="admin" sidebar pageTitle="Dashboard">

      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>
        <p className="page-subtitle">Welcome back! School portal overview.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon="👥" label="Total Students"   value="—" id="stat-students" />
        <StatCard icon="🏫" label="Classes"          value="—" id="stat-classes"  />
        <StatCard icon="📖" label="Subjects"         value="—" id="stat-subjects" />
        <StatCard icon="📝" label="Results Recorded" value="—" id="stat-results"  />
      </div>

      {/* Quick actions */}
      <Card>
        <Card.Header>
          <div>
            <Card.Title>Quick Actions</Card.Title>
            <Card.Subtitle>Common administrative tasks</Card.Subtitle>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="flex flex-wrap gap-3">
            <Button size="sm" onClick={() => navigate('/admin/students')}>+ Add Student</Button>
            <Button size="sm" variant="secondary" onClick={() => navigate('/admin/teachers')}>+ Add Teacher</Button>
            <Button size="sm" variant="secondary" onClick={() => navigate('/admin/classes')}>+ Add Class</Button>
            <Button size="sm" variant="secondary" onClick={() => navigate('/admin/subjects')}>+ Add Subject</Button>
          </div>
        </Card.Body>
      </Card>

      <div className="alert alert--warning mt-6" role="note">
        ⚠ Dashboard statistics will load from Supabase in Phase 4.
      </div>

    </Layout>
  )
}
