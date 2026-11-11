import Card from './Card'
import Orb from './Orb'
import { ArrowUpRight } from './Icons'

export default function Favorites({ items, favoriteIds, onSelect, onToggleFavorite, onExplore }) {
  return (
    <div className="page page--favorites">
      <header className="page__head">
        <p className="eyebrow">
          <span className="eyebrow__dot" />
          Your personal sky
        </p>
        <h1>Pinned worlds</h1>
        <p className="lead">
          The stars and exoplanets you have charted, saved to this device. Pin from the explorer and
          they will collect here.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="state">
          <div className="state__orbits">
            <Orb color="#7dd3fc" type="star" size={38} />
          </div>
          <h2>Your sky is still dark</h2>
          <p>Tap the star on any dossier to pin it, and it will be charted here for your next visit.</p>
          <button type="button" className="btn btn--primary" onClick={onExplore}>
            Browse the catalog <ArrowUpRight />
          </button>
        </div>
      ) : (
        <>
          <div className="meta-row">
            <span className="live">
              <span className="live__dot" />
              {items.length} pinned object{items.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="grid">
            {items.map((body, index) => (
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
        </>
      )}
    </div>
  )
}
