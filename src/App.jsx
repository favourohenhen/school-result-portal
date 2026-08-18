/**
 * App.jsx — Root component
 *
 * Routes:
 *   /login              → Student login
 *   /admin/login        → Staff login (Admin + Teacher)
 *   /admin/dashboard    → Admin dashboard
 *   /teacher/dashboard  → Teacher dashboard
 *   /student/dashboard  → Student dashboard
 *
 * Auth guards added in Phase 3 / 4.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider  } from './context/AuthContext'
import { ToastProvider } from './components/Toast'

import Login           from './pages/Login'
import AdminLogin      from './pages/AdminLogin'
import TeacherLogin    from './pages/TeacherLogin'
import AdminDashboard  from './pages/admin/Dashboard'
import TeacherDashboard from './pages/teacher/Dashboard'
import StudentDashboard from './pages/student/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Student */}
            <Route path="/login"             element={<Login />} />
            <Route path="/student/dashboard" element={<StudentDashboard />} />

            {/* Staff */}
            <Route path="/admin/login"       element={<AdminLogin />} />
            <Route path="/teacher/login"     element={<TeacherLogin />} />
            <Route path="/admin/dashboard"   element={<AdminDashboard />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />

            {/* Redirect root and unknown paths to student login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
