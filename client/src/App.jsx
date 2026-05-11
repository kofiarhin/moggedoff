import { BrowserRouter, Route, Routes } from 'react-router-dom'
import BattlePage from './pages/BattlePage'
import BattleDetailPage from './pages/BattleDetailPage'
import BattleHistoryPage from './pages/BattleHistoryPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BattlePage />} />
        <Route path="/battle-history" element={<BattleHistoryPage />} />
        <Route path="/battles/:battleId" element={<BattleDetailPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
