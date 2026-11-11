const CLIENT_KEY = 'orbital-atlas-client-id'

function getClientId() {
  try {
    let id = localStorage.getItem(CLIENT_KEY)
    if (!id) {
      id =
        typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `client-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem(CLIENT_KEY, id)
    }
    return id
  } catch {
    return `client-${Math.random().toString(36).slice(2, 12)}`
  }
}

const CLIENT_ID = getClientId()

async function request(path, { method = 'GET', body, signal } = {}) {
  const res = await fetch(`/api${path}`, {
    method,
    signal,
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Id': CLIENT_ID,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const data = await res.json()
      if (data?.error) message = data.error
    } catch {
      /* non-JSON error body */
    }
    throw new Error(message)
  }

  if (res.status === 204) return null
  return res.json()
}

export const api = {
  getStats: () => request('/stats'),

  getBodies: (params, signal) => {
    const qs = new URLSearchParams()
    if (params.search) qs.set('search', params.search)
    if (params.type) qs.set('type', params.type)
    if (params.habitable) qs.set('habitable', '1')
    if (params.sort) qs.set('sort', params.sort)
    const query = qs.toString()
    return request(`/bodies${query ? `?${query}` : ''}`, { signal })
  },

  getBody: (id) => request(`/bodies/${encodeURIComponent(id)}`),

  getFavorites: () => request('/favorites'),

  addFavorite: (bodyId) => request('/favorites', { method: 'POST', body: { bodyId } }),

  removeFavorite: (bodyId) =>
    request(`/favorites/${encodeURIComponent(bodyId)}`, { method: 'DELETE' }),
}
