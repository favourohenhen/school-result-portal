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
import AdminStudents   from './pages/admin/Students'
import AdminClasses    from './pages/admin/Classes'
import AdminSubjects   from './pages/admin/Subjects'
import AdminTeachers   from './pages/admin/Teachers'
import AdminResults    from './pages/admin/Results'
import AdminStudentResult from './pages/admin/StudentResult'
import TeacherDashboard from './pages/teacher/Dashboard'
import TeacherClasses  from './pages/teacher/Classes'
import TeacherResults  from './pages/teacher/Results'
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
            <Route path="/admin/students"    element={<AdminStudents />} />
            <Route path="/admin/classes"     element={<AdminClasses />} />
            <Route path="/admin/subjects"    element={<AdminSubjects />} />
            <Route path="/admin/teachers"    element={<AdminTeachers />} />
            <Route path="/admin/results"     element={<AdminResults />} />
            <Route path="/admin/results/student" element={<AdminStudentResult />} />
            
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/classes"   element={<TeacherClasses />} />
            <Route path="/teacher/results"   element={<TeacherResults />} />

            {/* Redirect root and unknown paths to student login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
