import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { achievementsApi } from '../../api/client'
import './Achievements.css'

interface Achievement {
  id: number
  achievement_id: string
  name: string
  description: string
  icon: string
  condition_type: string
  condition_value: number
  reward_coins: number
}

// For now, we show all achievements as locked (no player_achievement tracking yet)
// This can be enhanced later with a PlayerAchievement table
export default function AchievementsPage() {
  const navigate = useNavigate()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    achievementsApi.getAll()
      .then(setAchievements)
      .finally(() => setLoading(false))
  }, [])

  const conditionLabel = (type: string, value: number) => {
    switch (type) {
      case 'jump': return `完成 ${value} 次跳跃`
      case 'complete_chapter': return `完成第 ${value} 章`
      case 'score': return `累计 ${value.toLocaleString()} 分`
      case 'perfect': return `${value} 次完美落点`
      case 'combo': return `${value} 连击`
      default: return `达成条件 × ${value}`
    }
  }

  return (
    <div className="achievements-page">
      <div className="ach-bg-glow" />
      <header className="ach-header">
        <button className="back-btn" onClick={() => navigate('/')}>‹</button>
        <div className="ach-title-area">
          <span className="ach-icon">🎖️</span>
          <div>
            <h1 className="ach-title">成就系统</h1>
            <p className="ach-subtitle">
              {loading ? '加载中...' : `共 ${achievements.length} 个成就`}
            </p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="ach-loading">
          <div className="loading-spinner" />
        </div>
      ) : (
        <div className="ach-list">
          {achievements.map((ach, idx) => (
            <div
              key={ach.id}
              className="ach-card animate-fadeInUp"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="ach-icon-wrap">
                <span className="ach-emoji">{ach.icon}</span>
              </div>
              <div className="ach-info">
                <div className="ach-name">{ach.name}</div>
                <div className="ach-desc">{ach.description}</div>
                <div className="ach-condition">{conditionLabel(ach.condition_type, ach.condition_value)}</div>
              </div>
              <div className="ach-reward">
                <span className="ach-coin">🪙</span>
                <span className="ach-coin-val font-number">+{ach.reward_coins}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
