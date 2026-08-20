import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { fetchAssignedClasses, fetchStudentsByClass } from '../../services/teacher'
import { fetchSubjects, fetchAllResults } from '../../services/admin' // Shared fetchers
import { saveResult, updateResultScore } from '../../services/results'
import { useToast } from '../../components/Toast'

export default function TeacherResults() {
  const { showToast } = useToast()

  const [activeTab, setActiveTab] = useState('enter') // 'enter' | 'view'

  // Shared Data
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])

  // == ENTER RESULTS STATE ==
  const [students, setStudents] = useState([])
  const [enterFormData, setEnterFormData] = useState({
    classId: '',
    studentId: '',
    subjectId: '',
    term: 'First Term',
    session: '2026/2027',
    score: ''
  })
  const [enterLoading, setEnterLoading] = useState(false)
  const [enterError, setEnterError] = useState('')

  // == VIEW RESULTS STATE ==
  const [viewFilters, setViewFilters] = useState({
    classId: '',
    term: '',
    session: ''
  })
  const [results, setResults] = useState([])
  const [viewLoading, setViewLoading] = useState(false)

  // Edit Modal State
  const [editingResult, setEditingResult] = useState(null)
  const [editScore, setEditScore] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')

  useEffect(() => {
    loadInitialData()
  }, [])

  // When class changes in Entry form, fetch students for that class
  useEffect(() => {
    if (enterFormData.classId) {
      loadStudents(enterFormData.classId)
    } else {
      setStudents([])
      setEnterFormData(prev => ({ ...prev, studentId: '' }))
    }
  }, [enterFormData.classId])

  // When filters change in View tab, fetch results
  useEffect(() => {
    if (activeTab === 'view') {
      loadResults()
    }
  }, [viewFilters.classId, viewFilters.term, viewFilters.session, activeTab])

  async function loadInitialData() {
    try {
      const [cls, sub] = await Promise.all([fetchAssignedClasses(), fetchSubjects()])
      setClasses(cls)
      setSubjects(sub)
    } catch (err) {
      console.error(err)
    }
  }

  async function loadStudents(classId) {
    try {
      const data = await fetchStudentsByClass(classId)
      setStudents(data)
    } catch (err) {
      console.error(err)
    }
  }

  async function loadResults() {
    setViewLoading(true)
    try {
      const data = await fetchAllResults({
        classId: viewFilters.classId,
        term: viewFilters.term,
        session: viewFilters.session
      })
      setResults(data)
    } catch (err) {
      console.error(err)
    } finally {
      setViewLoading(false)
    }
  }

  async function handleEnterSubmit(e) {
    e.preventDefault()

    if (!enterFormData.studentId || !enterFormData.subjectId || !enterFormData.score || !enterFormData.term || !enterFormData.session) {
      return setEnterError('All fields are required.')
    }

    const scoreNum = parseFloat(enterFormData.score)
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      return setEnterError('Score must be a number between 0 and 100.')
    }

    setEnterLoading(true)
    setEnterError('')

    try {
      await saveResult(enterFormData)
      showToast('Result saved successfully!', 'success')
      // Clear score for rapid entry
      setEnterFormData(prev => ({ ...prev, score: '' }))
    } catch (err) {
      setEnterError(err.message)
    } finally {
      setEnterLoading(false)
    }
  }

  async function handleEditSubmit(e) {
    e.preventDefault()
    const scoreNum = parseFloat(editScore)
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      return setEditError('Score must be a number between 0 and 100.')
    }

    setEditLoading(true)
    setEditError('')

    try {
      await updateResultScore(editingResult.id, editScore)
      showToast('Score updated successfully!', 'success')
      setEditingResult(null)
      loadResults()
    } catch (err) {
      setEditError(err.message)
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <Layout role="teacher" sidebar pageTitle="Manage Results">

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h2 className="page-title">Manage Results</h2>
          <p className="page-subtitle">Enter new scores or edit existing ones.</p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-card)', padding: 4, borderRadius: 8, border: '1px solid var(--border-color)' }}>
          <button
            className={`btn btn--sm ${activeTab === 'enter' ? 'btn--primary' : 'btn--outline'}`}
            style={activeTab === 'enter' ? {} : { border: 'none' }}
            onClick={() => setActiveTab('enter')}
          >
            Enter Results
          </button>
          <button
            className={`btn btn--sm ${activeTab === 'view' ? 'btn--primary' : 'btn--outline'}`}
            style={activeTab === 'view' ? {} : { border: 'none' }}
            onClick={() => setActiveTab('view')}
          >
            View/Edit Results
          </button>
        </div>
      </div>

      {activeTab === 'enter' && (
        <Card style={{ maxWidth: 600, margin: '0 auto' }}>
          <Card.Header>
            <Card.Title>Result Entry Form</Card.Title>
          </Card.Header>
          <Card.Body>
            {enterError && <div className="alert alert--warning" style={{ marginBottom: 24 }}>{enterError}</div>}

            <form onSubmit={handleEnterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 200px' }}>
                  <Input
                    label="Session"
                    type="select"
                    options={[{ value: '2025/2026', label: '2025/2026' }, { value: '2026/2027', label: '2026/2027' }]}
                    value={enterFormData.session}
                    onChange={e => setEnterFormData({ ...enterFormData, session: e.target.value })}
                  />
                </div>
                <div style={{ flex: '1 1 200px' }}>
                  <Input
                    label="Term"
                    type="select"
                    options={[{ value: 'First Term', label: 'First Term' }, { value: 'Second Term', label: 'Second Term' }, { value: 'Third Term', label: 'Third Term' }]}
                    value={enterFormData.term}
                    onChange={e => setEnterFormData({ ...enterFormData, term: e.target.value })}
                  />
                </div>
              </div>

              <Input
                label="Select Assigned Class"
                type="select"
                options={[{ value: '', label: '-- Choose a class --' }, ...classes.map(c => ({ value: c.id, label: c.name }))]}
                value={enterFormData.classId}
                onChange={e => setEnterFormData({ ...enterFormData, classId: e.target.value })}
              />

              <Input
                label="Select Student"
                type="select"
                options={[{ value: '', label: enterFormData.classId ? '-- Choose a student --' : 'Select a class first' }, ...students.map(s => ({ value: s.id, label: `${s.full_name} (${s.examination_number})` }))]}
                value={enterFormData.studentId}
                onChange={e => setEnterFormData({ ...enterFormData, studentId: e.target.value })}
                disabled={!enterFormData.classId}
              />

              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <div style={{ flex: '2 1 200px' }}>
                  <Input
                    label="Select Subject"
                    type="select"
                    options={[{ value: '', label: '-- Choose a subject --' }, ...subjects.map(s => ({ value: s.id, label: s.name }))]}
                    value={enterFormData.subjectId}
                    onChange={e => setEnterFormData({ ...enterFormData, subjectId: e.target.value })}
                  />
                </div>
                <div style={{ flex: '1 1 100px' }}>
                  <Input
                    label="Score (0-100)"
                    type="number"
                    min="0"
                    max="100"
                    value={enterFormData.score}
                    onChange={e => setEnterFormData({ ...enterFormData, score: e.target.value })}
                    placeholder="e.g. 85"
                  />
                </div>
              </div>

              <Button type="submit" loading={enterLoading} style={{ marginTop: 8 }}>
                Save Result
              </Button>
            </form>
          </Card.Body>
        </Card>
      )}

      {activeTab === 'view' && (
        <Card>
          <div style={{ padding: 24, borderBottom: '1px solid var(--border-color)', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <Input
                label="Filter by Class"
                type="select"
                options={[{ value: '', label: 'All My Classes' }, ...classes.map(c => ({ value: c.id, label: c.name }))]}
                value={viewFilters.classId}
                onChange={e => setViewFilters({ ...viewFilters, classId: e.target.value })}
              />
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <Input
                label="Filter by Term"
                type="select"
                options={[{ value: '', label: 'All Terms' }, { value: 'First Term', label: 'First Term' }, { value: 'Second Term', label: 'Second Term' }, { value: 'Third Term', label: 'Third Term' }]}
                value={viewFilters.term}
                onChange={e => setViewFilters({ ...viewFilters, term: e.target.value })}
              />
            </div>
            <div style={{ flex: 1, minWidth: 150 }}>
              <Input
                label="Filter by Session"
                type="select"
                options={[{ value: '', label: 'All Sessions' }, { value: '2025/2026', label: '2025/2026' }, { value: '2026/2027', label: '2026/2027' }]}
                value={viewFilters.session}
                onChange={e => setViewFilters({ ...viewFilters, session: e.target.value })}
              />
            </div>
          </div>

          <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                  <th style={{ padding: '12px 16px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Student Name</th>
                  <th style={{ padding: '12px 16px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Class</th>
                  <th style={{ padding: '12px 16px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Subject</th>
                  <th style={{ padding: '12px 16px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Term / Session</th>
                  <th style={{ padding: '12px 16px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Score</th>
                  <th style={{ padding: '12px 16px', fontSize: 13, textTransform: 'uppercase', color: 'var(--text-secondary)', width: '1%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {viewLoading ? (
                  <tr className="admin-table-utility"><td colSpan="6" style={{ padding: 24, textAlign: 'center' }}>Loading...</td></tr>
                ) : results.length === 0 ? (
                  <tr className="admin-table-utility">
                    <td colSpan="6" style={{ padding: 0 }}>
                      <div className="empty-state">
                        <div className="empty-state__icon">📝</div>
                        <h3>No results found</h3>
                        <p>You haven't recorded any results matching these filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  results.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td data-label="Student Name" style={{ padding: '12px 16px', fontWeight: 500 }}>
                        <div>
                          {r.students.full_name}

                        </div>
                      </td>
                      <td data-label="Class" style={{ padding: '12px 16px' }}>{r.students.classes.name}</td>
                      <td data-label="Subject" style={{ padding: '12px 16px' }}>{r.subjects.name}</td>
                      <td data-label="Term / Session" style={{ padding: '12px 16px' }}>
                        <div>
                          {r.term}
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.session}</div>
                        </div>
                      </td>
                      <td data-label="Score" style={{ padding: '12px 16px', fontWeight: 600 }}>{r.score}</td>
                      <td data-label="Actions" style={{ padding: '12px 16px' }}>
                        <Button variant="outline" size="sm" onClick={() => {
                          setEditingResult(r)
                          setEditScore(r.score)
                        }}>Edit Score</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit Score Modal */}
      {editingResult && (
        <div className="edit-modal-overlay">
          <Card className="edit-modal-card">
            <Card.Header>
              <Card.Title>Edit Score</Card.Title>
            </Card.Header>
            <Card.Body>
              {editError && <div className="alert alert--warning" style={{ marginBottom: 16 }}>{editError}</div>}
              <div style={{ marginBottom: 16, padding: 12, background: 'rgba(0,0,0,0.02)', borderRadius: 8, fontSize: 14, wordBreak: 'break-word' }}>
                <strong>Student:</strong> {editingResult.students.full_name} <br />
                <strong>Subject:</strong> {editingResult.subjects.name} <br />
                <strong>Term:</strong> {editingResult.term} ({editingResult.session})
              </div>
              <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Input
                  label="New Score (0-100)"
                  type="number"
                  min="0"
                  max="100"
                  value={editScore}
                  onChange={e => setEditScore(e.target.value)}
                  required
                  autoFocus
                />
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <Button type="button" variant="outline" onClick={() => setEditingResult(null)} disabled={editLoading} style={{ flex: 1 }}>Cancel</Button>
                  <Button type="submit" loading={editLoading} style={{ flex: 1 }}>Update Score</Button>
                </div>
              </form>
            </Card.Body>
          </Card>
        </div>
      )}

    </Layout>
  )
}
