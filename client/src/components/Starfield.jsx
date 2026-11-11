import { useEffect, useRef } from 'react'

export default function Starfield() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    let stars = []
    let width = 0
    let height = 0

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      const count = Math.min(420, Math.round((width * height) / 8500))
      stars = Array.from({ length: count }, () => {
        const tint = Math.random()
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.15 + 0.22,
          alpha: Math.random() * 0.55 + 0.2,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.0011 + 0.0003,
          color: tint > 0.86 ? '178, 200, 255' : tint > 0.72 ? '255, 228, 181' : '232, 238, 255',
        }
      })
    }

    const draw = (time) => {
      ctx.clearRect(0, 0, width, height)
      for (const star of stars) {
        const twinkle = 0.55 + 0.45 * Math.sin(time * star.speed + star.phase)
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${star.color}, ${(star.alpha * twinkle).toFixed(3)})`
        ctx.fill()
      }
      if (!reduceMotion) raf = requestAnimationFrame(draw)
    }

    const onResize = () => {
      build()
      if (reduceMotion) draw(0)
    }

    build()
    draw(0)
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return <canvas ref={ref} className="starfield" aria-hidden="true" />
}
