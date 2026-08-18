import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { fetchMyProfile, fetchMyResults } from '../../services/student'

export default function StudentDashboard() {
  const { session } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [results, setResults] = useState([])
  
  const [filters, setFilters] = useState({
    session: '2026/2027',
    term: 'First Term'
  })
  
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingResults, setLoadingResults] = useState(false)
  const [error, setError] = useState('')

  // Protect route
  useEffect(() => {
    if (!session || session.role !== 'student') {
      navigate('/login', { replace: true })
    } else {
      loadProfile()
    }
  }, [session, navigate])

  // Load results whenever filters change (and profile is loaded)
  useEffect(() => {
    if (profile) {
      loadResults()
    }
  }, [filters, profile])

  async function loadProfile() {
    try {
      const data = await fetchMyProfile()
      setProfile(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingProfile(false)
    }
  }

  async function loadResults() {
    setLoadingResults(true)
    setError('')
    try {
      const data = await fetchMyResults(filters.session, filters.term)
      setResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingResults(false)
    }
  }

  function getGrade(score) {
    if (score >= 70) return { letter: 'A', color: '#137333', bg: '#e6f4ea' }
    if (score >= 60) return { letter: 'B', color: '#185abc', bg: '#e8f0fe' }
    if (score >= 50) return { letter: 'C', color: '#b06000', bg: '#fef7e0' }
    if (score >= 45) return { letter: 'D', color: '#b06000', bg: '#fef7e0' }
    if (score >= 40) return { letter: 'E', color: '#c5221f', bg: '#fce8e6' }
    return { letter: 'F', color: '#c5221f', bg: '#fce8e6' }
  }

  if (!session || session.role !== 'student') return null

  // Calculate Averages
  const totalScore = results.reduce((sum, r) => sum + Number(r.score), 0)
  const averageScore = results.length > 0 ? (totalScore / results.length).toFixed(1) : 0

  return (
    <Layout role="student" sidebar pageTitle="Dashboard">

      {/* Profile Section */}
      <Card style={{ marginBottom: 24, backgroundColor: 'var(--color-primary)', color: 'white' }}>
        <Card.Body style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 32 }}>
          <div style={{ width: 80, height: 80, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
            🎓
          </div>
          <div>
            {loadingProfile ? (
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0, opacity: 0.7 }}>Loading Profile...</h2>
            ) : profile ? (
              <>
                <h2 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0' }}>{profile.full_name}</h2>
                <div style={{ display: 'flex', gap: 16, opacity: 0.9, fontSize: 15 }}>
                  <span><strong style={{ opacity: 0.7 }}>Exam No:</strong> {profile.examination_number}</span>
                  <span><strong style={{ opacity: 0.7 }}>Class:</strong> {profile.classes?.name || 'Unassigned'}</span>
                </div>
              </>
            ) : (
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Profile Error</h2>
            )}
          </div>
        </Card.Body>
      </Card>

      {error && <div className="alert alert--warning" style={{ marginBottom: 24 }}>{error}</div>}

      {/* Filters & Results */}
      {profile && (
        <Card>
          <Card.Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <Card.Title>My Results</Card.Title>
            
            <div style={{ display: 'flex', gap: 12 }}>
              <Input 
                type="select" 
                options={[{value: '2025/2026', label: '2025/2026'}, {value: '2026/2027', label: '2026/2027'}]}
                value={filters.session}
                onChange={e => setFilters({...filters, session: e.target.value})}
              />
              <Input 
                type="select" 
                options={[{value: 'First Term', label: 'First Term'}, {value: 'Second Term', label: 'Second Term'}, {value: 'Third Term', label: 'Third Term'}]}
                value={filters.term}
                onChange={e => setFilters({...filters, term: e.target.value})}
              />
            </div>
          </Card.Header>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                  <th style={{ padding: '16px 24px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Subject</th>
                  <th style={{ padding: '16px 24px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Score (100)</th>
                  <th style={{ padding: '16px 24px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Grade</th>
                </tr>
              </thead>
              <tbody>
                {loadingResults ? (
                  <tr><td colSpan="3" style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading your results...</td></tr>
                ) : results.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ padding: 64, textAlign: 'center' }}>
                      <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                      <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>No Results Published</h3>
                      <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Your results for {filters.term} {filters.session} have not been published yet.</p>
                    </td>
                  </tr>
                ) : (
                  <>
                    {results.map(r => {
                      const grade = getGrade(r.score)
                      return (
                        <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '16px 24px', fontWeight: 600 }}>{r.subjects?.name || 'Unknown'}</td>
                          <td style={{ padding: '16px 24px', fontWeight: 500, fontSize: 16 }}>{r.score}</td>
                          <td style={{ padding: '16px 24px' }}>
                            <span style={{
                              padding: '6px 12px',
                              borderRadius: 8,
                              fontWeight: 700,
                              backgroundColor: grade.bg,
                              color: grade.color,
                            }}>
                              {grade.letter}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                    {/* Summary Footer */}
                    <tr style={{ backgroundColor: 'rgba(0, 11, 90, 0.05)' }}>
                      <td style={{ padding: '24px', fontWeight: 700, textAlign: 'right', color: 'var(--color-primary)' }}>TERM SUMMARY:</td>
                      <td style={{ padding: '24px' }}>
                        <div style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Score</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-primary)' }}>{totalScore}</div>
                      </td>
                      <td style={{ padding: '24px' }}>
                        <div style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Average Score</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-primary)' }}>{averageScore}%</div>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

    </Layout>
  )
}
