import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/Card'
import { useNavigate, useLocation } from 'react-router-dom'
import { fetchStudentById, fetchStudentResults } from '../../services/admin'

export default function AdminStudentResult() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search)
  const studentId = queryParams.get('id')
  const sessionVal = queryParams.get('session') || '2026/2027'
  const termVal = queryParams.get('term') || 'First Term'

  const [student, setStudent] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!studentId) {
      navigate('/admin/results', { replace: true })
      return
    }
    loadData()
  }, [studentId, sessionVal, termVal])

  async function loadData() {
    setLoading(true)
    try {
      const [studentData, resultsData] = await Promise.all([
        fetchStudentById(studentId),
        fetchStudentResults(studentId, sessionVal, termVal)
      ])
      
      setStudent(studentData)
      setResults(resultsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
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

  const totalScore = results.reduce((sum, r) => sum + Number(r.score), 0)
  const averageScore = results.length > 0 ? (totalScore / results.length).toFixed(1) : 0

  return (
    <Layout role="admin" sidebar pageTitle="Student Result">
      
      {loading ? (
        <div style={{ padding: 48, textAlign: 'center' }}>Loading report card...</div>
      ) : error ? (
        <div className="alert alert--warning">{error}</div>
      ) : (
        <>
          {/* Student Profile Header */}
          <Card style={{ marginBottom: 24, backgroundColor: 'var(--color-primary)', color: 'white' }}>
            <Card.Body style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 32 }}>
              <div style={{ width: 80, height: 80, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                🎓
              </div>
              <div>
                <h2 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px 0' }}>{student?.full_name}</h2>
                <div style={{ display: 'flex', gap: 16, opacity: 0.9, fontSize: 15 }}>
                  <span><strong style={{ opacity: 0.7 }}>Exam No:</strong> {student?.examination_number}</span>
                  <span><strong style={{ opacity: 0.7 }}>Class:</strong> {student?.classes?.name || 'Unassigned'}</span>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Results Table */}
          <Card>
            <Card.Header>
              <Card.Title>Result for {termVal} ({sessionVal})</Card.Title>
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
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ padding: 64, textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
                        <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>No Results Published</h3>
                        <p style={{ margin: 0, color: 'var(--text-secondary)' }}>No results have been recorded for {student?.full_name} in this term.</p>
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
        </>
      )}
    </Layout>
  )
}
