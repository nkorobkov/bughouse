import { useState, useEffect } from 'preact/hooks'
import './app.css'

type Game = {
  id: number
  team1: [string, string]
  team2: [string, string]
  player1: string
  player2: string
  color1: 'white' | 'black'
  color2: 'white' | 'black'
  winner?: 'team1' | 'team2'
}

type ScheduleState = {
  players: string[]
  games: Game[]
  totalGames: 6 | 12
  chessPieceIndex: number
}

type GameTemplate = {
  team1: [0 | 1 | 2 | 3, 0 | 1 | 2 | 3]
  team2: [0 | 1 | 2 | 3, 0 | 1 | 2 | 3]
  player1: 0 | 1 | 2 | 3
  player2: 0 | 1 | 2 | 3
}

// Players A=0, B=1, C=2, D=3. Three team compositions × four top-board matchups
// each = 12 distinct games. player1 is top-board white, player2 is top-board black.
// In every pair of games per composition, A is on top once and bottom once, and
// the two head-to-head opponent pairings are both covered. First 6 give each
// player exactly 3 whites and 3 blacks; all 12 give 6 and 6.
const HARDCODED_GAMES: GameTemplate[] = [
  // AB vs CD — A plays C (top), then A plays D (bottom)
  { team1: [0, 1], team2: [2, 3], player1: 0, player2: 2 }, // top A vs C, bot B vs D
  { team1: [0, 1], team2: [2, 3], player1: 1, player2: 2 }, // top B vs C, bot A vs D
  // AC vs BD — A plays D (top), then A plays B (bottom)
  { team1: [0, 2], team2: [1, 3], player1: 0, player2: 3 }, // top A vs D, bot C vs B
  { team1: [0, 2], team2: [1, 3], player1: 2, player2: 3 }, // top C vs D, bot A vs B
  // AD vs BC — A plays B (top), then A plays C (bottom)
  { team1: [0, 3], team2: [1, 2], player1: 0, player2: 1 }, // top A vs B, bot D vs C
  { team1: [0, 3], team2: [1, 2], player1: 3, player2: 1 }, // top D vs B, bot A vs C
  // Second half — the other opponent pairing for each composition
  // AB vs CD — A plays D (top), then A plays C (bottom)
  { team1: [0, 1], team2: [2, 3], player1: 0, player2: 3 }, // top A vs D, bot B vs C
  { team1: [0, 1], team2: [2, 3], player1: 1, player2: 3 }, // top B vs D, bot A vs C
  // AC vs BD — A plays B (top), then A plays D (bottom)
  { team1: [0, 2], team2: [1, 3], player1: 0, player2: 1 }, // top A vs B, bot C vs D
  { team1: [0, 2], team2: [1, 3], player1: 2, player2: 1 }, // top C vs B, bot A vs D
  // AD vs BC — A plays C (top), then A plays B (bottom)
  { team1: [0, 3], team2: [1, 2], player1: 0, player2: 2 }, // top A vs C, bot D vs B
  { team1: [0, 3], team2: [1, 2], player1: 3, player2: 2 }, // top D vs C, bot A vs B
]

function generateSchedule(players: string[], totalGames: 6 | 12): Game[] {
  return HARDCODED_GAMES.slice(0, totalGames).map((t, i) => ({
    id: i + 1,
    team1: [players[t.team1[0]], players[t.team1[1]]],
    team2: [players[t.team2[0]], players[t.team2[1]]],
    player1: players[t.player1],
    player2: players[t.player2],
    color1: 'white',
    color2: 'black',
  }))
}

function toggleAllColors(schedule: ScheduleState): ScheduleState {
  return {
    ...schedule,
    games: schedule.games.map(game => ({
      ...game,
      color1: game.color1 === 'white' ? 'black' : 'white',
      color2: game.color2 === 'white' ? 'black' : 'white'
    }))
  }
}

function calculateWins(games: Game[], players: string[]): Record<string, number> {
  const wins: Record<string, number> = {}
  players.forEach(p => wins[p] = 0)

  games.forEach(game => {
    if (game.winner === 'team1') {
      // Both players on team1 get a win
      wins[game.team1[0]] = (wins[game.team1[0]] || 0) + 1
      wins[game.team1[1]] = (wins[game.team1[1]] || 0) + 1
    } else if (game.winner === 'team2') {
      // Both players on team2 get a win
      wins[game.team2[0]] = (wins[game.team2[0]] || 0) + 1
      wins[game.team2[1]] = (wins[game.team2[1]] || 0) + 1
    }
  })

  return wins
}

function capitalizeName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Chess piece sets (white and black versions)
const chessPieces = [
  { white: '♔', black: '♚' }, // King
  { white: '♕', black: '♛' }, // Queen
  { white: '♖', black: '♜' }, // Rook
  { white: '♗', black: '♝' }, // Bishop
  { white: '♘', black: '♞' }, // Knight
  { white: '♙', black: '♟' }  // Pawn
]

function getRandomChessPieceIndex() {
  return Math.floor(Math.random() * chessPieces.length)
}

export function App() {
  const [schedule, setSchedule] = useState<ScheduleState | null>(null)
  const [playerNames, setPlayerNames] = useState(['', '', '', ''])
  const [totalGames, setTotalGames] = useState<6 | 12>(12)
  const [showWins, setShowWins] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bughouse-schedule')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSchedule(parsed)
      } catch (e) {
        console.error('Failed to load schedule from localStorage', e)
      }
    }
  }, [])

  // Save to localStorage whenever schedule changes
  useEffect(() => {
    if (schedule) {
      localStorage.setItem('bughouse-schedule', JSON.stringify(schedule))
    }
  }, [schedule])

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    // Capitalize player names
    const capitalizedNames = playerNames.map(name => capitalizeName(name))
    const players = capitalizedNames.filter(name => name.trim() !== '')
    if (players.length !== 4) {
      alert('Please enter exactly 4 player names')
      return
    }

    // Check for duplicate player names
    const uniquePlayers = new Set(players)
    if (uniquePlayers.size !== players.length) {
      alert('Please enter 4 different player names. Duplicate names are not allowed.')
      return
    }

    const games = generateSchedule(players, totalGames)
    const newSchedule = { players, games, totalGames, chessPieceIndex: getRandomChessPieceIndex() }
    setSchedule(newSchedule)
    localStorage.setItem('bughouse-schedule', JSON.stringify(newSchedule))
  }

  const handleReset = () => {
    setSchedule(null)
    setPlayerNames(['', '', '', ''])
    setTotalGames(12)
    localStorage.removeItem('bughouse-schedule')
  }

  const handleToggleColors = () => {
    if (!schedule) return
    const updatedSchedule = toggleAllColors(schedule)
    setSchedule(updatedSchedule)
  }

  const handleMarkWinner = (gameId: number, winner: 'team1' | 'team2') => {
    if (!schedule) return
    const game = schedule.games.find(g => g.id === gameId)
    if (!game) return
    
    // Toggle: if already marked with this winner, unmark it
    const newWinner = game.winner === winner ? undefined : winner
    
    const updatedGames = schedule.games.map(game =>
      game.id === gameId ? { ...game, winner: newWinner } : game
    )
    const updatedSchedule = { ...schedule, games: updatedGames }
    setSchedule(updatedSchedule)
    localStorage.setItem('bughouse-schedule', JSON.stringify(updatedSchedule))
  }

  const handlePrint = () => {
    window.print()
  }

  const wins = schedule ? calculateWins(schedule.games, schedule.players) : {}

  if (!schedule) {
    return (
      <div class="app">
        <div class="container">
          <h1>Bughouse Bracket</h1>
          <form onSubmit={handleSubmit} class="input-form">
            <div class="input-group">
              <label>Player 1</label>
              <input
                type="text"
                value={playerNames[0]}
                onInput={(e) => {
                  const newNames = [...playerNames]
                  newNames[0] = (e.target as HTMLInputElement).value
                  setPlayerNames(newNames)
                }}
                required
              />
            </div>
            <div class="input-group">
              <label>Player 2</label>
              <input
                type="text"
                value={playerNames[1]}
                onInput={(e) => {
                  const newNames = [...playerNames]
                  newNames[1] = (e.target as HTMLInputElement).value
                  setPlayerNames(newNames)
                }}
                required
              />
            </div>
            <div class="input-group">
              <label>Player 3</label>
              <input
                type="text"
                value={playerNames[2]}
                onInput={(e) => {
                  const newNames = [...playerNames]
                  newNames[2] = (e.target as HTMLInputElement).value
                  setPlayerNames(newNames)
                }}
                required
              />
            </div>
            <div class="input-group">
              <label>Player 4</label>
              <input
                type="text"
                value={playerNames[3]}
                onInput={(e) => {
                  const newNames = [...playerNames]
                  newNames[3] = (e.target as HTMLInputElement).value
                  setPlayerNames(newNames)
                }}
                required
              />
            </div>
            <div class="input-group">
              <label>Number of Games</label>
              <div class="game-toggle">
                <button
                  type="button"
                  class={`toggle-option ${totalGames === 6 ? 'active' : ''}`}
                  onClick={() => setTotalGames(6)}
                >
                  6 games
                </button>
                <button
                  type="button"
                  class={`toggle-option ${totalGames === 12 ? 'active' : ''}`}
                  onClick={() => setTotalGames(12)}
                >
                  12 games
                </button>
              </div>
            </div>
            <button type="submit" class="submit-btn">Generate Schedule</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div class="app">
      <div class="container">
        <div class="header-actions">
          <h1>Bughouse Bracket</h1>
          <div class="actions">
            <button onClick={handleReset} class="action-btn">New Players</button>
            <button onClick={handleToggleColors} class="action-btn">Toggle All Colors</button>
            <button onClick={handlePrint} class="action-btn print-btn">Print</button>
          </div>
        </div>

        <div class="players-info">
          <p><strong>Players:</strong> {schedule.players.join(', ')}</p>
          <p><strong>Total Games:</strong> {schedule.totalGames}</p>
        </div>

        <div class="games-list">
          {(() => {
            const pieces = chessPieces[schedule.chessPieceIndex ?? 0]
            const whitePiece = pieces.white
            const blackPiece = pieces.black

            return schedule.games.map((game) => {
              const team1Str = game.team1.join(' & ')
              const team2Str = game.team2.join(' & ')
            
            // Show both players from each team
            // Top line: team1[0] vs team2[0], Bottom line: team1[1] vs team2[1]
            // Color pieces only show for the actual players in this game
            
            // Determine which players are on each line
            // Top line: player1 vs player2
            // Bottom line: the other player from each team
            const team1Other = game.team1[0] === game.player1 ? game.team1[1] : game.team1[0]
            const team2Other = game.team2[0] === game.player2 ? game.team2[1] : game.team2[0]
            
            // In bughouse, teammates have opposite colors
            const team1OtherColor = game.color1 === 'white' ? 'black' : 'white'
            const team2OtherColor = game.color2 === 'white' ? 'black' : 'white'
            
            const isPlayed = !!game.winner
            
            return (
              <div key={game.id} class={`game-row ${isPlayed ? 'played' : ''}`}>
                <div class="game-number">{game.id}</div>
                <button
                  onClick={() => handleMarkWinner(game.id, 'team1')}
                  class={`winner-btn-left ${game.winner === 'team1' ? 'active' : ''}`}
                  aria-label={`${team1Str} wins`}
                >
                  ✓
                </button>
                <div class="game-content">
                  <div class="game-matchup-row">
                    <div class="team-side team-left">
                      <div class="player-line">
                        <span class="player-name">
                          {game.player1}
                          <span class="color-piece">{game.color1 === 'white' ? whitePiece : blackPiece}</span>
                        </span>
                      </div>
                      <div class="player-line">
                        <span class="player-name">
                          {team1Other}
                          <span class="color-piece">{team1OtherColor === 'white' ? whitePiece : blackPiece}</span>
                        </span>
                      </div>
                    </div>
                    <div class="vs-divider">vs</div>
                    <div class="team-side team-right">
                      <div class="player-line">
                        <span class="player-name">
                          {game.player2}
                          <span class="color-piece">{game.color2 === 'white' ? whitePiece : blackPiece}</span>
                        </span>
                      </div>
                      <div class="player-line">
                        <span class="player-name">
                          {team2Other}
                          <span class="color-piece">{team2OtherColor === 'white' ? whitePiece : blackPiece}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleMarkWinner(game.id, 'team2')}
                  class={`winner-btn-right ${game.winner === 'team2' ? 'active' : ''}`}
                  aria-label={`${team2Str} wins`}
                >
                  ✓
                </button>
              </div>
            )
          })
          })()}
        </div>

        <div class="wins-section">
          <button
            onClick={() => setShowWins(!showWins)}
            class="wins-toggle"
          >
            Individual Wins {showWins ? '▼' : '▶'}
          </button>
          {showWins && (
            <div class="wins-list">
              {schedule.players.map(player => (
                <div key={player} class="win-item">
                  <span class="win-player">{player}</span>
                  <span class="win-count">{wins[player] || 0}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
