import { Outcomes, Outcome } from './types'
import { GameHeader, Cell } from './display'

import { getWinner, hasTie, minimaxMove } from './minimax'

export class Game {
    // Array of 10 numbers representing the game state. First 9 numbers are the
    // current state of the board, and the last number is the current player (0 for X, or 1 for O)
    // 0 - empty
    // 1 - X
    // 2 - O
    state: number[]

    // For each index i in the game state, there are 3 numbers in the
    // probability array at index 3i, 3i + 1, and 3i + 2, where the
    // first is the chance of success, second is neutral, third is failure
    probability: number[]

    // Flags for whether a player is an "AI" (0 index ignored)
    cpu: boolean[] = [ false, false, true ]
    timeout: number[] = [ 0, 3000, 3000 ]
    depth: number[] = [0, 5, 7]
    maxDepth: number[] = []

    // Display elements and state
    element: HTMLElement
    clicking: boolean = false
    thinking: boolean = false
    header: GameHeader
    status: HTMLElement

    // Grid of cells for displaying the game
    cell: Cell[]

    constructor() {
        const game = this

        // Initialize state and probabilities
        this.reset()

        // Initialize the UI
        this.element = document.getElementById('game')
        this.initializeHeader()
        this.initializeOverlay()
        this.initializeCells()
    }

    private initializeHeader() {
        this.header = new GameHeader()
        this.header.setPlayer(this.state[9])
        this.element.appendChild(this.header.element)
        
        this.status = document.createElement('p')
        this.status.className = 'status'
        this.status.innerText = 'Click "start playing" to begin the match'
        this.element.appendChild(this.status)
    }

    private updateStatus() {
        if (! this.status)
            return
        
        const player = this.getPlayer()
        const piece = (player == 1) ? 'X' : 'O'
        if (this.isComputerPlayer()) {    
            this.setStatus('Thinking up to ' + this.depth[player] + ' moves ahead...')
        }
        else {
            this.setStatus('Select a move for ' + piece)
        }
    }

    private setStatus(status: string) {
        this.status.innerText = status
    }

    private initializeOverlay() {
        const game = this
        const overlay = document.getElementById('overlay')
        document.getElementById('start').addEventListener('click', function() {
            overlay.style.display = 'none'
            game.start()
        })
        this.playerSelect(1)
        this.playerSelect(2)
    }

    private initializeCells() {
        const game = this
        // Initialize all display cells 
        this.cell = []
        for (let y = 0 ; y < 3 ; y++) {
            // Create a row element for the cells
            const row = document.createElement('div')
            row.className = 'row'
            this.element.appendChild(row)

            for (let x = 0 ; x < 3 ; x++) {
                const cell = new Cell(x, y, this.getProbability(x, y))
                this.cell.push(cell)
                row.appendChild(cell.element)

                // Attach a click handler to pass events to this game instance
                // when there is a click on a square
                cell.click(function() {
                    // Trigger click handler
                    game.clicked(this)
                })
            }
        }
    }

    private playerSelect(player: number) {
        const game = this
        const select = document.getElementById('p' + player) as HTMLSelectElement

        select.addEventListener('change', function(e) {
            game.setPlayerType(player, select.value)
        })
        game.setPlayerType(player, select.value)
    }

    private setPlayerType(player: number, value: string) {
        // Sets to false if human selected, otherwise true
        this.cpu[player] = true
        delete this.depth[player]
        delete this.maxDepth[player]

        switch (value) {
        case 'human': this.cpu[player] = false; break;
        case 'easy': this.depth[player] = 4; break;
        case 'medium': this.depth[player] = 5; break;
        case 'hard': this.depth[player] = 6; break;
        case 'master':
            this.depth[player] = 7
            this.maxDepth[player] = 15
            break;
        }

        this.header.updatePlayer(player, this.cpu[player], value)
    }

    start() {
        if (this.isComputerPlayer())
            setTimeout(function() {
                this.think()
            }.bind(this), 10)
        this.updateStatus()
    }

    reset(initialPlayer = 1) {
        this.state = new Array(10).fill(0)
        this.state[9] = initialPlayer
        this.randomize()

        if (this.cell) {
            for (let i = 0 ; i < 9 ; i++) {
                this.cell[i].reset(this.getProbabilityAtIndex(i))
            }
        }

        this.clicking = false
        this.thinking = false

        if (this.header) {
            this.header.setPlayer(initialPlayer)
        }
    }

    think() {
        if (! this.isComputerPlayer())
            return
        this.updateStatus()

        const game = this
        const player = this.getPlayer()
        const timeout = this.timeout[player]
        const start = Date.now()
        const end = start + timeout

        const initialDepth = this.depth[player]
        let bestMove = minimaxMove(this.state, this.probability, initialDepth)

        if (this.maxDepth[player] && (start + (Date.now() - start) * 2 < end) )
            for (let depth = initialDepth + 1 ; depth <= this.maxDepth[player] ; depth++) {
                // If there isn't enough time left to do the next depth search, which will ostensibly take longer
                if (Date.now() >= end)
                    break
                
                this.setStatus('Thinking further, up to ' + depth + ' moves ahead...')
                const searchStart = Date.now()
                const move = minimaxMove(this.state, this.probability, depth)
                const duration = Date.now() - searchStart
                if (move != bestMove) {
                    // console.log('Changing best move from ' + bestMove + ' to ' + move + ' at depth ' + depth)
                    bestMove = move
                }

                // If the next iteration will take longer than the timeout
                if (Date.now() + duration >= end)
                    break
            }

        setTimeout(() => {
            // console.log('Choosing ' + bestMove)
            game.clicked(game.cell[bestMove])
        }, 1)
        
        
    }

    randomize() {
        const prob = new Array(27)
        for (let i = 0 ; i < 27 ; i += 3) {
            prob[i] = 5 + 5 * Math.floor(Math.random() * 18)
            prob[i + 1] = 5 + 5 * Math.floor(Math.random() * ((100 - prob[i]) / 5 - 1))
            prob[i + 2] = 100 - prob[i] - prob[i + 1]

            // More normal distribution of probabilities
            // prob[i] = prob[i + 1] = prob[i + 2] = 5
            // for (let j = 0 ; j < 17 ; j++) {
            //     prob[i + Math.floor(Math.random() * 3)] += 5
            // }
            
        }
        this.probability = prob
    }

    private clicked(cell: Cell) {
        // If there is a piece in this cell, ignore the click, or
        // if there is another cell already being clicked or a move is being evaluated
        if (cell == null || this.clicking || this.thinking || this.state[cell.index] != 0)
            return

        // Get the random outcome and highlight it for the cell
        const outcome = cell.randomOutcome()
        cell.highlight(outcome)

        const game = this
        this.clicking = true
        setTimeout(() => {
            cell.resetHighlight()
            
            // Play the move on the cell, and switch players
            game.playMove(outcome, cell)
            game.finishMove()
        }, 1000)
    }

    private playMove(outcome: Outcome, cell: Cell) {
        if (outcome == 'success') {
            this.state[cell.index] = this.getPlayer()
            cell.mark(this.getPlayer())
        }
        else if (outcome == 'failure') {
            this.state[cell.index] = this.getNextPlayer()
            cell.mark(this.getNextPlayer())
        }
    }

    private finishMove() {
        const game = this
        const winner = getWinner(this.state)
        const tied = hasTie(this.state)

        if (tied || winner != 0) {
            if (winner != 0) {
                this.setStatus('Winner is ' + (winner == 1 ? 'X' : 'O'))
                this.header.setWinner(winner)
            }
            else if (tied) {
                this.setStatus('Game was a tie')
                this.header.setTie()
            }
            
            setTimeout(() => {
                game.reset(winner != 0 ? winner : this.getNextPlayer())
                game.start()
            }, 1000)
        }
        else {
            this.switchPlayer()
            this.clicking = false
            this.thinking = false
            this.updateStatus()

            if (this.isComputerPlayer())
                setTimeout(() => {
                    game.think()
                }, 1)
        }
    }

    /**
     * Hook for UI to get probability values
     * @param x 
     * @param y 
     * @returns 
     */
    getProbability(x: number, y: number): Outcomes<number> {
        return this.getProbabilityAtIndex(y * 3 + x)
    }

    getProbabilityAtIndex(index: number): Outcomes<number> {
        const prob = this.probability.slice(index * 3, index * 3 + 3)
        return {
            success: prob[0],
            neutral: prob[1],
            failure: prob[2]
        }
    }

    // Get value from array
    getState(x: number, y: number) {
        return this.state[y * 3 + x]
    }

    // Last index is current player
    getPlayer() {
        return this.state[9]
    }

    getPlayerPiece() {
        return this.state[9] == 1 ? 'X' : 'O'
    }

    getNextPlayer() {
        return 1 + this.state[9] % 2
    }

    switchPlayer() {
        this.state[9] = 1 + this.state[9] % 2
        this.header.setPlayer(this.state[9])
    }

    isComputerPlayer(): boolean {
        return this.cpu[this.state[9]] === true
    }
}