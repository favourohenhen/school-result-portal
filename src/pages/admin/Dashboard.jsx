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

      {/* School Setup */}
      <h3 style={{ marginTop: '24px', marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>School Setup</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <Card style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => navigate('/admin/teachers')}>
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>👨‍🏫</div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>Manage Teachers</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Add staff & assign classes</p>
          </div>
        </Card>
        
        <Card style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => navigate('/admin/classes')}>
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏫</div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>Manage Classes</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Add & organize classrooms</p>
          </div>
        </Card>

        <Card style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => navigate('/admin/subjects')}>
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📖</div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>Manage Subjects</h4>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Add subjects offered</p>
          </div>
        </Card>
      </div>

    </Layout>
  )
}
