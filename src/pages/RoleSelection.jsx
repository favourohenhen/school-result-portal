import { useNavigate } from 'react-router-dom'

export default function RoleSelection() {
  const navigate = useNavigate()

  const handleKeyDown = (e, path) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      navigate(path)
    }
  }

  return (
    <div className="login-page" role="main">
      <style>{`
        .role-card {
          background: white;
          border-radius: 16px;
          padding: 32px 24px;
          text-align: center;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          border: 2px solid transparent;
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
          outline: none;
        }
        .role-card:hover, .role-card:focus-visible {
          transform: translateY(-5px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.15);
          border-color: var(--color-accent);
        }
        .role-card__icon {
          font-size: 56px;
          margin-bottom: 16px;
        }
        .role-card__title {
          margin: 0 0 8px 0;
          font-size: 22px;
          color: var(--color-primary);
          font-weight: 700;
        }
        .role-card__desc {
          margin: 0;
          color: var(--color-text-secondary);
          font-size: 14px;
          line-height: 1.4;
        }
        
        .role-header {
          text-align: center;
          margin-bottom: 48px;
        }
        .role-header__logo {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, var(--color-surface), #f0f0f0);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          font-size: 40px;
          box-shadow: 0 8px 16px rgba(0,0,0,0.2);
        }
        .role-header__title {
          font-size: 32px;
          font-weight: 700;
          color: white;
          margin-bottom: 8px;
        }
        .role-header__subtitle {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.85);
        }

        @media (max-width: 600px) {
          .role-header { margin-bottom: 32px; }
          .role-header__title { font-size: 26px; }
          .role-card { padding: 24px 20px; }
          .role-card__icon { font-size: 48px; }
          .role-card__title { font-size: 20px; }
        }
      `}</style>

      <div style={{ maxWidth: '900px', width: '100%', padding: '20px', zIndex: 1 }}>
        <div className="role-header">
          <div className="role-header__logo" aria-hidden="true">🏫</div>
          <h1 className="role-header__title">School Result Portal</h1>
          <p className="role-header__subtitle">Select your portal to continue securely</p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', 
          gap: '24px' 
        }}>
          
          {/* Student Portal Card */}
          <div 
            className="role-card"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/student/login')}
            onKeyDown={(e) => handleKeyDown(e, '/student/login')}
            aria-label="Login as Student"
          >
            <div className="role-card__icon" aria-hidden="true">🎓</div>
            <h3 className="role-card__title">Student Portal</h3>
            <p className="role-card__desc">View your term results, performance and subjects</p>
          </div>

          {/* Teacher Portal Card */}
          <div 
            className="role-card"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/teacher/login')}
            onKeyDown={(e) => handleKeyDown(e, '/teacher/login')}
            aria-label="Login as Teacher"
          >
            <div className="role-card__icon" aria-hidden="true">👨‍🏫</div>
            <h3 className="role-card__title">Teacher Portal</h3>
            <p className="role-card__desc">Manage your classes, students, and upload results</p>
          </div>

          {/* Admin Portal Card */}
          <div 
            className="role-card"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/admin/login')}
            onKeyDown={(e) => handleKeyDown(e, '/admin/login')}
            aria-label="Login as Administrator"
          >
            <div className="role-card__icon" aria-hidden="true">🛡️</div>
            <h3 className="role-card__title">Admin Portal</h3>
            <p className="role-card__desc">System configuration, school setup, and overview</p>
          </div>

        </div>
      </div>
    </div>
  )
}
