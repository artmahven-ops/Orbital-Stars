import Card from './Card'
import Orb from './Orb'
import { CloseIcon, OrbitMark, SearchIcon } from './Icons'
import { fmtNum } from '../lib/format'

const FILTERS = [
  { value: 'all', label: 'All objects' },
  { value: 'star', label: 'Stars', countKey: 'stars' },
  { value: 'exoplanet', label: 'Exoplanets', countKey: 'exoplanets' },
]

const SORTS = [
  { value: 'distance', label: 'Closest first' },
  { value: 'distance-desc', label: 'Farthest first' },
  { value: 'temp', label: 'Hottest first' },
  { value: 'discovery', label: 'Newest discovery' },
  { value: 'name', label: 'Name A–Z' },
]

const ORBITS = [
  { size: 34, duration: 26, dot: 9, color: '#7dd3fc' },
  { size: 58, duration: 38, dot: 6, color: '#a78bfa', reverse: true },
  { size: 84, duration: 54, dot: 12, color: '#34d399' },
]

export default function Explore({
  stats,
  bodies,
  loading,
  error,
  filters,
  onFiltersChange,
  favoriteIds,
  onToggleFavorite,
  onSelect,
  onRetry,
}) {
  const update = (patch) => onFiltersChange({ ...filters, ...patch })
  const hasFilters = filters.search !== '' || filters.type !== 'all' || filters.habitable

  return (
    <div className="page">
      <section className="hero">
        <div className="hero__copy">
          <p className="eyebrow">
            <span className="eyebrow__dot" />
            Deep-sky catalog · live query
          </p>
          <h1 className="hero__title">
            Chart the <span className="grad">universe.</span>
          </h1>
          <p className="lead">
            A living atlas of the stars we orbit and the worlds found around them. Search the
            catalog, open a dossier, and pin the ones that stay with you.
          </p>

          <div className="hero__stats">
            <div className="stat">
              <span className="stat__label">Catalogued</span>
              <span className="stat__value">{stats?.total ?? '—'}</span>
              <span className="stat__sub">stars &amp; worlds</span>
            </div>
            <div className="stat">
              <span className="stat__label">Stars</span>
              <span className="stat__value">{stats?.stars ?? '—'}</span>
              <span className="stat__sub">stellar hosts</span>
            </div>
            <div className="stat">
              <span className="stat__label">Exoplanets</span>
              <span className="stat__value">{stats?.exoplanets ?? '—'}</span>
              <span className="stat__sub">confirmed worlds</span>
            </div>
            <div className="stat">
              <span className="stat__label">Habitable zone</span>
              <span className="stat__value">{stats?.habitable ?? '—'}</span>
              <span className="stat__sub">temperate</span>
            </div>
            <div className="stat">
              <span className="stat__label">Nearest world</span>
              <span className="stat__value">
                {stats?.nearest ? fmtNum(stats.nearest.distanceLy, 2) : '—'}
                <span className="stat__unit">ly</span>
              </span>
              <span className="stat__sub">{stats?.nearest?.name ?? 'scanning…'}</span>
            </div>
          </div>
        </div>

        <div className="orrery" aria-hidden="true">
          <span className="orrery__glow" />
          {ORBITS.map((orbit) => (
            <span
              key={orbit.size}
              className={`orrery__orbit ${orbit.reverse ? 'is-reverse' : ''}`}
              style={{
                inset: `${(100 - orbit.size) / 2}%`,
                animationDuration: `${orbit.duration}s`,
              }}
            >
              <span
                className="orrery__dot"
                style={{
                  width: orbit.dot,
                  height: orbit.dot,
                  background: orbit.color,
                  boxShadow: `0 0 14px ${orbit.color}`,
                }}
              />
            </span>
          ))}
          <span className="orrery__core">
            <Orb color="#ffd27a" type="star" size={44} />
          </span>
        </div>
      </section>

      <div className="toolbar">
        <label className="search">
          <SearchIcon className="search__icon" />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => update({ search: event.target.value })}
            placeholder="Search worlds, stars, constellations…"
            aria-label="Search the catalog"
          />
          {filters.search && (
            <button
              type="button"
              className="search__clear"
              onClick={() => update({ search: '' })}
              aria-label="Clear search"
            >
              <CloseIcon />
            </button>
          )}
        </label>

        <div className="chips" role="group" aria-label="Filter by object type">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`chip ${filters.type === filter.value ? 'is-active' : ''}`}
              onClick={() => update({ type: filter.value })}
              aria-pressed={filters.type === filter.value}
            >
              {filter.label}
              {filter.countKey && stats?.[filter.countKey] != null && (
                <span className="chip__count">{stats[filter.countKey]}</span>
              )}
            </button>
          ))}
        </div>

        <div className="toolbar__right">
          <label className="switch">
            <input
              type="checkbox"
              checked={filters.habitable}
              onChange={(event) => update({ habitable: event.target.checked })}
            />
            <span className="switch__track" aria-hidden="true" />
            <span>Habitable zone</span>
          </label>

          <div className="select">
            <select
              value={filters.sort}
              onChange={(event) => update({ sort: event.target.value })}
              aria-label="Sort catalog"
            >
              {SORTS.map((sort) => (
                <option key={sort.value} value={sort.value}>
                  {sort.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="meta-row">
        <span className="live">
          <span className="live__dot" />
          {loading ? 'Querying catalog…' : `${bodies.length} object${bodies.length === 1 ? '' : 's'} found`}
        </span>
        {hasFilters && (
          <button
            type="button"
            className="link-btn"
            onClick={() =>
              onFiltersChange({ search: '', type: 'all', habitable: false, sort: filters.sort })
            }
          >
            Reset filters
          </button>
        )}
      </div>

      {error ? (
        <div className="state">
          <div className="state__orbits">
            <OrbitMark className="state__mark" />
          </div>
          <h2>Signal lost</h2>
          <p>{error}. Check that the API is reachable, then try the sweep again.</p>
          <button type="button" className="btn btn--primary" onClick={onRetry}>
            Retry the sweep
          </button>
        </div>
      ) : loading && bodies.length === 0 ? (
        <div className="grid">
          {Array.from({ length: 8 }, (_, index) => (
            <div className="skeleton-card" key={index} />
          ))}
        </div>
      ) : bodies.length === 0 ? (
        <div className="state">
          <div className="state__orbits">
            <OrbitMark className="state__mark" />
          </div>
          <h2>No objects in this patch of sky</h2>
          <p>Nothing matches that combination of filters. Broaden the search or reset the sweep.</p>
          <button
            type="button"
            className="btn"
            onClick={() =>
              onFiltersChange({ search: '', type: 'all', habitable: false, sort: 'distance' })
            }
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className={`grid ${loading ? 'is-refreshing' : ''}`}>
          {bodies.map((body, index) => (
            <Card
              key={body.id}
              body={body}
              index={index}
              isFavorite={favoriteIds.has(body.id)}
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}
