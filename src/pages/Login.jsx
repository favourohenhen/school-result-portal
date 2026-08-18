import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Input  } from '../components/Input'
import { loginStudent } from '../services/auth'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [values, setValues]   = useState({ examNumber: '', pin: '' })
  const [error,  setError]    = useState('')
  const [loading, setLoading] = useState(false)
  
  const { setSession } = useAuth()
  const navigate = useNavigate()

  function handleChange(e) {
    setError('')
    setValues(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!values.examNumber.trim()) return setError('Please enter your Examination Number.')
    if (!values.pin.trim())        return setError('Please enter your PIN.')
    
    setLoading(true)
    setError('')

    try {
      const sessionData = await loginStudent(values.examNumber.trim(), values.pin.trim())
      // Save to global context and redirect
      setSession(sessionData)
      navigate('/student/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page" role="main">
      <div className="login-card">

        <div className="login-brand">
          <div className="login-brand__logo" aria-hidden="true">🎓</div>
          <h1 className="login-brand__title">School Result Portal</h1>
          <p className="login-brand__subtitle">Student Portal — View your results</p>
        </div>

        {error && (
          <div className="alert alert--warning" style={{ marginBottom: 20 }} role="alert">
            ⚠ {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <Input
            id="examNumber"
            name="examNumber"
            label="Examination Number"
            placeholder="e.g. 2026/00123"
            icon="🎫"
            required
            autoComplete="off"
            value={values.examNumber}
            onChange={handleChange}
            disabled={loading}
          />
          <Input
            id="pin"
            name="pin"
            label="PIN"
            type="password"
            placeholder="Enter your PIN"
            icon="🔑"
            required
            autoComplete="current-password"
            value={values.pin}
            onChange={handleChange}
            disabled={loading}
          />
          <Button type="submit" fullWidth size="lg" loading={loading}>
            Log In
          </Button>
        </form>

        <div className="login-footer">
          <p>Staff member? <Link to="/admin/login">Staff Login →</Link></p>
        </div>

      </div>
    </div>
  )
}
