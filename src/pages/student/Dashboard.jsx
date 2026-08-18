/**
 * Page: Student Dashboard  /student/dashboard
 * Results and student data fetched in Phase 3.
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import { useAuth } from '../../context/AuthContext'

const TERM_OPTIONS = [
  { value: '', label: 'All Terms' },
  { value: 'First Term', label: 'First Term' },
  { value: 'Second Term', label: 'Second Term' },
  { value: 'Third Term', label: 'Third Term' },
]

const SESSION_OPTIONS = [
  { value: '', label: 'All Sessions' },
  { value: '2025/2026', label: '2025/2026' },
  { value: '2024/2025', label: '2024/2025' },
]

export default function StudentDashboard() {
  const [term, setTerm] = useState('')
  const [sessionValue, setSessionValue] = useState('')
  
  const { session } = useAuth()
  const navigate = useNavigate()

  // Protect the route: Redirect to login if no student session exists
  useEffect(() => {
    if (!session || session.role !== 'student') {
      navigate('/login', { replace: true })
    }
  }, [session, navigate])

  if (!session) return null // Prevent flash before redirect

  return (
    <Layout role="student" pageTitle="My Results">

      {/* Student info banner */}
      <Card style={{ marginBottom: 24 }}>
        <Card.Body>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <div style={{
              width: 52, height: 52, flexShrink: 0,
              background: 'linear-gradient(135deg,#000B5A,#6A3A9D)',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 22, color: '#fff',
            }}>🎓</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 16, flex: 1 }}>
              {[
                ['Name', session.name || '—', 'studentName'],
                ['Examination Number', session.examNumber || '—', 'studentExam'],
                ['Class', '—', 'studentClass'],
              ].map(([label, val, id]) => (
                <div key={id}>
                  <p className="text-xs text-secondary font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '.05em' }}>
                    {label}
                  </p>
                  <p className="font-semibold" id={id}>{val}</p>
                </div>
              ))}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Filters */}
      <div className="filter-bar">
        <Input
          id="filterTerm"
          label="Term"
          type="select"
          options={TERM_OPTIONS}
          value={term}
          onChange={e => setTerm(e.target.value)}
        />
        <Input
          id="filterSession"
          label="Session"
          type="select"
          options={SESSION_OPTIONS}
          value={sessionValue}
          onChange={e => setSessionValue(e.target.value)}
        />
      </div>

      {/* Results */}
      <Card>
        <Card.Header>
          <div>
            <Card.Title>My Results</Card.Title>
            <Card.Subtitle>Your academic performance</Card.Subtitle>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="empty-state">
            <div className="empty-state__icon" aria-hidden="true">📋</div>
            <p className="empty-state__title">No results yet</p>
            <p className="empty-state__message">
              Your results will appear here once your teacher records them.
            </p>
          </div>
        </Card.Body>
      </Card>

    </Layout>
  )
}
