import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { chaptersApi, gameApi } from '../../api/client'
import './LevelSelect.css'

interface Level {
  id: string
  name: string
  description: string
  difficulty: number
  is_boss: boolean
  target_score: number
  order_in_chapter: number
}

interface Chapter {
  id: number
  name: string
  subtitle: string
  theme_color: string
  icon: string
}

export default function LevelSelect() {
  const { chapterId } = useParams<{ chapterId: string }>()
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [levels, setLevels] = useState<Level[]>([])
  const [levelStars, setLevelStars] = useState<Record<string, { stars: number; best_score: number }>>({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const id = Number(chapterId)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      chaptersApi.getById(id),
      chaptersApi.getLevels(id),
      gameApi.getLevelStars().catch(() => ({})),
    ]).then(([ch, lvs, stars]) => {
      setChapter(ch)
      setLevels(lvs)
      setLevelStars(stars)
    }).finally(() => setLoading(false))
  }, [id])

  const getDifficultyBars = (d: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <div key={i} className={`diff-bar ${i < Math.ceil(d / 2) ? 'active' : ''}`} />
    ))

  const getStarDisplay = (levelId: string) => {
    const info = levelStars[levelId]
    const stars = info?.stars ?? 0
    return [1, 2, 3].map(s => (
      <span key={s} className={`level-star ${stars >= s ? 'earned' : 'empty'}`}>
        {stars >= s ? '⭐' : '☆'}
      </span>
    ))
  }

  const isCompleted = (levelId: string) => (levelStars[levelId]?.stars ?? 0) > 0

  if (loading) {
    return (
      <div className="level-select loading-screen">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <div className="level-select" style={{ '--ch-color': chapter?.theme_color } as React.CSSProperties}>
      <header className="ls-header">
        <button className="back-btn" onClick={() => navigate('/')}>‹</button>
        <div className="ls-title-area">
          <span className="ls-icon">{chapter?.icon}</span>
          <div>
            <h2 className="ls-chapter-name">第{id}章 · {chapter?.name}</h2>
            <p className="ls-subtitle">{chapter?.subtitle}</p>
          </div>
        </div>
      </header>

      <div className="ls-levels">
        {levels.map((level, idx) => (
          <div
            key={level.id}
            className={`level-card ${level.is_boss ? 'boss' : ''} ${isCompleted(level.id) ? 'completed' : ''} animate-fadeInUp`}
            style={{ animationDelay: `${idx * 0.05}s` }}
            onClick={() => navigate(`/game/${level.id}`)}
          >
            <div className="level-num font-number">
              {level.is_boss ? '👑' : level.order_in_chapter}
            </div>
            <div className="level-info">
              <div className="level-name">{level.name}</div>
              <div className="level-desc">{level.description}</div>
              <div className="level-meta">
                <div className="diff-bars">{getDifficultyBars(level.difficulty)}</div>
                <span className="target-score font-number">🎯 {level.target_score}</span>
              </div>
            </div>
            <div className="level-stars-wrap">
              <div className="level-stars">{getStarDisplay(level.id)}</div>
              {levelStars[level.id] && (
                <div className="level-best font-number">{levelStars[level.id].best_score.toLocaleString()}</div>
              )}
            </div>
            <div className="level-arrow">›</div>
          </div>
        ))}
      </div>
    </div>
  )
}
