/**
 * Layout Component
 *
 * Two modes:
 *  - sidebar={true}  → Admin / Teacher (sidebar + topbar)
 *  - sidebar={false} → Student (site header)
 *
 * Usage:
 *   <Layout role="admin" sidebar pageTitle="Dashboard">
 *     <PageContent />
 *   </Layout>
 */
import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/* ── Nav definitions ──────────────────────────────────────────── */
const NAV = {
  admin: [
    { icon: '📊', label: 'Dashboard',     to: '/admin/dashboard' },
    { icon: '👥', label: 'Students',      to: '/admin/students'  },
    { icon: '📝', label: 'Record Result', to: '/admin/results'   },
  ],
  teacher: [
    { icon: '📊', label: 'Dashboard',     to: '/teacher/dashboard' },
    { icon: '🏫', label: 'My Classes',    to: '/teacher/classes'   },
    { icon: '📝', label: 'Enter Results', to: '/teacher/results'   },
  ],
  student: [
    { icon: '📋', label: 'My Results', to: '/student/dashboard' },
  ],
}

const ROLE_LABEL = { admin: 'Admin', teacher: 'Teacher', student: 'Student' }

/* ── Sidebar layout ───────────────────────────────────────────── */
function SidebarLayout({ children, role, pageTitle }) {
  const [open, setOpen]  = useState(false)
  const { logout }       = useAuth()
  const navigate         = useNavigate()
  const location         = useLocation()
  const items            = NAV[role] ?? []

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="sidebar-layout">

      {/* Mobile overlay */}
      {open && (
        <div
          className="sidebar-overlay visible"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`sidebar${open ? ' open' : ''}`}
        aria-label="Portal navigation"
      >
        <div className="sidebar__brand">
          <div className="sidebar__logo" aria-hidden="true">📚</div>
          <div>
            <div className="sidebar__portal-name">Result Portal</div>
            <div className="sidebar__portal-sub">{ROLE_LABEL[role]} Panel</div>
          </div>
        </div>

        <nav className="sidebar__nav" aria-label="Main menu">
          {items.map(item => {
            const active = location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`sidebar__nav-item${active ? ' active' : ''}`}
                aria-current={active ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                <span className="sidebar__nav-icon" aria-hidden="true">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="sidebar__footer">
          <button
            className="btn btn--full btn--sm"
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.25)',
              color: 'rgba(255,255,255,0.75)',
            }}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="sidebar-main">

        {/* Topbar */}
        <div className="sidebar-topbar">
          <div className="sidebar-topbar__left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="sidebar-toggle-btn"
              onClick={() => setOpen(o => !o)}
              aria-expanded={open}
              aria-controls="sidebar"
              aria-label="Toggle navigation"
            >
              ☰
            </button>
            <button 
              onClick={() => navigate(-1)} 
              style={{ 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer', 
                fontSize: '18px',
                padding: '4px 8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)'
              }}
              title="Go Back"
              aria-label="Go Back"
            >
              ←
            </button>
            <span className="sidebar-topbar__title">
              {pageTitle || 'School Result Portal'}
            </span>
          </div>
          <span className="badge badge--primary">{ROLE_LABEL[role]}</span>
        </div>

        {/* Page */}
        <main className="sidebar-main__page" id="main-content">
          {children}
        </main>

      </div>
    </div>
  )
}

/* ── Header layout (student) ──────────────────────────────────── */
function HeaderLayout({ children, role }) {
  const { logout }  = useAuth()
  const navigate    = useNavigate()
  const location    = useLocation()
  const items       = NAV[role] ?? []

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <>
      <header className="site-header" role="banner">
        <div className="container">
          <div className="site-header__inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button 
                onClick={() => navigate(-1)} 
                style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: '18px',
                  padding: '4px 8px',
                  borderRadius: '8px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Go Back"
              >
                ←
              </button>
              <Link to="/student/dashboard" className="site-header__brand" aria-label="School Result Portal">
                <div className="site-header__logo" aria-hidden="true">📚</div>
                <span className="site-header__name">School Result Portal</span>
              </Link>
            </div>

            <nav className="site-header__nav" aria-label="Navigation">
              {items.map(item => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`site-header__nav-link${location.pathname === item.to ? ' active' : ''}`}
                  aria-current={location.pathname === item.to ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              ))}
              <span className="site-header__role-badge">{ROLE_LABEL[role]}</span>
              <button
                className="btn btn--sm"
                onClick={handleLogout}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  borderColor: 'transparent',
                  color: '#fff',
                  fontSize: '13px',
                }}
              >
                Sign Out
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main id="main-content" role="main" style={{ padding: 'var(--sp-8) 0' }}>
        <div className="container">
          {children}
        </div>
      </main>
    </>
  )
}

/* ── Public export ────────────────────────────────────────────── */

/**
 * @param {Object}  props
 * @param {'admin'|'teacher'|'student'} props.role
 * @param {boolean} [props.sidebar]   - true for admin/teacher
 * @param {string}  [props.pageTitle] - Title in topbar (sidebar mode)
 * @param {React.ReactNode} props.children
 */
export function Layout({ children, role, sidebar = false, pageTitle = '' }) {
  return sidebar
    ? <SidebarLayout role={role} pageTitle={pageTitle}>{children}</SidebarLayout>
    : <HeaderLayout  role={role}>{children}</HeaderLayout>
}
