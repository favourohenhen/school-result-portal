/**
 * Card family of components
 *
 * Usage:
 *   <Card>
 *     <Card.Header>
 *       <Card.Title>Title</Card.Title>
 *       <Card.Subtitle>Subtitle</Card.Subtitle>
 *       <Button size="sm">Action</Button>
 *     </Card.Header>
 *     <Card.Body>Content</Card.Body>
 *     <Card.Footer>Footer actions</Card.Footer>
 *   </Card>
 *
 *   <StatCard icon="👥" label="Students" value={42} />
 */

/** Container card */
export function Card({ children, hoverable = false, className = '', ...rest }) {
  const cls = ['card', hoverable ? 'card--hover' : '', className].filter(Boolean).join(' ')
  return <div className={cls} {...rest}>{children}</div>
}

Card.Header = function CardHeader({ children, className = '' }) {
  return <div className={`card__header ${className}`.trim()}>{children}</div>
}

Card.Body = function CardBody({ children, className = '' }) {
  return <div className={`card__body ${className}`.trim()}>{children}</div>
}

Card.Footer = function CardFooter({ children, className = '' }) {
  return <div className={`card__footer ${className}`.trim()}>{children}</div>
}

Card.Title = function CardTitle({ children }) {
  return <h3 className="card__title">{children}</h3>
}

Card.Subtitle = function CardSubtitle({ children }) {
  return <p className="card__subtitle">{children}</p>
}

/** Dashboard metric card */
export function StatCard({ icon = null, label, value = '—', id }) {
  return (
    <div className="stat-card" id={id}>
      {icon && <div className="stat-card__icon" aria-hidden="true">{icon}</div>}
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
    </div>
  )
}

/** Loading skeleton card */
export function SkeletonCard() {
  return (
    <div className="stat-card" style={{ animation: 'pulse 1.5s ease infinite' }}>
      <div style={{ height: 22, width: 22, background: 'var(--color-border)', borderRadius: 4 }} />
      <div style={{ height: 12, width: '60%', background: 'var(--color-border)', borderRadius: 4 }} />
      <div style={{ height: 28, width: '40%', background: 'var(--color-border)', borderRadius: 4 }} />
    </div>
  )
}
