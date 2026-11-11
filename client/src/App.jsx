import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Starfield from './components/Starfield'
import Explore from './components/Explore'
import Favorites from './components/Favorites'
import DetailDrawer from './components/DetailDrawer'
import Toast from './components/Toast'
import { OrbitMark } from './components/Icons'
import { api } from './api'
import { useDebouncedValue } from './hooks'

const DEFAULT_FILTERS = { search: '', type: 'all', habitable: false, sort: 'distance' }

export default function App() {
  const [page, setPage] = useState('explore')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [bodies, setBodies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [toast, setToast] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  const debouncedSearch = useDebouncedValue(filters.search, 250)
  const toastTimer = useRef(null)

  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.id)), [favorites])

  const showToast = useCallback((message, tone = 'default') => {
    setToast({ message, tone, id: Date.now() })
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2400)
  }, [])

  useEffect(() => () => window.clearTimeout(toastTimer.current), [])

  useEffect(() => {
    api.getStats().then(setStats).catch(() => setStats(null))
    api.getFavorites().then((data) => setFavorites(data.items)).catch(() => {})
  }, [])

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    setLoading(true)
    setError(null)

    api
      .getBodies(
        {
          search: debouncedSearch,
          type: filters.type === 'all' ? undefined : filters.type,
          habitable: filters.habitable,
          sort: filters.sort,
        },
        controller.signal,
      )
      .then((data) => {
        if (!cancelled) setBodies(data.items)
      })
      .catch((err) => {
        if (!cancelled && err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [debouncedSearch, filters.type, filters.habitable, filters.sort, reloadKey])

  const refreshFavorites = useCallback(() => {
    api.getFavorites().then((data) => setFavorites(data.items)).catch(() => {})
  }, [])

  const toggleFavorite = useCallback(
    async (body) => {
      if (favoriteIds.has(body.id)) {
        setFavorites((previous) => previous.filter((item) => item.id !== body.id))
        try {
          await api.removeFavorite(body.id)
          showToast(`${body.name} unpinned`)
        } catch (err) {
          refreshFavorites()
          showToast(err.message || 'Could not update favorites', 'error')
        }
      } else {
        setFavorites((previous) => [body, ...previous.filter((item) => item.id !== body.id)])
        try {
          await api.addFavorite(body.id)
          showToast(`${body.name} pinned to your sky`)
        } catch (err) {
          refreshFavorites()
          showToast(err.message || 'Could not update favorites', 'error')
        }
      }
    },
    [favoriteIds, refreshFavorites, showToast],
  )

  const openBody = useCallback((id) => setSelectedId(id), [])
  const closeDrawer = useCallback(() => setSelectedId(null), [])
  const goExplore = useCallback(() => setPage('explore'), [])
  const goFavorites = useCallback(() => setPage('favorites'), [])
  const retry = useCallback(() => setReloadKey((key) => key + 1), [])

  const goHome = () => {
    closeDrawer()
    goExplore()
  }

  return (
    <>
      <div className="nebula" aria-hidden="true" />
      <Starfield />

      <div className="app">
        <header className="topbar">
          <button type="button" className="brand" onClick={goHome} aria-label="Orbital Atlas home">
            <OrbitMark />
            <span className="brand__text">Orbital Atlas</span>
          </button>

          <nav className="nav" aria-label="Primary">
            <button
              type="button"
              className={`nav__btn ${page === 'explore' ? 'is-active' : ''}`}
              onClick={goExplore}
            >
              Explorer
            </button>
            <button
              type="button"
              className={`nav__btn ${page === 'favorites' ? 'is-active' : ''}`}
              onClick={goFavorites}
            >
              Favorites
              {favorites.length > 0 && <span className="nav__count">{favorites.length}</span>}
            </button>
          </nav>
        </header>

        <main>
          {page === 'explore' ? (
            <Explore
              stats={stats}
              bodies={bodies}
              loading={loading}
              error={error}
              filters={filters}
              onFiltersChange={setFilters}
              favoriteIds={favoriteIds}
              onToggleFavorite={toggleFavorite}
              onSelect={openBody}
              onRetry={retry}
            />
          ) : (
            <Favorites
              items={favorites}
              favoriteIds={favoriteIds}
              onSelect={openBody}
              onToggleFavorite={toggleFavorite}
              onExplore={goExplore}
            />
          )}
        </main>

        <footer className="footer">
          <span>Orbital Atlas · a deep-sky field guide</span>
          <span>React · Express · SQLite · public astronomy catalogs</span>
        </footer>
      </div>

      {selectedId && (
        <DetailDrawer
          bodyId={selectedId}
          isFavorite={favoriteIds.has(selectedId)}
          onToggleFavorite={toggleFavorite}
          onClose={closeDrawer}
          onSelect={setSelectedId}
        />
      )}

      <Toast toast={toast} />
    </>
  )
}
