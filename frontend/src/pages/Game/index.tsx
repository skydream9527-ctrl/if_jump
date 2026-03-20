import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { levelsApi, gameApi } from '../../api/client'
import { useGameStore } from '../../store/gameStore'
import { Platform, Player, ParticleSystem, FloatTextSystem } from '../../game/entities'
import './Game.css'

const GRAVITY = 980
const CHAPTER_THEMES: Record<number, string> = {
  1: 'ch1', 2: 'ch2', 3: 'ch3', 4: 'ch4', 5: 'ch5',
  6: 'ch6', 7: 'ch7', 8: 'ch8', 9: 'ch9', 10: 'ch10',
}

function generatePlatforms(count: number, chapterId: number): Platform[] {
  const theme = CHAPTER_THEMES[chapterId] || 'default'
  const platforms: Platform[] = []
  // Difficulty scaling: chapter 1=easiest, 10=hardest
  const diffScale = Math.min((chapterId - 1) / 9, 1)  // 0..1
  const baseGap = 120 + diffScale * 80           // 120..200
  const movingDensity = 0.1 + diffScale * 0.4    // 10%..50% moving
  let x = 120, y = 400

  for (let i = 0; i < count; i++) {
    // Platform width shrinks with chapter difficulty
    const maxW = Math.round(140 - diffScale * 50)  // 140..90
    const minW = Math.round(60 - diffScale * 20)   // 60..40
    const width = i === 0 ? maxW + 20
                : i % 10 === 9 ? minW               // boss platform
                : Math.round(minW + Math.random() * (maxW - minW))

    const gap = baseGap + i * 8 + Math.random() * 40
    const isMoving = i > 0 && Math.random() < movingDensity

    platforms.push(new Platform({
      id: i + 1,
      x: i === 0 ? 120 : x,
      y: i === 0 ? 400 : y + Math.sin(i) * 30,
      width,
      height: 22,
      type: isMoving ? 'moving' : 'standard',
      theme,
    }))
    x += gap
    y = 400 + Math.sin(i * 0.5) * 40
  }
  return platforms
}

export default function GamePage() {
  const { levelId } = useParams<{ levelId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const reviveState = (location.state as { revive?: boolean; prevScore?: number } | null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [levelInfo, setLevelInfo] = useState<any>(null)
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(false)

  // Game state refs (avoid re-renders in RAF loop)
  const stateRef = useRef({
    player: null as Player | null,
    platforms: [] as Platform[],
    particles: new ParticleSystem(),
    floatTexts: new FloatTextSystem(),
    cameraX: 0,
    lastTime: 0,
    charging: false,
    currentPlatform: 0,
    done: false,
    failed: false,
    t: 0,
  })

  const gameStore = useGameStore()

  const handleEnd = useCallback((completed: boolean) => {
    if (stateRef.current.done) return
    stateRef.current.done = true

    const { sessionId, score, perfectJumps, coinsEarned } = useGameStore.getState()
    const elapsed = (Date.now() - (useGameStore.getState().startTime || Date.now())) / 1000

    if (sessionId) {
      gameApi.end({
        session_id: sessionId, score, perfect_jumps: perfectJumps,
        coins_earned: coinsEarned, completed, duration_seconds: elapsed,
      }).catch(() => {})
    }

    setTimeout(() => {
      navigate(`/result/${levelId}`, { state: { score, perfectJumps, coinsEarned, completed, elapsed } })
    }, 800)
  }, [levelId, navigate])

  // Init level
  useEffect(() => {
    if (!levelId) return
    const chapterId = parseInt(levelId.split('-')[0])

    levelsApi.getById(levelId).then(async (data) => {
      setLevelInfo(data)
      const count = data.platform_count || 12
      const platforms = generatePlatforms(count, chapterId)
      const p = new Player(platforms[0].x, platforms[0].top - 14)

      stateRef.current.platforms = platforms
      stateRef.current.player = p
      stateRef.current.cameraX = 0
      stateRef.current.currentPlatform = 0

      const { data: sessionData } = await gameApi.start(levelId)
        .catch(() => ({ data: { session_id: 0 } })) as any
      const startScore = reviveState?.prevScore ?? 0
      gameStore.startSession(sessionData?.session_id || 0, levelId)
      if (startScore > 0) gameStore.addScore(startScore)
      setReady(true)
    }).catch(() => {
      // Fallback: generate a demo level
      const chapterId = parseInt(levelId?.split('-')[0] || '1')
      const platforms = generatePlatforms(12, chapterId)
      const p = new Player(platforms[0].x, platforms[0].top - 14)
      stateRef.current.platforms = platforms
      stateRef.current.player = p
      gameStore.startSession(0, levelId)
      setReady(true)
    })
  }, [levelId])

  // Game loop
  useEffect(() => {
    if (!ready || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    let animId = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const handleDown = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      if (stateRef.current.done) return
      const s = stateRef.current
      if (s.player?.state === 'idle') {
        s.player.startCharge()
        s.charging = true
      }
    }

    const handleUp = (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      const s = stateRef.current
      if (!s.charging || !s.player || s.player.state !== 'charging') return
      s.charging = false

      const nextP = s.platforms[s.currentPlatform + 1]
      const targetX = nextP ? nextP.x : s.player.x + 200
      s.player.releaseJump(targetX)
    }

    canvas.addEventListener('mousedown', handleDown, { passive: false })
    canvas.addEventListener('mouseup', handleUp, { passive: false })
    canvas.addEventListener('touchstart', handleDown, { passive: false })
    canvas.addEventListener('touchend', handleUp, { passive: false })

    const loop = (ts: number) => {
      const dt = Math.min((ts - stateRef.current.lastTime) / 1000, 0.05)
      stateRef.current.lastTime = ts
      stateRef.current.t = ts / 1000

      if (!paused && !stateRef.current.done) {
        update(dt)
      }
      draw(ctx, canvas.width, canvas.height)
      animId = requestAnimationFrame(loop)
    }

    const update = (dt: number) => {
      const s = stateRef.current
      if (!s.player) return

      s.player.updateCharge(dt)
      s.player.update(dt, GRAVITY)
      s.platforms.forEach(p => p.update(dt))
      s.particles.update(dt)
      s.floatTexts.update(dt)

      // Camera follows player
      const targetCamX = s.player.x - canvas.width * 0.3
      s.cameraX += (targetCamX - s.cameraX) * 0.08

      // Collision detection
      if (s.player.state === 'jumping') {
        const cp = s.platforms[s.currentPlatform]
        const np = s.platforms[s.currentPlatform + 1]

        const checkLand = (plat: Platform, idx: number) => {
          if (!s.player) return
          const px = s.player.x, py = s.player.y + 14
          if (s.player.vy > 0 &&
              px >= plat.left && px <= plat.right &&
              py >= plat.top && py <= plat.bottom + 10) {
            s.player.land(plat)
            s.currentPlatform = idx

            // Score
            const isPerfect = plat.inCenterZone(px)
            if (isPerfect) {
              gameStore.addScore(50)
              gameStore.addCombo()
              gameStore.addPerfectJump()
              s.particles.emit(px, plat.top, { count: 12, color: '#FFD700', speed: 160 })
              const combo = useGameStore.getState().combo
              const label = combo >= 15 ? '完美！×3' : combo >= 10 ? '极佳！×2' : combo >= 6 ? '很好！×1.5' : '完美！'
              s.floatTexts.show(px, plat.top - 20, label, '#FFD700')
            } else {
              gameStore.addScore(10)
              gameStore.addCombo()
              s.particles.emit(px, plat.top, { count: 6, color: '#FF9F43', speed: 80, size: 3 })
            }

            // Check win
            if (idx === s.platforms.length - 1) {
              handleEnd(true)
            }
          }
        }

        if (np) checkLand(np, s.currentPlatform + 1)
        // Also check current (re-land)
        if (cp && s.currentPlatform === 0 && s.player.y + 14 > cp.bottom + 60) {
          // fell off start
        }

        // Fell below screen
        if (s.player.y > canvas.height + 100) {
          s.player.die()
          handleEnd(false)
        }
      }
    }

    const draw = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const s = stateRef.current
      ctx.clearRect(0, 0, w, h)

      // Background
      const bg = ctx.createLinearGradient(0, 0, 0, h)
      bg.addColorStop(0, '#0f0c2e')
      bg.addColorStop(1, '#1a1040')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // Stars
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      for (let i = 0; i < 30; i++) {
        const sx = ((i * 137.5 + s.t * 5) % w)
        const sy = (i * 83.7 % (h * 0.7))
        const sz = (Math.sin(s.t + i) * 0.5 + 0.5) * 2
        ctx.beginPath()
        ctx.arc(sx, sy, sz, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.save()
      ctx.translate(-s.cameraX, 0)

      // Ground line
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 1
      ctx.setLineDash([8, 8])
      ctx.beginPath()
      ctx.moveTo(s.cameraX, h * 0.8)
      ctx.lineTo(s.cameraX + w * 2, h * 0.8)
      ctx.stroke()
      ctx.setLineDash([])

      // Platforms
      s.platforms.forEach(p => p.draw(ctx))

      // Particles
      s.particles.draw(ctx)

      // Charge trajectory preview
      if (s.player?.state === 'charging' && s.player.chargeLevel > 0.05) {
        const np = s.platforms[s.currentPlatform + 1]
        if (np) {
          const charge = Math.max(0.2, s.player.chargeLevel)
          const vx = charge * 280 * (np.x > s.player.x ? 1 : -1)
          const vy = -charge * 420
          ctx.strokeStyle = `rgba(255,215,0,${charge * 0.5})`
          ctx.lineWidth = 2
          ctx.setLineDash([4, 6])
          ctx.beginPath()
          let px = s.player.x, py = s.player.y
          let pvx = vx, pvy = vy
          for (let k = 0; k < 20; k++) {
            const dt2 = 0.04
            pvx *= 0.99; pvy += GRAVITY * dt2
            px += pvx * dt2; py += pvy * dt2
            if (k === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
          }
          ctx.stroke()
          ctx.setLineDash([])
        }
      }

      // Player
      s.player?.draw(ctx, s.t)

      // Float texts
      s.floatTexts.draw(ctx)

      ctx.restore()

      // Charge bar (screen space)
      if (s.player?.state === 'charging') {
        const barW = w * 0.5
        const barH = 12
        const barX = (w - barW) / 2
        const barY = h - 80
        ctx.fillStyle = 'rgba(0,0,0,0.5)'
        ctx.beginPath()
        ctx.roundRect(barX, barY, barW, barH, 6)
        ctx.fill()

        const prog = s.player.chargeLevel
        const g = ctx.createLinearGradient(barX, 0, barX + barW, 0)
        g.addColorStop(0, '#1DD1A1')
        g.addColorStop(0.5, '#FFD700')
        g.addColorStop(1, '#FF6B6B')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.roundRect(barX, barY, barW * prog, barH, 6)
        ctx.fill()

        ctx.fillStyle = 'rgba(255,255,255,0.6)'
        ctx.font = '11px Noto Sans SC, sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('按住蓄力  松开跳跃', w / 2, barY + barH + 16)
      }
    }

    animId = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousedown', handleDown)
      canvas.removeEventListener('mouseup', handleUp)
      canvas.removeEventListener('touchstart', handleDown)
      canvas.removeEventListener('touchend', handleUp)
      cancelAnimationFrame(animId)
    }
  }, [ready, paused, handleEnd])

  const score = gameStore.score
  const combo = gameStore.combo
  const progress = stateRef.current.currentPlatform
  const total = stateRef.current.platforms.length

  return (
    <div className="game-page">
      {/* HUD */}
      <div className="game-hud">
        <button className="hud-btn" onClick={() => setPaused(p => !p)}>
          {paused ? '▶' : '⏸'}
        </button>
        <div className="hud-level">{levelInfo?.name || levelId}</div>
        <div className="hud-score font-number">{score.toLocaleString()}</div>
      </div>

      {combo >= 3 && (
        <div className="combo-display animate-scaleIn">
          <span className="combo-num font-number">{combo}</span>
          <span className="combo-label">COMBO</span>
        </div>
      )}

      {/* Progress */}
      <div className="progress-indicator">
        {progress}/{total - 1}
        <div className="pi-bar">
          <div className="pi-fill" style={{ width: `${Math.min(100, (progress / (total - 1)) * 100)}%` }} />
        </div>
      </div>

      <canvas ref={canvasRef} className="game-canvas" />

      {/* Pause overlay */}
      {paused && (
        <div className="pause-overlay">
          <div className="pause-modal animate-scaleIn">
            <div className="pause-title">⏸ 游戏暂停</div>
            <div className="pause-score font-number">{score.toLocaleString()} 分</div>
            <button className="btn btn-primary" onClick={() => setPaused(false)}>继续游戏</button>
            <button className="btn btn-ghost" onClick={() => navigate(`/levels/${levelId?.split('-')[0]}`)}>返回关卡</button>
            <button className="btn btn-ghost" onClick={() => navigate('/')}>返回主页</button>
          </div>
        </div>
      )}
    </div>
  )
}
