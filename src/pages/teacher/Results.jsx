import { useState, useEffect } from 'react'
import { Layout } from '../../components/Layout'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { fetchAssignedClasses, fetchStudentsByClass } from '../../services/teacher'
import { fetchSubjects } from '../../services/admin' // Shared fetcher
import { saveResult } from '../../services/results'
import { useToast } from '../../components/Toast'

export default function TeacherResults() {
  const { showToast } = useToast()
  
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [students, setStudents] = useState([])
  
  const [formData, setFormData] = useState({
    classId: '',
    studentId: '',
    subjectId: '',
    term: 'First Term',
    session: '2026/2027',
    score: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadInitialData()
  }, [])

  // When class changes, fetch students for that class
  useEffect(() => {
    if (formData.classId) {
      loadStudents(formData.classId)
    } else {
      setStudents([])
      setFormData(prev => ({ ...prev, studentId: '' }))
    }
  }, [formData.classId])

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

  async function handleSubmit(e) {
    e.preventDefault()
    
    if (!formData.studentId || !formData.subjectId || !formData.score || !formData.term || !formData.session) {
      return setError('All fields are required.')
    }

    const scoreNum = parseFloat(formData.score)
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      return setError('Score must be a number between 0 and 100.')
    }

    setLoading(true)
    setError('')

    try {
      await saveResult(formData)
      showToast('Result saved successfully!', 'success')
      // Clear score for rapid entry, but keep the rest of the form context
      setFormData(prev => ({ ...prev, score: '' }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout role="teacher" sidebar pageTitle="Enter Results">
      
      <div className="page-header">
        <h2 className="page-title">Record Results</h2>
        <p className="page-subtitle">Enter scores for students in your assigned classes.</p>
      </div>

      <Card style={{ maxWidth: 600, margin: '0 auto' }}>
        <Card.Header>
          <Card.Title>Result Entry Form</Card.Title>
        </Card.Header>
        <Card.Body>
          {error && <div className="alert alert--warning" style={{ marginBottom: 24 }}>{error}</div>}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Step 1: Context */}
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <Input 
                  label="Session" 
                  type="select" 
                  options={[{value: '2025/2026', label: '2025/2026'}, {value: '2026/2027', label: '2026/2027'}]}
                  value={formData.session}
                  onChange={e => setFormData({...formData, session: e.target.value})}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Input 
                  label="Term" 
                  type="select" 
                  options={[{value: 'First Term', label: 'First Term'}, {value: 'Second Term', label: 'Second Term'}, {value: 'Third Term', label: 'Third Term'}]}
                  value={formData.term}
                  onChange={e => setFormData({...formData, term: e.target.value})}
                />
              </div>
            </div>

            {/* Step 2: Student */}
            <Input 
              label="Select Assigned Class" 
              type="select" 
              options={[{value: '', label: '-- Choose a class --'}, ...classes.map(c => ({value: c.id, label: c.name}))]}
              value={formData.classId}
              onChange={e => setFormData({...formData, classId: e.target.value})}
            />

            <Input 
              label="Select Student" 
              type="select" 
              options={[{value: '', label: formData.classId ? '-- Choose a student --' : 'Select a class first'}, ...students.map(s => ({value: s.id, label: `${s.full_name} (${s.examination_number})`}))]}
              value={formData.studentId}
              onChange={e => setFormData({...formData, studentId: e.target.value})}
              disabled={!formData.classId}
            />

            {/* Step 3: Score */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
              <div style={{ flex: 2 }}>
                <Input 
                  label="Select Subject" 
                  type="select" 
                  options={[{value: '', label: '-- Choose a subject --'}, ...subjects.map(s => ({value: s.id, label: s.name}))]}
                  value={formData.subjectId}
                  onChange={e => setFormData({...formData, subjectId: e.target.value})}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Input 
                  label="Score (0-100)" 
                  type="number"
                  min="0"
                  max="100"
                  value={formData.score}
                  onChange={e => setFormData({...formData, score: e.target.value})}
                  placeholder="e.g. 85"
                />
              </div>
            </div>

            <Button type="submit" loading={loading} style={{ marginTop: 8 }}>
              Save Result
            </Button>

          </form>
        </Card.Body>
      </Card>

    </Layout>
  )
}
