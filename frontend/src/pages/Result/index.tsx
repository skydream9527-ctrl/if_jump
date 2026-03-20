import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { playerApi } from '../../api/client'
import { usePlayerStore } from '../../store/playerStore'
import './Result.css'

interface ResultState {
  score: number
  perfectJumps: number
  coinsEarned: number
  completed: boolean
  elapsed: number
}

const REVIVE_COST = 50

export default function ResultPage() {
  const { levelId } = useParams<{ levelId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state as ResultState) || { score: 0, perfectJumps: 0, coinsEarned: 0, completed: false, elapsed: 0 }
  const player = usePlayerStore()

  const [showStars, setShowStars] = useState(false)
  const [showRewards, setShowRewards] = useState(false)
  const [reviving, setReviving] = useState(false)

  const chapterId = levelId?.split('-')[0] || '1'
  const stars = state.completed
    ? state.perfectJumps >= 5 ? 3 : state.score >= 500 ? 2 : 1
    : 0

  useEffect(() => {
    player.fetch()
    const t1 = setTimeout(() => setShowStars(true), 400)
    const t2 = setTimeout(() => setShowRewards(true), 900)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  const coinsReward = (stars * 30) + state.coinsEarned

  const nextLevel = () => {
    const parts = levelId?.split('-') || ['1', '1']
    const next = `${parts[0]}-${parseInt(parts[1]) + 1}`
    navigate(`/game/${next}`)
  }

  const hasShield = player.items.some(i => i.item_type === 'shield' && i.quantity > 0)
  const canAffordRevive = player.coins >= REVIVE_COST

  const handleRevive = async (method: 'coins' | 'shield') => {
    if (reviving) return
    setReviving(true)
    try {
      if (method === 'coins') {
        await playerApi.updateProfile({ coins: player.coins - REVIVE_COST })
        player.addCoins(-REVIVE_COST)
      }
      // Navigate back to game with revive flag
      navigate(`/game/${levelId}`, { state: { revive: true, prevScore: state.score } })
    } catch {
      setReviving(false)
    }
  }

  return (
    <div className={`result-page ${state.completed ? 'success' : 'failed'}`}>
      <div className="result-bg-glow" />

      <div className="result-content">
        {/* Header */}
        <div className={`result-header animate-scaleIn`}>
          {state.completed ? (
            <>
              <div className="result-emoji">🎉</div>
              <h1 className="result-title success-text">关卡完成！</h1>
            </>
          ) : (
            <>
              <div className="result-emoji">💔</div>
              <h1 className="result-title fail-text">再试一次</h1>
            </>
          )}
        </div>

        {/* Stars */}
        {state.completed && (
          <div className={`result-stars ${showStars ? 'visible' : ''}`}>
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`result-star ${showStars && stars >= s ? 'active' : ''}`}
                style={{ animationDelay: `${(s - 1) * 0.2}s` }}
              >⭐</span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="result-stats">
          <div className="stat-row">
            <span className="stat-label">本关得分</span>
            <span className="stat-val font-number">{state.score.toLocaleString()}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">完美跳跃</span>
            <span className="stat-val font-number">{state.perfectJumps} 次</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">通关用时</span>
            <span className="stat-val font-number">{Math.round(state.elapsed)} 秒</span>
          </div>
        </div>

        {/* Revive section for failure */}
        {!state.completed && (
          <div className="revive-section animate-fadeInUp">
            <div className="revive-title">💡 还想继续吗？</div>
            <div className="revive-options">
              {canAffordRevive && (
                <button
                  className="btn revive-btn coins-revive"
                  onClick={() => handleRevive('coins')}
                  disabled={reviving}
                >
                  <span>🪙</span>
                  <span>花费 {REVIVE_COST} 金币复活</span>
                  <span className="revive-coin-count font-number">(拥有 {player.coins})</span>
                </button>
              )}
              {hasShield && (
                <button
                  className="btn revive-btn shield-revive"
                  onClick={() => handleRevive('shield')}
                  disabled={reviving}
                >
                  <span>🛡️</span>
                  <span>使用护盾复活</span>
                </button>
              )}
              {!canAffordRevive && !hasShield && (
                <div className="no-revive">金币不足，无法复活</div>
              )}
            </div>
          </div>
        )}

        {/* Rewards */}
        {showRewards && state.completed && (
          <div className="result-rewards animate-fadeInUp">
            <div className="reward-title">获得奖励</div>
            <div className="reward-items">
              <div className="reward-item">
                <span className="ri-icon">🪙</span>
                <span className="ri-val font-number">+{coinsReward}</span>
              </div>
              {stars === 3 && (
                <div className="reward-item">
                  <span className="ri-icon">🛡️</span>
                  <span className="ri-val">护盾×1</span>
                </div>
              )}
              {stars >= 2 && (
                <div className="reward-item">
                  <span className="ri-icon">🏅</span>
                  <span className="ri-val">徽章</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="result-actions">
          {state.completed && (
            <button className="btn btn-primary btn-lg" onClick={nextLevel}>
              下一关 →
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => navigate(`/game/${levelId}`)}>
            {state.completed ? '再玩一次' : '重试'}
          </button>
          <button className="btn btn-ghost" onClick={() => navigate(`/levels/${chapterId}`)}>
            返回章节
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/')}>
            返回主页
          </button>
        </div>
      </div>
    </div>
  )
}
