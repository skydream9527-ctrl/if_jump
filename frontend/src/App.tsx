import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainMenu from './pages/MainMenu'
import LevelSelect from './pages/LevelSelect'
import GamePage from './pages/Game'
import ResultPage from './pages/Result'
import LeaderboardPage from './pages/Leaderboard'
import AchievementsPage from './pages/Achievements'
import './styles/index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/levels/:chapterId" element={<LevelSelect />} />
        <Route path="/game/:levelId" element={<GamePage />} />
        <Route path="/result/:levelId" element={<ResultPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
