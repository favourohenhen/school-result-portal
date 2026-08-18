import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { Input  } from '../components/Input'
import { loginStaff } from '../services/auth'
import { useAuth } from '../context/AuthContext'

export default function AdminLogin() {
  const [values, setValues]   = useState({ email: '', password: '' })
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
    if (!values.email.trim())    return setError('Please enter your email address.')
    if (!values.password.trim()) return setError('Please enter your password.')
    
    setLoading(true)
    setError('')

    try {
      const sessionData = await loginStaff(values.email.trim(), values.password)
      setSession(sessionData)
      
      // Role-based routing just in case a teacher logged in here
      if (sessionData.role === 'admin') {
        navigate('/admin/dashboard')
      } else if (sessionData.role === 'teacher') {
        navigate('/teacher/dashboard')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page" role="main">
      <div className="login-card">

        <div className="login-brand">
          <div className="login-brand__logo" aria-hidden="true">🏫</div>
          <h1 className="login-brand__title">School Result Portal</h1>
          <p className="login-brand__subtitle">Admin Portal Login</p>
        </div>

        {error && (
          <div className="alert alert--warning" style={{ marginBottom: 20 }} role="alert">
            ⚠ {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <Input
            id="email"
            name="email"
            label="Email Address"
            type="email"
            placeholder="admin@school.com"
            icon="✉️"
            required
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            disabled={loading}
          />
          <Input
            id="password"
            name="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            icon="🔐"
            required
            autoComplete="current-password"
            value={values.password}
            onChange={handleChange}
            disabled={loading}
          />
          <Button type="submit" fullWidth size="lg" loading={loading}>
            Sign In
          </Button>
        </form>

        <div className="login-footer">
          <p>Teacher? <Link to="/teacher/login">Teacher Login →</Link></p>
          <p style={{ marginTop: 8 }}>Student? <Link to="/login">Student Login →</Link></p>
        </div>

      </div>
    </div>
  )
}
