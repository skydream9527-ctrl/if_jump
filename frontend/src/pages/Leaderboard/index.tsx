import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { gameApi } from '../../api/client'
import './Leaderboard.css'

interface Entry {
  rank: number
  player_name: string
  score: number
  level_id: string | null
}

export default function LeaderboardPage() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    gameApi.getLeaderboard()
      .then(setEntries)
      .finally(() => setLoading(false))
  }, [])

  const rankStyle = (rank: number) => {
    if (rank === 1) return 'gold'
    if (rank === 2) return 'silver'
    if (rank === 3) return 'bronze'
    return ''
  }

  const rankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <div className="leaderboard-page">
      <div className="lb-bg-glow" />
      <header className="lb-header">
        <button className="back-btn" onClick={() => navigate('/')}>‹</button>
        <div className="lb-title-area">
          <span className="lb-icon">🏆</span>
          <div>
            <h1 className="lb-title">排行榜</h1>
            <p className="lb-subtitle">全球最高分</p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="lb-loading">
          <div className="loading-spinner" />
          <p>加载中...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="lb-empty">
          <div className="lb-empty-icon">🎮</div>
          <p>还没有记录，赶紧去打高分吧！</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>去游戏</button>
        </div>
      ) : (
        <div className="lb-list">
          {entries.map((entry, idx) => (
            <div
              key={idx}
              className={`lb-entry animate-fadeInUp ${rankStyle(entry.rank)}`}
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              <div className="lb-rank font-number">{rankIcon(entry.rank)}</div>
              <div className="lb-player-info">
                <div className="lb-player-name">{entry.player_name}</div>
                {entry.level_id && (
                  <div className="lb-level-tag">关卡 {entry.level_id}</div>
                )}
              </div>
              <div className="lb-score font-number">{entry.score.toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
