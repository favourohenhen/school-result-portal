/**
 * Toast Context + Component
 *
 * Usage:
 *   const { showToast } = useToast()
 *   showToast('Saved!', 'success')
 *   showToast('Something went wrong', 'error')
 *   showToast('Check your input', 'warning')
 */
import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

const ICONS = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  default: 'ℹ️',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'default', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div id="toast-container" aria-live="assertive" aria-atomic="true">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`toast${t.type !== 'default' ? ` toast--${t.type}` : ''}`}
            role="alert"
          >
            <span aria-hidden="true">{ICONS[t.type] ?? ICONS.default}</span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
