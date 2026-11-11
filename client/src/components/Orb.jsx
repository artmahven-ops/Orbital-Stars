export default function Orb({ color, type = 'star', size = 64, className = '' }) {
  return (
    <span
      className={`orb ${type === 'star' ? 'orb--star' : 'orb--planet'} ${className}`}
      style={{ '--orb': color, '--orb-size': `${size}px` }}
      aria-hidden="true"
    >
      {type === 'star' && <span className="orb__corona" />}
      {type === 'exoplanet' && <span className="orb__orbit" />}
      <span className="orb__body" />
    </span>
  )
}
