// ===== Platform Entity =====
export interface PlatformConfig {
  id: number
  x: number
  y: number
  width: number
  height: number
  type?: string
  theme?: string
}

const PLATFORM_COLORS: Record<string, string[]> = {
  default: ['#FF9F43', '#E67E22'],
  ch1: ['#FFF9E6', '#F7DC6F'],
  ch2: ['#74B9FF', '#0984E3'],
  ch3: ['#FD79A8', '#E84393'],
  ch4: ['#E17055', '#C0392B'],
  ch5: ['#6C5CE7', '#5A4BD1'],
  ch6: ['#a29bfe', '#7986cb'],
  ch7: ['#D63031', '#B71C1C'],
  ch8: ['#0984E3', '#1565C0'],
  ch9: ['#FDCB6E', '#F39C12'],
  ch10: ['#A29BFE', '#7B68EE'],
}

export class Platform {
  x: number; y: number; width: number; height: number
  id: number; type: string; theme: string
  originalX: number; moveDir = 1; moveOffset = 0

  constructor(config: PlatformConfig) {
    this.id = config.id
    this.x = config.x
    this.y = config.y
    this.width = config.width
    this.height = config.height || 20
    this.type = config.type || 'standard'
    this.theme = config.theme || 'default'
    this.originalX = config.x
  }

  update(dt: number) {
    if (this.type === 'moving') {
      this.moveOffset += dt * 80 * this.moveDir
      if (Math.abs(this.moveOffset) > 50) this.moveDir *= -1
      this.x = this.originalX + this.moveOffset
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const colors = PLATFORM_COLORS[this.theme] || PLATFORM_COLORS.default
    const grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height)
    grad.addColorStop(0, colors[0])
    grad.addColorStop(1, colors[1])
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.roundRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height, 8)
    ctx.fill()
    // Center zone indicator
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    const cw = this.width * 0.25
    ctx.beginPath()
    ctx.roundRect(this.x - cw / 2, this.y - this.height / 2, cw, this.height, 4)
    ctx.fill()
  }

  get centerX() { return this.x }
  get centerY() { return this.y }
  get left() { return this.x - this.width / 2 }
  get right() { return this.x + this.width / 2 }
  get top() { return this.y - this.height / 2 }
  get bottom() { return this.y + this.height / 2 }

  containsPoint(px: number, py: number) {
    return px >= this.left && px <= this.right && py >= this.top && py <= this.bottom
  }

  inCenterZone(px: number) {
    return Math.abs(px - this.x) < this.width * 0.15
  }
}

// ===== Player Entity =====
export class Player {
  x: number; y: number
  vx = 0; vy = 0
  width = 28; height = 28
  state: 'idle' | 'charging' | 'jumping' | 'landing' | 'dead' = 'idle'
  chargeLevel = 0   // 0 → 1
  scaleY = 1; opacity = 1
  chargeTime = 0

  constructor(x: number, y: number) {
    this.x = x; this.y = y
  }

  startCharge() {
    if (this.state !== 'idle') return
    this.state = 'charging'
    this.chargeTime = 0
    this.chargeLevel = 0
  }

  updateCharge(dt: number) {
    if (this.state !== 'charging') return
    this.chargeTime += dt
    this.chargeLevel = Math.min(1, this.chargeTime / 1.5)
    this.scaleY = 1 - this.chargeLevel * 0.25
  }

  releaseJump(targetX: number) {
    if (this.state !== 'charging') return
    this.state = 'jumping'
    this.scaleY = 1
    const charge = Math.max(0.2, this.chargeLevel)
    const dist = charge * 3.5 * 100
    const dx = targetX - this.x
    const ratio = Math.min(dist / Math.abs(dx), 1)
    this.vx = dx > 0 ? charge * 280 : -charge * 280
    this.vx *= ratio
    this.vy = -charge * 420
    this.chargeLevel = 0
  }

  update(dt: number, gravity: number) {
    if (this.state === 'jumping') {
      this.vy += gravity * dt
      this.x += this.vx * dt
      this.y += this.vy * dt
    }
  }

  land(platform: Platform) {
    this.y = platform.top
    this.vy = 0; this.vx = 0
    this.state = 'idle'
  }

  die() { this.state = 'dead' }

  draw(ctx: CanvasRenderingContext2D, t: number) {
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.scale(1, this.scaleY)
    ctx.globalAlpha = this.opacity

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.beginPath()
    ctx.ellipse(0, this.height / 2, 12, 4, 0, 0, Math.PI * 2)
    ctx.fill()

    // Body
    const bodyGrad = ctx.createRadialGradient(-4, -4, 2, 0, 0, 18)
    bodyGrad.addColorStop(0, '#FFD93D')
    bodyGrad.addColorStop(1, '#FF9F43')
    ctx.fillStyle = bodyGrad
    ctx.beginPath()
    ctx.arc(0, 0, 14, 0, Math.PI * 2)
    ctx.fill()

    // Face
    ctx.fillStyle = '#2F3542'
    ctx.beginPath()
    ctx.arc(-4, -2, 2.5, 0, Math.PI * 2)
    ctx.arc(4, -2, 2.5, 0, Math.PI * 2)
    ctx.fill()

    // Smile
    ctx.strokeStyle = '#2F3542'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, 2, 5, 0.1 * Math.PI, 0.9 * Math.PI)
    ctx.stroke()

    // Charge glow
    if (this.state === 'charging' && this.chargeLevel > 0) {
      const glowColor = this.chargeLevel > 0.7 ? 'rgba(255,100,50,0.5)' :
                        this.chargeLevel > 0.4 ? 'rgba(255,215,0,0.4)' :
                        'rgba(255,255,255,0.3)'
      ctx.beginPath()
      ctx.arc(0, 0, 16 + this.chargeLevel * 10, 0, Math.PI * 2)
      const glowGrad = ctx.createRadialGradient(0, 0, 14, 0, 0, 26)
      glowGrad.addColorStop(0, glowColor)
      glowGrad.addColorStop(1, 'transparent')
      ctx.fillStyle = glowGrad
      ctx.fill()
    }

    ctx.restore()
  }
}

// ===== Particle System =====
interface Particle {
  x: number; y: number; vx: number; vy: number
  life: number; maxLife: number; size: number
  color: string; gravity: number
}

export class ParticleSystem {
  private particles: Particle[] = []

  emit(x: number, y: number, opts: {
    count?: number; color?: string; speed?: number; gravity?: number; size?: number
  } = {}) {
    const { count = 8, color = '#FFD700', speed = 150, gravity = 200, size = 4 } = opts
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5)
      const v = speed * (0.7 + Math.random() * 0.6)
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * v,
        vy: Math.sin(angle) * v - 80,
        life: 1, maxLife: 1,
        size: size * (0.6 + Math.random() * 0.8),
        color, gravity,
      })
    }
  }

  update(dt: number) {
    this.particles = this.particles.filter(p => {
      p.vy += p.gravity * dt
      p.x += p.vx * dt; p.y += p.vy * dt
      p.life -= dt * 1.5
      return p.life > 0
    })
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save()
      ctx.globalAlpha = p.life
      ctx.fillStyle = p.color
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }
}

// ===== Floating Score Text =====
interface FloatText {
  x: number; y: number; text: string; color: string; life: number; vy: number
}

export class FloatTextSystem {
  private texts: FloatText[] = []

  show(x: number, y: number, text: string, color = '#FFD700') {
    this.texts.push({ x, y, text, color, life: 1, vy: -60 })
  }

  update(dt: number) {
    this.texts = this.texts.filter(t => {
      t.y += t.vy * dt
      t.life -= dt * 1.2
      return t.life > 0
    })
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const t of this.texts) {
      ctx.save()
      ctx.globalAlpha = t.life
      ctx.fillStyle = t.color
      ctx.font = `bold ${20 + (1 - t.life) * 10}px Outfit, sans-serif`
      ctx.textAlign = 'center'
      ctx.shadowColor = 'rgba(0,0,0,0.5)'
      ctx.shadowBlur = 4
      ctx.fillText(t.text, t.x, t.y)
      ctx.restore()
    }
  }
}
