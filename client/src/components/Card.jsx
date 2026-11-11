import Orb from './Orb'
import { StarIcon } from './Icons'
import { fmtLy, fmtNum, fmtPeriod, fmtTemp } from '../lib/format'

export default function Card({ body, isFavorite, onToggleFavorite, onSelect, index = 0 }) {
  const isStar = body.type === 'star'
  const location = isStar
    ? body.distanceLy === 0
      ? 'Solar System · home'
      : `${body.constellation ?? 'Deep sky'} · ${fmtLy(body.distanceLy)}`
    : body.hostStar
      ? `Orbits ${body.hostStar.name} · ${fmtLy(body.distanceLy)}`
      : `${body.constellation ?? 'Deep sky'} · ${fmtLy(body.distanceLy)}`

  return (
    <article
      className="card"
      style={{ '--orb': body.color, animationDelay: `${Math.min(index, 12) * 35}ms` }}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(body.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(body.id)
        }
      }}
      aria-label={`Open dossier for ${body.name}`}
    >
      <div className="card__top">
        <Orb color={body.color} type={body.type} size={62} />
        <div className="card__id">
          <span className="card__type">{isStar ? 'Star' : 'Exoplanet'}</span>
          <h3>{body.name}</h3>
          <p className="card__sub">{location}</p>
        </div>
      </div>

      <div className="card__badges">
        {body.habitableZone && (
          <span className="tag tag--hz">
            <span className="tag__dot" />
            Habitable zone
          </span>
        )}
        {isStar ? (
          <>
            <span className="tag">{body.spectralType}</span>
            <span className="tag tag--ghost">
              {body.id === 'sun'
                ? 'Home star'
                : `${body.planetCount} ${body.planetCount === 1 ? 'world' : 'worlds'}`}
            </span>
          </>
        ) : (
          body.discoveryYear && (
            <span className="tag tag--ghost">Discovered {body.discoveryYear}</span>
          )
        )}
      </div>

      <dl className="card__stats">
        <div>
          <dt>Radius</dt>
          <dd>{isStar ? `${fmtNum(body.radiusSolar)} R☉` : `${fmtNum(body.radiusEarth)} R⊕`}</dd>
        </div>
        <div>
          <dt>{isStar ? 'Surface' : 'Eq. temp'}</dt>
          <dd>{fmtTemp(body.tempK)}</dd>
        </div>
        <div>
          <dt>{isStar ? 'Mass' : 'Orbit'}</dt>
          <dd>{isStar ? `${fmtNum(body.massSolar)} M☉` : fmtPeriod(body.orbitalPeriodDays)}</dd>
        </div>
      </dl>

      <button
        type="button"
        className={`fav-btn ${isFavorite ? 'is-on' : ''}`}
        onClick={(event) => {
          event.stopPropagation()
          onToggleFavorite(body)
        }}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? `Unpin ${body.name}` : `Pin ${body.name}`}
      >
        <StarIcon filled={isFavorite} />
      </button>
    </article>
  )
}
