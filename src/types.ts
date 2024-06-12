export type Outcome = 'success' | 'neutral' | 'failure'
export type Outcomes<T> = Record<Outcome, T>

export type PlayerType = 'human' | 'easy' | 'medium' | 'hard' | 'master'