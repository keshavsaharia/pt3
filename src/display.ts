import { Outcomes, Outcome } from './types'

export class GameHeader {

    element: HTMLElement
    
    p1: HeaderScore
    p2: HeaderScore
    tie: HeaderScore

    constructor() {
        this.element = document.createElement('div')
        this.element.className = 'header'
        
        this.p1 = new HeaderScore('Human')
        this.element.appendChild(this.p1.element)

        this.tie = new HeaderScore('Tie')
        this.element.appendChild(this.tie.element)

        this.p2 = new HeaderScore('CPU')
        this.element.appendChild(this.p2.element)
    }

    updatePlayer(player: number, cpu: boolean, playerType: string) {
        const p = (player == 1) ? this.p1 : this.p2
        p.setType(cpu, playerType)
    }

    setWinner(winner: number) {
        this.setPlayer(0)
        if (winner == 1)
            this.p1.addScore()
        else if (winner == 2)
            this.p2.addScore()
    }

    setTie() {
        this.setPlayer(0)
        this.tie.addScore()
    }

    setPlayer(player: number) {
        this.p1.setActive(player == 1)
        this.p2.setActive(player == 2)
    }

}

export class HeaderScore {

    element: HTMLElement
    private label: HTMLElement
    private value: HTMLElement

    tie: boolean = false
    score: number = 0

    constructor(label: string) {
        this.element = document.createElement('div')
        this.element.className = 'score'

        this.label = document.createElement('label')
        this.label.innerText = label
        this.element.appendChild(this.label)
        this.element.appendChild(document.createElement('br'))

        this.value = document.createElement('span')
        this.value.innerText = '0'
        this.element.appendChild(this.value)
    }

    setType(cpu: boolean, type: string) {
        if (cpu) {
            this.label.innerText = 'AI (' + type + ')'
        }
        else this.label.innerText = 'Human'
    }

    setActive(active: boolean = true) {
        this.element.className = 'score' + (active ? ' active' : '')
    }

    addScore() {
        this.setScore(this.score + 1)
    }

    setScore(score: number) {
        this.score = score
        this.value.innerText = score.toString()
    }

    forTie(): HeaderScore {
        this.tie = true
        return this
    }

}

export class Cell {
    element: HTMLElement
    x: number
    y: number
    index: number

    private value: Outcomes<number>
    private probability: Probability
    private marking: HTMLElement

    constructor(x: number, y: number, value: Outcomes<number>) {
        this.x = x
        this.y = y
        this.index = y * 3 + x
        this.value = value
        this.probability = new Probability(value)
        
        this.element = document.createElement('div')
        this.element.className = 'col'
        this.element.appendChild(this.probability.element)
        
        this.marking = document.createElement('div')
        this.marking.className = 'mark'
        this.marking.style.display = 'none'
        this.element.appendChild(this.marking)
    }

    reset(value: Outcomes<number>) {
        this.marking.innerText = ''
        this.marking.style.display = 'none'
        
        this.value = value
        this.probability.setValue(value)
        this.probability.show()
    }

    randomOutcome(): Outcome {
        const v = Math.random() * 100
        if (v <= this.value.success)
            return 'success'
        else if (v <= this.value.success + this.value.neutral)
            return 'neutral'
        else
            return 'failure'
    }

    highlight(outcome: Outcome) {
        this.probability.highlight(outcome)
    }

    resetHighlight() {
        this.probability.resetHighlight()
    }

    mark(value: number) {
        this.probability.hide()
        this.marking.innerText = (value == 1) ? 'X' : 'O'
        this.marking.style.display = 'block'
    }

    click(handler: (this: Cell, index: number) => any) {
        const cell = this
        this.element.addEventListener('click', () => {
            handler.call(cell)
        })
    }
}

class Probability {
    element: HTMLElement
    outcome: Outcomes<ProbabilityOutcome>
    value: Outcomes<number>

    constructor(value: Outcomes<number>) {
        this.element = document.createElement('div')
        this.element.className = 'prob'

        this.outcome = {} as any
        Object.keys(value).forEach((o) => {
            this.outcome[o] = new ProbabilityOutcome(o as Outcome, value[o])
            this.element.appendChild(this.outcome[o].element)
        })
    }

    setValue(value: Outcomes<number>) {
        Object.keys(value).forEach((o) => {
            this.outcome[o].setValue(value[o])
        })
    }

    highlight(outcome: Outcome) {
        this.element.className = 'prob ' + outcome
        Object.keys(this.outcome).forEach((o) => {
            const el = this.outcome[o].element
            el.style.opacity = (o == outcome) ? '1.0' : '0.2'
        })
    }

    resetHighlight() {
        this.element.className = 'prob'
        Object.keys(this.outcome).forEach((o) => {
            this.outcome[o].element.style.opacity = '1.0'
        })
    }

    show() {
        this.element.style.display = 'block'
    }

    hide() {
        this.element.style.display = 'none'
    }
}

class ProbabilityOutcome {
    private static COLOR: Outcomes<string> = {
        'success': '#9BC53D',
        'neutral': '#CEBD3C',
        'failure': '#C3423F'
    }

    element: HTMLElement
    private svg: HTMLElement
    private value: HTMLElement

    constructor(outcome: Outcome, value: number) {
        this.element = document.createElement('div')

        this.svg = document.createElement('img')
        this.svg.setAttribute('src', 'svg/' + outcome + '.svg')
        this.element.appendChild(this.svg)

        this.value = document.createElement('div')
        this.value.className = 'value'
        this.value.style.background = ProbabilityOutcome.COLOR[outcome]
        this.setValue(value)
        this.element.appendChild(this.value)
    }

    setValue(value: number) {
        this.value.style.width = Math.round(10 + value * 1.25) + 'px'
        this.value.innerText = value + '%'
    }

}