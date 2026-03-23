// ===== Platform Entity =====
import type { PlatformData } from '../api/client'

export interface PlatformConfig extends PlatformData {}

const PLATFORM_COLORS: Record<string, string[]> = {
  default: ['#FF9F43', '#E67E22'],
  ch1: ['#FFF9E6', '#F7DC6F'],
  ch1_salt: ['#8D6E63', '#5D4037'],
  ch1_sweet: ['#FFB74D', '#F57C00'],
  ch1_boss: ['#FFD700', '#F39C12'],
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
  id: number; x: number; y: number; width: number; height: number
  type: string; theme: string
  originalX: number; moveDir = 1; moveOffset = 0
  moveSpeed: number; moveRange: number

  // Mechanics
  hasObstacle: boolean; obstacleType: string; obstacleX: number; obstacleDir = 1
  waitTimer: number; waitElapsed = 0; waitFailed = false
  hasSteam: boolean; steamTimer = 0; steamActive = false
  isWobble: boolean; wobbleVal = 0; wobbleDamping = 0.9
  isSlippery: boolean
  isBoss: boolean

  constructor(config: PlatformConfig) {
    this.id = config.id
    this.x = config.x
    this.y = config.y
    this.width = config.width
    this.height = config.height || 20
    this.type = config.type || 'standard'
    this.theme = config.theme || 'default'
    this.originalX = config.x
    this.moveSpeed = config.move_speed || 80
    this.moveRange = config.move_range || 50
    
    this.hasObstacle = !!config.has_obstacle
    this.obstacleType = config.obstacle_type || ''
    this.obstacleX = this.x
    
    this.waitTimer = config.wait_timer || 0
    this.hasSteam = !!config.has_steam
    this.isWobble = !!config.is_wobble
    this.isSlippery = !!config.is_slippery
    this.isBoss = !!config.is_boss
  }

  update(dt: number) {
    // Platform moving
    if (this.type === 'moving') {
      this.moveOffset += dt * this.moveSpeed * this.moveDir
      if (Math.abs(this.moveOffset) > this.moveRange) {
        this.moveDir *= -1
      }
      this.x = this.originalX + this.moveOffset
    }
    
    // Obstacle moving
    if (this.hasObstacle && this.obstacleType === 'youtiao') {
      this.obstacleX += dt * 50 * this.obstacleDir
      if (Math.abs(this.obstacleX - this.x) > this.width / 2) {
        this.obstacleDir *= -1
      }
    } else {
      this.obstacleX = this.x
    }
    
    // Steam cycle (3s on, 2s off)
    if (this.hasSteam) {
      this.steamTimer += dt
      if (this.steamTimer > 5) this.steamTimer -= 5
      this.steamActive = this.steamTimer < 3
    }
    
    // Wobble decay
    if (this.isWobble && Math.abs(this.wobbleVal) > 0.01) {
      this.wobbleVal *= this.wobbleDamping
    }
  }

  triggerWobble(offsetRatio: number) {
    // offsetRatio is -1 to 1 depending on where player landed
    this.wobbleVal = offsetRatio * 20
  }

  draw(ctx: CanvasRenderingContext2D, isCurrent: boolean) {
    ctx.save()
    
    // Wobble translation
    if (this.isWobble) {
      ctx.translate(this.x, this.y)
      ctx.rotate(this.wobbleVal * Math.PI / 180)
      ctx.translate(-this.x, -this.y)
    }

    const colors = PLATFORM_COLORS[this.theme] || PLATFORM_COLORS.default
    const grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height)
    grad.addColorStop(0, colors[0])
    grad.addColorStop(1, colors[1])
    ctx.fillStyle = grad
    ctx.beginPath()
    
    if (this.theme.includes('salt') || this.theme.includes('sweet') || this.isWobble) {
      // Draw as bowl/round shape
      ctx.ellipse(this.x, this.y, this.width/2, this.height, 0, 0, Math.PI*2)
    } else {
      ctx.roundRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height, 8)
    }
    ctx.fill()
    
    // Center zone indicator
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    const cw = this.width * 0.25
    ctx.beginPath()
    ctx.roundRect(this.x - cw / 2, this.y - this.height / 2, cw, this.height, 4)
    ctx.fill()
    
    // Draw wait timer if current
    if (this.waitTimer > 0 && isCurrent) {
      const remaining = Math.max(0, this.waitTimer - this.waitElapsed)
      ctx.fillStyle = remaining === 0 ? '#1DD1A1' : '#FF6B6B'
      ctx.font = 'bold 16px Arial'
      ctx.textAlign = 'center'
      ctx.fillText(Math.ceil(remaining).toString(), this.x, this.y + this.height + 20)
      if (remaining === 0) {
        ctx.shadowColor = '#1DD1A1'
        ctx.shadowBlur = 10
        ctx.strokeStyle = '#1DD1A1'
        ctx.lineWidth = 2
        ctx.strokeRect(this.x - this.width/2, this.y - this.height/2, this.width, this.height)
      }
    }
    
    // Draw Steam
    if (this.hasSteam && this.steamActive) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      for(let i=0; i<5; i++) {
        ctx.beginPath()
        ctx.arc(this.x - this.width/2 + (this.width/5)*i + 10, this.y - 30 - Math.random()*20, 15, 0, Math.PI*2)
        ctx.fill()
      }
    }

    // Draw Obstacle
    if (this.hasObstacle) {
      if (this.obstacleType === 'youtiao') {
        ctx.fillStyle = '#F5B041'
        ctx.fillRect(this.obstacleX - 5, this.y - 40, 10, 30)
      } else if (this.obstacleType === 'wonton') {
        ctx.fillStyle = '#FFD54F'
        ctx.beginPath()
        ctx.arc(this.obstacleX, this.y - 20, 12, 0, Math.PI*2)
        ctx.fill()
      }
    }
    
    // Boss icon
    if (this.isBoss) {
      ctx.font = '24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('👑', this.x, this.y - this.height)
    }

    ctx.restore()
  }

  get centerX() { return this.x }
  get centerY() { return this.y }
  get left() { return this.x - this.width / 2 }
  get right() { return this.x + this.width / 2 }
  get top() { return this.y - this.height / 2 }
  get bottom() { return this.y + this.height / 2 }

  containsPoint(px: number, py: number) {
    return px >= this.left && px <= this.right && py >= this.top && py <= this.bottom + 10
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
  isSlipping = false
  slipFriction = 0.98

  constructor(x: number, y: number) {
    this.x = x; this.y = y
  }

  jump(targetX: number) {
    if (this.state !== 'idle') return
    this.state = 'jumping'
    this.scaleY = 1
    
    const dx = targetX - this.x
    // Automatic jump calculation based on distance
    // Base horizontal velocity
    let baseVx = 280
    // Adjust vx based on distance, but cap it to prevent shooting off screen
    this.vx = dx > 0 ? Math.min(baseVx * (Math.abs(dx) / 150), 400) : Math.max(-baseVx * (Math.abs(dx) / 150), -400)
    
    // Fixed vertical jump velocity
    this.vy = -450
  }

  update(dt: number, gravity: number) {
    if (this.state === 'jumping') {
      this.vy += gravity * dt
      this.x += this.vx * dt
      this.y += this.vy * dt
    } else if (this.state === 'idle' && this.isSlipping) {
      this.x += this.vx * dt
      this.vx *= this.slipFriction
      if (Math.abs(this.vx) < 5) {
        this.vx = 0
        this.isSlipping = false
      }
    }
  }

  land(platform: Platform) {
    this.y = platform.top
    if (platform.isSlippery) {
      this.isSlipping = true
      this.vx *= 0.8 // Retain some horizontal momentum
    } else {
      this.vy = 0; this.vx = 0
      this.isSlipping = false
    }
    this.state = 'idle'
  }
  
  bounce() {
    this.vx = -this.vx * 0.5
    this.vy = -200
    this.state = 'jumping'
  }

  die() { this.state = 'dead' }

  draw(ctx: CanvasRenderingContext2D, _t: number) {
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

    // Remove charge glow

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