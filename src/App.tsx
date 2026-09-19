import { useState } from 'react'
import { Game2048 } from './components/Game2048'
import { CardManager } from './components/cards/CardManager'

type View = 'game' | 'cards'

function App() {
  const [view, setView] = useState<View>('game')

  return (
    <div className="app-shell">
      <nav className="view-tabs">
        <button
          type="button"
          className={view === 'game' ? 'active' : ''}
          onClick={() => setView('game')}
        >
          2048ゲーム
        </button>
        <button
          type="button"
          className={view === 'cards' ? 'active' : ''}
          onClick={() => setView('cards')}
        >
          名刺管理
        </button>
      </nav>

      {view === 'game' ? <Game2048 /> : <CardManager />}
    </div>
  )
}

export default App
