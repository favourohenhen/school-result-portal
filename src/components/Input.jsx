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
  const hasError = Boolean(error)
  const ariaDesc = hasError ? `${id}-error` : hint ? `${id}-hint` : undefined

  const inputCls = [
    'form-input',
    icon        ? 'form-input--icon' : '',
    type === 'select' ? 'form-select' : '',
    hasError    ? 'form-input--error' : '',
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
      <input type={type} {...sharedProps} />
    )

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className={`form-label${required ? ' required' : ''}`}>
          {label}
        </label>
      )}

      {icon ? (
        <div className="form-input-wrapper">
          <span className="form-input-icon" aria-hidden="true">{icon}</span>
          {field}
        </div>
      ) : field}

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
