export function fmtLy(ly) {
  if (ly == null) return '—'
  if (ly === 0) return '0 ly'
  if (ly < 1000) {
    return `${ly.toFixed(ly < 10 ? 2 : 1).replace(/\.?0+$/, '')} ly`
  }
  return `${Math.round(ly).toLocaleString('en-US')} ly`
}

export function fmtNum(n, maxDigits = 3) {
  if (n == null || Number.isNaN(n)) return '—'
  return n.toLocaleString('en-US', { maximumFractionDigits: maxDigits })
}

export function fmtTemp(k) {
  if (k == null) return '—'
  return `${Math.round(k).toLocaleString('en-US')} K`
}

export function fmtPeriod(days) {
  if (days == null) return '—'
  if (days < 1) {
    return `${(days * 24).toFixed(1).replace(/\.0$/, '')} h`
  }
  if (days < 10) return `${days.toFixed(2).replace(/\.?0+$/, '')} d`
  if (days < 365) return `${days.toFixed(1).replace(/\.0$/, '')} d`
  return `${Math.round(days).toLocaleString('en-US')} d`
}
