
export function minimaxMove(state: number[], probability: number[], depth: number = 10): number {
    if (hasTie(state) || getWinner(state) != 0)
        return -1

    return minimax(state, probability, state[9], true, true, depth, -1000000, 1000000)
}

function minimax(
    state: number[], probability: number[], 
    forPlayer: number, findBest: boolean, findMove: boolean,
    depth: number,
    alpha = Number.MIN_VALUE,
    beta = Number.MAX_VALUE): number {

    if (hasTie(state))
        return 0
    
    // Check for winner
    const winner = getWinner(state)
    if (winner != 0) {
        return (winner == forPlayer) ? 1000 : -1000
    }
    // Return difference in intermediate heuristic for state
    else if (depth == 0) {
        return heuristic(state, forPlayer) - heuristic(state, 1 + forPlayer % 2)
    }

    // Iterate through all possible moves
    let best = findBest ? -1000000000 : 1000000000
    let bestMove = -1

    for (let i = 0 ; i < 9 ; i++) {
        if (state[i] == 0) {
            let result = 0

            // Set state to current player's symbol
            const successState = nextState(state)
            successState[i] = state[9]
            result += probability[i * 3] * minimax(successState, probability, forPlayer, !findBest, false, depth - 1, alpha, beta)

            // No change except player index changing
            const neutralState = nextState(state)
            result += probability[i * 3 + 1] * minimax(neutralState, probability, forPlayer, !findBest, false, depth - 1, alpha, beta)

            // Set state to next player's piece after state change
            const failureState = nextState(state)
            failureState[i] = failureState[9]
            result += probability[i * 3 + 2] * minimax(failureState, probability, forPlayer, !findBest, false, depth - 1, alpha, beta)

            // Scale all probabilities by 100 since values are stored as whole number percents
            result = result / 100

            // Update best value and alpha-beta pruning
            if (findBest) {
                if (result > best) {
                    best = result
                    bestMove = i
                }
                if (result > alpha)
                    alpha = result
            }
            else {
                if (result < best) {
                    best = result
                    bestMove = i
                }
                if (result < beta)
                    beta = result
            }
            if (beta <= alpha)
                break
        }
    }

    if (findMove)
        return bestMove
    return best
}

function nextState(state: number[]) {
    const next = Array.from(state)
    next[9] = 1 + next[9] % 2
    return next
}

function heuristic(state: number[], player: number) {
    return 0
}

export function hasTie(state: number[]): boolean {
    for (let i = 0 ; i < 9 ; i++)
        if (state[i] == 0)
            return false
    return true
}

export function getWinner(state: number[]): number {
    // Columns
    for (let i = 0 ; i < 3 ; i++) {
        if (state[i] > 0 && state[i] === state[i + 3] && state[i] === state[i + 6])
            return state[i]
    }
    // Rows
    for (let i = 0 ; i < 9 ; i += 3) {
        if (state[i] > 0 && state[i] == state[i + 1] && state[i] == state[i + 2])
            return state[i]
    }
    // Diagonals
    if (state[0] > 0 && state[0] == state[4] && state[4] == state[8])
        return state[0]
    if (state[2] > 0 && state[2] == state[4] && state[4] == state[6])
        return state[2]
    // No winner
    return 0
}