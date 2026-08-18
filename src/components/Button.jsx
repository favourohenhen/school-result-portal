/**
 * Button Component
 *
 * @param {React.ReactNode} children      - Button label
 * @param {'primary'|'accent'|'secondary'|'outline'|'ghost'|'danger'} variant
 * @param {'sm'|''|'lg'} size
 * @param {'button'|'submit'|'reset'} type
 * @param {boolean} fullWidth
 * @param {boolean} disabled
 * @param {boolean} loading             - Shows spinner, disables interaction
 * @param {React.ReactNode} icon        - Leading icon/emoji
 * @param {string} className            - Extra CSS classes
 * @param {function} onClick
 */
export function Button({
  children,
  variant   = 'primary',
  size      = '',
  type      = 'button',
  fullWidth = false,
  disabled  = false,
  loading   = false,
  icon      = null,
  className = '',
  onClick,
  ...rest
}) {
  const cls = [
    'btn',
    `btn--${variant}`,
    size      ? `btn--${size}` : '',
    fullWidth ? 'btn--full'    : '',
    loading   ? 'btn--loading' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={cls}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {!loading && icon && <span aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </button>
  )
}
