import { useState } from 'react'

/**
 * Input / Select Component
 *
 * @param {string}  id           - Required for label <-> input association
 * @param {string}  label        - Visible label text
 * @param {string}  type         - 'text'|'email'|'password'|'number'|'select'
 * @param {string}  error        - Validation error message
 * @param {string}  hint         - Helper text
 * @param {boolean} required
 * @param {React.ReactNode} icon - Leading icon/emoji
 * @param {Array}   options      - [{ value, label }] for type='select'
 * @param {string}  className    - Extra CSS on the input/select element
 * All other props are forwarded to the underlying input/select element.
 */
export function Input({
  id,
  label,
  type      = 'text',
  error     = '',
  hint      = '',
  required  = false,
  icon      = null,
  options   = [],
  className = '',
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false)
  
  const hasError = Boolean(error)
  const ariaDesc = hasError ? `${id}-error` : hint ? `${id}-hint` : undefined
  const isPassword = type === 'password'
  const actualType = isPassword ? (showPassword ? 'text' : 'password') : type

  const inputCls = [
    'form-input',
    icon        ? 'form-input--icon' : '',
    type === 'select' ? 'form-select' : '',
    hasError    ? 'form-input--error' : '',
    isPassword  ? 'form-input--password' : '', // To add padding-right for toggle
    className,
  ].filter(Boolean).join(' ')

  const sharedProps = {
    id,
    className: inputCls,
    'aria-describedby': ariaDesc,
    'aria-invalid':     hasError || undefined,
    required,
    ...rest,
  }

  const field =
    type === 'select' ? (
      <select {...sharedProps}>
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    ) : (
      <input type={actualType} {...sharedProps} />
    )

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className={`form-label${required ? ' required' : ''}`}>
          {label}
        </label>
      )}

      <div className="form-input-wrapper" style={{ position: 'relative' }}>
        {icon && <span className="form-input-icon" aria-hidden="true">{icon}</span>}
        
        {field}
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 14, color: 'var(--color-text-secondary)', padding: 4
            }}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {hasError && (
        <span id={`${id}-error`} className="form-error" role="alert">
          ⚠ {error}
        </span>
      )}
      {hint && !hasError && (
        <span id={`${id}-hint`} className="form-hint">{hint}</span>
      )}
    </div>
  )
}
