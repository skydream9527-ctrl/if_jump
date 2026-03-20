import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { chaptersApi } from '../../api/client'
import { usePlayerStore } from '../../store/playerStore'
import './MainMenu.css'

interface Chapter {
  id: number
  name: string
  subtitle: string
  description: string
  theme_color: string
  unlock_score: number
  total_levels: number
  icon: string
}

export default function MainMenu() {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const player = usePlayerStore()

  useEffect(() => {
    player.fetch()
    chaptersApi.getAll().then(setChapters).finally(() => setLoading(false))
  }, [])

  const isUnlocked = (chapter: Chapter) => player.total_score >= chapter.unlock_score

  if (loading) {
    return (
      <div className="main-menu loading-screen">
        <div className="loading-spinner" />
        <p>加载中...</p>
      </div>
    )
  }

  return (
    <div className="main-menu">
      {/* Header */}
      <header className="mm-header">
        <div className="mm-logo animate-float">
          <span className="logo-emoji">🍳</span>
          <div>
            <h1 className="logo-title">吃了么</h1>
            <p className="logo-sub">美食跳一跳</p>
          </div>
        </div>
        <div className="mm-player-info">
          <div className="player-stat">
            <span className="stat-icon">⭐</span>
            <span className="stat-value font-number">{player.total_score.toLocaleString()}</span>
          </div>
          <div className="player-stat">
            <span className="stat-icon">🪙</span>
            <span className="stat-value font-number">{player.coins.toLocaleString()}</span>
          </div>
          <div className="player-avatar">{player.name[0]}</div>
        </div>
      </header>

      {/* Progress */}
      <div className="mm-progress">
        <p className="progress-label">总进度 — {player.current_chapter}/10章</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(player.current_chapter / 10) * 100}%` }} />
        </div>
      </div>

      {/* Hero Chapter Banner */}
      <div className="mm-hero">
        <div className="hero-text">
          <p className="hero-eyebrow">当前进行</p>
          <h2 className="hero-title">第{player.current_chapter}章</h2>
          {chapters[player.current_chapter - 1] && (
            <>
              <p className="hero-subtitle">{chapters[player.current_chapter - 1].name}</p>
              <p className="hero-desc">{chapters[player.current_chapter - 1].description}</p>
            </>
          )}
        </div>
        <button
          className="btn btn-primary btn-lg hero-btn animate-pulse"
          onClick={() => navigate(`/levels/${player.current_chapter}`)}
        >
          继续挑战 →
        </button>
      </div>

      {/* Chapters Grid */}
      <section className="mm-chapters">
        <h3 className="section-title">所有章节</h3>
        <div className="chapters-grid">
          {chapters.map((ch, idx) => {
            const unlocked = isUnlocked(ch)
            return (
              <div
                key={ch.id}
                className={`chapter-card ${unlocked ? 'unlocked' : 'locked'}`}
                style={{ '--ch-color': ch.theme_color } as React.CSSProperties}
                onClick={() => unlocked && navigate(`/levels/${ch.id}`)}
              >
                <div className="chapter-icon">{ch.icon}</div>
                <div className="chapter-num font-number">CH.{String(ch.id).padStart(2, '0')}</div>
                <div className="chapter-name">{ch.name}</div>
                <div className="chapter-sub">{ch.subtitle}</div>
                {!unlocked && (
                  <div className="lock-overlay">
                    <span className="lock-icon">🔒</span>
                    <span className="lock-score font-number">{ch.unlock_score.toLocaleString()}</span>
                    <span className="lock-label">分解锁</span>
                  </div>
                )}
                {unlocked && <div className="chapter-arrow">›</div>}
              </div>
            )
          })}
        </div>
      </section>

      {/* Bottom nav */}
      <nav className="mm-bottom-nav">
        <button className="nav-btn" onClick={() => navigate('/leaderboard')}>
          <span>🏆</span><span>排行榜</span>
        </button>
        <button className="nav-btn" onClick={() => navigate(`/levels/${player.current_chapter}`)}>
          <span>🎮</span><span>开始游戏</span>
        </button>
        <button className="nav-btn" onClick={() => navigate('/achievements')}>
          <span>🎖️</span><span>成就</span>
        </button>
      </nav>
    </div>
  )
}
