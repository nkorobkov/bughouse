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
  allGames?: Game[] // Store full 12 games for 6-game mode toggle
  showingFirstHalf?: boolean // Track which half we're showing for 6-game mode
}

function generateSchedule(players: string[], totalGames: 6 | 12): Game[] {
  const games: Game[] = []
  let gameId = 1

  // Generate all team combinations (6 teams: AB, AC, AD, BC, BD, CD)
  const teams: [string, string][] = []
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      teams.push([players[i], players[j]])
    }
  }

  // Generate valid team matchups (teams that don't share players)
  // There are exactly 3 matchups: AB vs CD, AC vs BD, AD vs BC
  const matchups: [[string, string], [string, string]][] = []
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const team1 = teams[i]
      const team2 = teams[j]

      // Check if teams share a player (invalid matchup)
      if (team1[0] === team2[0] || team1[0] === team2[1] || 
          team1[1] === team2[0] || team1[1] === team2[1]) {
        continue
      }

      matchups.push([team1, team2])
    }
  }

  if (totalGames === 12) {
    // For 12 games: Each matchup generates 4 games
    // 3 matchups × 4 games = 12 games total
    // Each player pair should appear exactly twice (once white, once black)
    for (let m = 0; m < matchups.length; m++) {
      const [team1, team2] = matchups[m]
      // Generate player pairs with alternating colors to ensure each pair appears twice
      if (m === 0) {
        // AB vs CD: A-C (white/black), A-C (black/white), A-D (white/black), B-C (white/black)
        games.push({
          id: gameId++,
          team1,
          team2,
          player1: team1[0],
          player2: team2[0],
          color1: 'white',
          color2: 'black'
        })
        games.push({
          id: gameId++,
          team1,
          team2,
          player1: team1[0],
          player2: team2[0],
          color1: 'black',
          color2: 'white'
        })
        games.push({
          id: gameId++,
          team1,
          team2,
          player1: team1[0],
          player2: team2[1],
          color1: 'white',
          color2: 'black'
        })
        games.push({
          id: gameId++,
          team1,
          team2,
          player1: team1[1],
          player2: team2[0],
          color1: 'white',
          color2: 'black'
        })
      } else if (m === 1) {
        // AC vs BD: A-B (white/black), A-B (black/white), C-D (white/black), C-D (black/white)
        games.push({
          id: gameId++,
          team1,
          team2,
          player1: team1[0],
          player2: team2[0],
          color1: 'white',
          color2: 'black'
        })
        games.push({
          id: gameId++,
          team1,
          team2,
          player1: team1[0],
          player2: team2[0],
          color1: 'black',
          color2: 'white'
        })
        games.push({
          id: gameId++,
          team1,
          team2,
          player1: team1[1],
          player2: team2[1],
          color1: 'white',
          color2: 'black'
        })
        games.push({
          id: gameId++,
          team1,
          team2,
          player1: team1[1],
          player2: team2[1],
          color1: 'black',
          color2: 'white'
        })
      } else {
        // AD vs BC: A-B (white/black), A-C (white/black), D-B (white/black), D-C (white/black)
        games.push({
          id: gameId++,
          team1,
          team2,
          player1: team1[0],
          player2: team2[0],
          color1: 'white',
          color2: 'black'
        })
        games.push({
          id: gameId++,
          team1,
          team2,
          player1: team1[0],
          player2: team2[1],
          color1: 'white',
          color2: 'black'
        })
        games.push({
          id: gameId++,
          team1,
          team2,
          player1: team1[1],
          player2: team2[0],
          color1: 'white',
          color2: 'black'
        })
        games.push({
          id: gameId++,
          team1,
          team2,
          player1: team1[1],
          player2: team2[1],
          color1: 'white',
          color2: 'black'
        })
      }
    }
    return games
  } else {
    // For 6 games: Each player from team1 plays each player from team2 exactly once
    // This gives us 4 games. Then add 2 more with opposite colors for different pairs
    const [team1, team2] = matchups[0]
    
    // First 4 games: each player pair appears once
    // A vs B, A vs D, C vs B, C vs D (for AC vs BD example)
    games.push({
      id: gameId++,
      team1,
      team2,
      player1: team1[0],
      player2: team2[0],
      color1: 'white',
      color2: 'black'
    })
    games.push({
      id: gameId++,
      team1,
      team2,
      player1: team1[0],
      player2: team2[1],
      color1: 'white',
      color2: 'black'
    })
    games.push({
      id: gameId++,
      team1,
      team2,
      player1: team1[1],
      player2: team2[0],
      color1: 'white',
      color2: 'black'
    })
    games.push({
      id: gameId++,
      team1,
      team2,
      player1: team1[1],
      player2: team2[1],
      color1: 'white',
      color2: 'black'
    })
    
    // Games 5-6: Add two more with opposite colors
    // Repeat C vs B and C vs D with opposite colors (not A's games)
    // This ensures: A plays B once and D once; C plays B twice and D twice
    games.push({
      id: gameId++,
      team1,
      team2,
      player1: team1[1],
      player2: team2[0],
      color1: 'black',
      color2: 'white'
    })
    games.push({
      id: gameId++,
      team1,
      team2,
      player1: team1[1],
      player2: team2[1],
      color1: 'black',
      color2: 'white'
    })
    
    return games
  }
}

function toggleAllColors(schedule: ScheduleState): ScheduleState {
  if (schedule.totalGames === 12) {
    // For 12 games, just toggle colors
    return {
      ...schedule,
      games: schedule.games.map(game => ({
        ...game,
        color1: game.color1 === 'white' ? 'black' : 'white',
        color2: game.color2 === 'white' ? 'black' : 'white'
      }))
    }
  } else {
    // For 6 games, switch to the other 6 games from full schedule
    if (!schedule.allGames) {
      // Generate full 12-game schedule
      const allGames = generateSchedule(schedule.players, 12)
      // Preserve winners from current games
      const winnerMap = new Map<number, 'team1' | 'team2'>()
      schedule.games.forEach(game => {
        if (game.winner) {
          winnerMap.set(game.id, game.winner)
        }
      })
      // Apply winners to corresponding games in allGames
      allGames.forEach(game => {
        const winner = winnerMap.get(game.id)
        if (winner) {
          game.winner = winner
        }
      })
      const newGames = allGames.slice(6, 12).map(game => ({ ...game }))
      return {
        ...schedule,
        allGames,
        games: newGames,
        showingFirstHalf: false
      }
    } else {
      // Preserve winners from current games
      const winnerMap = new Map<number, 'team1' | 'team2'>()
      schedule.games.forEach(game => {
        if (game.winner) {
          winnerMap.set(game.id, game.winner)
        }
      })
      // Apply winners to allGames
      schedule.allGames.forEach(game => {
        const winner = winnerMap.get(game.id)
        if (winner) {
          game.winner = winner
        }
      })
      // Toggle between first 6 and last 6
      const showingFirstHalf = schedule.showingFirstHalf ?? true
      const newGames = (showingFirstHalf ? schedule.allGames.slice(6, 12) : schedule.allGames.slice(0, 6))
        .map(game => ({ ...game }))
      return {
        ...schedule,
        games: newGames,
        showingFirstHalf: !showingFirstHalf
      }
    }
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

function getRandomChessPiece() {
  const randomIndex = Math.floor(Math.random() * chessPieces.length)
  return chessPieces[randomIndex]
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
    const allGames = totalGames === 6 ? generateSchedule(players, 12) : undefined
    const newSchedule = { 
      players, 
      games, 
      totalGames,
      allGames,
      showingFirstHalf: totalGames === 6 ? true : undefined
    }
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
    // Also update allGames if it exists (for 6-game mode)
    const updatedAllGames = schedule.allGames?.map(game =>
      game.id === gameId ? { ...game, winner: newWinner } : game
    )
    const updatedSchedule = { 
      ...schedule, 
      games: updatedGames,
      allGames: updatedAllGames
    }
    setSchedule(updatedSchedule)
    localStorage.setItem('bughouse-schedule', JSON.stringify(updatedSchedule))
  }

  const handlePrint = () => {
    window.print()
  }

  const wins = schedule ? calculateWins(
    schedule.allGames || schedule.games, 
    schedule.players
  ) : {}

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
            // Select random chess piece once for the entire schedule
            const pieces = getRandomChessPiece()
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
