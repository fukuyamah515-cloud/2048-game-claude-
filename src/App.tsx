import { Board } from './components/Board'
import { useGame } from './hooks/useGame'
import { useSwipe } from './hooks/useSwipe'
import './App.css'

function App() {
  const { board, score, best, status, applyMove, reset, continuePlaying } = useGame()
  const swipeHandlers = useSwipe(applyMove)

  return (
    <div className="app">
      <header className="header">
        <h1>2048</h1>
        <div className="scores">
          <div className="score-box">
            <span className="label">Score</span>
            <span className="value">{score}</span>
          </div>
          <div className="score-box">
            <span className="label">Best</span>
            <span className="value">{best}</span>
          </div>
        </div>
      </header>

      <div className="controls">
        <p>Combine tiles with arrow keys, WASD, or swipe to reach 2048.</p>
        <button type="button" onClick={reset}>
          New Game
        </button>
      </div>

      <div className="board-wrapper" {...swipeHandlers}>
        <Board board={board} />

        {status === 'won' && (
          <div className="overlay">
            <p>You win!</p>
            <button type="button" onClick={continuePlaying}>
              Keep playing
            </button>
            <button type="button" onClick={reset}>
              New Game
            </button>
          </div>
        )}

        {status === 'lost' && (
          <div className="overlay">
            <p>Game over</p>
            <button type="button" onClick={reset}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
