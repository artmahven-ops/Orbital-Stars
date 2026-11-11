import { useEffect, useRef, useState } from 'react'
import Orb from './Orb'
import { ArrowUpRight, CloseIcon, StarIcon } from './Icons'
import { api } from '../api'
import { fmtLy, fmtNum, fmtPeriod, fmtTemp } from '../lib/format'

function buildTiles(body) {
  const tiles = [
    {
      label: 'Distance',
      value: body.distanceLy === 0 ? 'Home system' : fmtLy(body.distanceLy),
    },
  ]

  if (body.type === 'star') {
    if (body.spectralType) tiles.push({ label: 'Spectral type', value: body.spectralType })
    tiles.push({ label: 'Radius', value: `${fmtNum(body.radiusSolar)} R☉` })
    tiles.push({ label: 'Mass', value: `${fmtNum(body.massSolar)} M☉` })
    tiles.push({ label: 'Surface temp', value: fmtTemp(body.tempK) })
    tiles.push({
      label: 'Known worlds',
      value: String(body.planetCount),
    })
  } else {
    tiles.push({ label: 'Radius', value: `${fmtNum(body.radiusEarth)} R⊕` })
    tiles.push({ label: 'Mass', value: `${fmtNum(body.massEarth)} M⊕` })
    tiles.push({ label: 'Orbital period', value: fmtPeriod(body.orbitalPeriodDays) })
    tiles.push({ label: 'Equilibrium temp', value: fmtTemp(body.tempK) })
    if (body.discoveryYear) tiles.push({ label: 'Discovered', value: String(body.discoveryYear) })
    tiles.push({
      label: 'Habitable zone',
      value: body.habitableZone ? 'Inside the zone' : 'Outside the zone',
      tone: body.habitableZone ? 'hz' : 'muted',
    })
  }

  return tiles
}

function DrawerSkeleton() {
  return (
    <div className="drawer-skel" aria-label="Loading dossier">
      <div className="sk" style={{ height: 200, borderRadius: 18 }} />
      <div className="sk" style={{ height: 10, width: '34%' }} />
      <div className="sk" style={{ height: 34, width: '70%' }} />
      <div className="sk" style={{ height: 10, width: '48%' }} />
      <div className="sk" style={{ height: 88, marginTop: 8 }} />
      <div className="sk" style={{ height: 150 }} />
    </div>
  )
}

export default function DetailDrawer({ bodyId, isFavorite, onToggleFavorite, onClose, onSelect }) {
  const [body, setBody] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const scrollerRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    api
      .getBody(bodyId)
      .then((data) => {
        if (!cancelled) setBody(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [bodyId])

  useEffect(() => {
    if (scrollerRef.current) scrollerRef.current.scrollTop = 0
  }, [bodyId, body])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  return (
    <div className="overlay" onClick={onClose}>
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dossier-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="drawer__bar">
          <span className="drawer__crumb">Dossier / {body?.name ?? 'loading'}</span>
          <div className="drawer__actions">
            {body && (
              <button
                type="button"
                className={`icon-btn ${isFavorite ? 'is-on' : ''}`}
                onClick={() => onToggleFavorite(body)}
                aria-pressed={isFavorite}
                aria-label={isFavorite ? `Unpin ${body.name}` : `Pin ${body.name}`}
              >
                <StarIcon filled={isFavorite} />
              </button>
            )}
            <button type="button" className="icon-btn" onClick={onClose} aria-label="Close dossier">
              <CloseIcon />
            </button>
          </div>
        </div>

        {loading ? (
          <DrawerSkeleton />
        ) : error ? (
          <div className="drawer__scroll">
            <div className="state state--drawer">
              <h2>Signal lost</h2>
              <p>{error}</p>
              <button type="button" className="btn" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : body ? (
          <div className="drawer__scroll" ref={scrollerRef}>
            <div className="dossier-hero" style={{ '--orb': body.color }}>
              <span className="dossier-hero__ring ring-1" />
              <span className="dossier-hero__ring ring-2" />
              <span className="dossier-hero__ring ring-3" />
              <Orb color={body.color} type={body.type} size={148} />
            </div>

            <p className="eyebrow">
              {body.type === 'star' ? 'Stellar object' : 'Confirmed exoplanet'} ·{' '}
              {body.constellation}
            </p>
            <h2 id="dossier-title" className="dossier-title">
              {body.name}
            </h2>
            <p className="dossier-sub">
              <span>
                {body.type === 'exoplanet' && body.hostStar
                  ? `Orbits ${body.hostStar.name}`
                  : body.constellation}
              </span>
              <span className="dot" />
              <span>{body.distanceLy === 0 ? 'Home system' : `${fmtLy(body.distanceLy)} away`}</span>
              {body.type === 'star' && body.spectralType && (
                <>
                  <span className="dot" />
                  <span>{body.spectralType}</span>
                </>
              )}
            </p>

            <div className="tag-row">
              <span className="tag">{body.type === 'star' ? 'Star' : 'Exoplanet'}</span>
              {body.habitableZone && (
                <span className="tag tag--hz">
                  <span className="tag__dot" />
                  Habitable zone
                </span>
              )}
              {body.type === 'star' ? (
                <span className="tag tag--ghost">
                  {body.planetCount} known {body.planetCount === 1 ? 'world' : 'worlds'}
                </span>
              ) : (
                body.discoveryYear && (
                  <span className="tag tag--ghost">Discovered {body.discoveryYear}</span>
                )
              )}
            </div>

            <p className="dossier-summary">{body.summary}</p>
            <p className="dossier-desc">{body.description}</p>

            <div className="stat-grid">
              {buildTiles(body).map((tile) => (
                <div
                  key={tile.label}
                  className={`stat-tile ${tile.tone ? `stat-tile--${tile.tone}` : ''}`}
                >
                  <span className="stat-tile__label">{tile.label}</span>
                  <span className="stat-tile__value">{tile.value}</span>
                </div>
              ))}
            </div>

            {body.type === 'star' ? (
              <section className="drawer-section">
                <div className="drawer-section__head">
                  <h3>Known worlds</h3>
                  <span className="drawer-section__count">{body.planets.length} charted</span>
                </div>
                {body.planets.length > 0 ? (
                  <ul className="planet-list">
                    {body.planets.map((planet) => (
                      <li key={planet.id}>
                        <button type="button" onClick={() => onSelect(planet.id)}>
                          <Orb color={planet.color} type="exoplanet" size={30} />
                          <span className="planet-list__name">{planet.name}</span>
                          <span className="planet-list__meta">
                            {fmtTemp(planet.tempK)} · {fmtPeriod(planet.orbitalPeriodDays)}
                          </span>
                          {planet.habitableZone && <span className="tag tag--hz">HZ</span>}
                          <ArrowUpRight className="arrow" />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-note">
                    {body.id === 'sun'
                      ? 'The eight planets of our solar system are not part of this exoplanet-focused catalog.'
                      : 'No worlds are charted around this star in the catalog yet.'}
                  </p>
                )}
              </section>
            ) : body.hostStar ? (
              <section className="drawer-section">
                <div className="drawer-section__head">
                  <h3>Host star</h3>
                </div>
                <button
                  type="button"
                  className="host-card"
                  onClick={() => onSelect(body.hostStar.id)}
                >
                  <Orb color={body.hostStar.color} type="star" size={44} />
                  <span className="host-card__meta">
                    <span className="host-card__hint">Open stellar dossier</span>
                    <strong>{body.hostStar.name}</strong>
                  </span>
                  <ArrowUpRight className="arrow" />
                </button>
              </section>
            ) : null}
          </div>
        ) : null}
      </aside>
    </div>
  )
}
