/**
 * AuthContext — Global auth state
 *
 * session shape:
 *   { role: 'student' | 'admin' | 'teacher', id: string, name: string, ... }
 */
import { createContext, useContext, useState, useEffect } from 'react'
import { getStudentSession, logoutStudent, logoutStaff, getStaffRole } from '../services/auth'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Check for student pseudo-session first (fast synchronous)
    const studentSession = getStudentSession()
    if (studentSession) {
      setSession(studentSession)
      setLoading(false)
    }

    // 2. Set up Supabase real auth listener for Staff
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      // If a student is logged in, we ignore Supabase auth changes unless it's a specific sign-out
      if (getStudentSession()) return

      if (currentSession?.user) {
        // Staff is logged in, fetch their role
        const role = await getStaffRole(currentSession.user.id)
        if (role) {
          setSession({
            ...currentSession.user,
            role
          })
        } else {
          // Fallback if no profile
          setSession(null)
        }
      } else {
        setSession(null)
      }
      setLoading(false)
    })

    // 3. Initial check for Supabase session (if no student session exists)
    if (!studentSession) {
      supabase.auth.getSession().then(async ({ data: { session: initSession } }) => {
        if (initSession?.user) {
          const role = await getStaffRole(initSession.user.id)
          if (role) {
            setSession({ ...initSession.user, role })
          }
        }
        setLoading(false)
      })
    }

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function logout() {
    if (session?.role === 'student') {
      logoutStudent()
    } else {
      await logoutStaff()
    }
    setSession(null)
  }

  return (
    <AuthContext.Provider value={{ session, setSession, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

/** Hook — use anywhere inside AuthProvider */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
