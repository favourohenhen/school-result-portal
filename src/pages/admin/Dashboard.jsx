/**
 * Page: Admin Dashboard  /admin/dashboard
 * Stat data fetched from Supabase in Phase 4.
 */
import { useEffect, useState } from 'react'
import { Layout  } from '../../components/Layout'
import { Card    } from '../../components/Card'
import { StatCard } from '../../components/Card'
import { Button  } from '../../components/Button'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { fetchDashboardStats } from '../../services/admin'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { session } = useAuth()
  
  const [stats, setStats] = useState({ students: 0, classes: 0, subjects: 0, results: 0 })
  const [loading, setLoading] = useState(true)

  // Protect route
  useEffect(() => {
    if (!session || session.role !== 'admin') {
      navigate('/admin/login', { replace: true })
    } else {
      loadStats()
    }
  }, [session, navigate])

  async function loadStats() {
    try {
      const data = await fetchDashboardStats()
      setStats(data)
    } catch (err) {
      console.error("Error loading stats:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!session || session.role !== 'admin') return null

  return (
    <Layout role="admin" sidebar pageTitle="Dashboard">

      <div className="page-header">
        <h2 className="page-title">Dashboard</h2>
        <p className="page-subtitle">Welcome back! School portal overview.</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon="👥" label="Total Students"   value={loading ? "..." : stats.students} id="stat-students" />
        <StatCard icon="🏫" label="Classes"          value={loading ? "..." : stats.classes}  id="stat-classes"  />
        <StatCard icon="📖" label="Subjects"         value={loading ? "..." : stats.subjects} id="stat-subjects" />
        <StatCard icon="📝" label="Results Recorded" value={loading ? "..." : stats.results}  id="stat-results"  />
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
            <Button size="sm" variant="secondary" onClick={() => navigate('/admin/classes')}>+ Add Class</Button>
            <Button size="sm" variant="secondary" onClick={() => navigate('/admin/subjects')}>+ Add Subject</Button>
          </div>
        </Card.Body>
      </Card>

    </Layout>
  )
}
