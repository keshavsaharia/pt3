define("types", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("display", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Cell = exports.HeaderScore = exports.GameHeader = void 0;
    var GameHeader = (function () {
        function GameHeader() {
            this.element = document.createElement('div');
            this.element.className = 'header';
            this.p1 = new HeaderScore('Human');
            this.element.appendChild(this.p1.element);
            this.tie = new HeaderScore('Tie');
            this.element.appendChild(this.tie.element);
            this.p2 = new HeaderScore('CPU');
            this.element.appendChild(this.p2.element);
        }
        GameHeader.prototype.updatePlayer = function (player, cpu, playerType) {
            var p = (player == 1) ? this.p1 : this.p2;
            p.setType(cpu, playerType);
        };
        GameHeader.prototype.setWinner = function (winner) {
            this.setPlayer(0);
            if (winner == 1)
                this.p1.addScore();
            else if (winner == 2)
                this.p2.addScore();
        };
        GameHeader.prototype.setTie = function () {
            this.setPlayer(0);
            this.tie.addScore();
        };
        GameHeader.prototype.setPlayer = function (player) {
            this.p1.setActive(player == 1);
            this.p2.setActive(player == 2);
        };
        return GameHeader;
    }());
    exports.GameHeader = GameHeader;
    var HeaderScore = (function () {
        function HeaderScore(label) {
            this.tie = false;
            this.score = 0;
            this.element = document.createElement('div');
            this.element.className = 'score';
            this.label = document.createElement('label');
            this.label.innerText = label;
            this.element.appendChild(this.label);
            this.element.appendChild(document.createElement('br'));
            this.value = document.createElement('span');
            this.value.innerText = '0';
            this.element.appendChild(this.value);
        }
        HeaderScore.prototype.setType = function (cpu, type) {
            if (cpu) {
                this.label.innerText = 'AI (' + type + ')';
            }
            else
                this.label.innerText = 'Human';
        };
        HeaderScore.prototype.setActive = function (active) {
            if (active === void 0) { active = true; }
            this.element.className = 'score' + (active ? ' active' : '');
        };
        HeaderScore.prototype.addScore = function () {
            this.setScore(this.score + 1);
        };
        HeaderScore.prototype.setScore = function (score) {
            this.score = score;
            this.value.innerText = score.toString();
        };
        HeaderScore.prototype.forTie = function () {
            this.tie = true;
            return this;
        };
        return HeaderScore;
    }());
    exports.HeaderScore = HeaderScore;
    var Cell = (function () {
        function Cell(x, y, value) {
            this.x = x;
            this.y = y;
            this.index = y * 3 + x;
            this.value = value;
            this.probability = new Probability(value);
            this.element = document.createElement('div');
            this.element.className = 'col';
            this.element.appendChild(this.probability.element);
            this.marking = document.createElement('div');
            this.marking.className = 'mark';
            this.marking.style.display = 'none';
            this.element.appendChild(this.marking);
        }
        Cell.prototype.reset = function (value) {
            this.marking.innerText = '';
            this.marking.style.display = 'none';
            this.value = value;
            this.probability.setValue(value);
            this.probability.show();
        };
        Cell.prototype.randomOutcome = function () {
            var v = Math.random() * 100;
            if (v <= this.value.success)
                return 'success';
            else if (v <= this.value.success + this.value.neutral)
                return 'neutral';
            else
                return 'failure';
        };
        Cell.prototype.highlight = function (outcome) {
            this.probability.highlight(outcome);
        };
        Cell.prototype.resetHighlight = function () {
            this.probability.resetHighlight();
        };
        Cell.prototype.mark = function (value) {
            this.probability.hide();
            this.marking.innerText = (value == 1) ? 'X' : 'O';
            this.marking.style.display = 'block';
        };
        Cell.prototype.click = function (handler) {
            var cell = this;
            this.element.addEventListener('click', function () {
                handler.call(cell);
            });
        };
        return Cell;
    }());
    exports.Cell = Cell;
    var Probability = (function () {
        function Probability(value) {
            var _this = this;
            this.element = document.createElement('div');
            this.element.className = 'prob';
            this.outcome = {};
            Object.keys(value).forEach(function (o) {
                _this.outcome[o] = new ProbabilityOutcome(o, value[o]);
                _this.element.appendChild(_this.outcome[o].element);
            });
        }
        Probability.prototype.setValue = function (value) {
            var _this = this;
            Object.keys(value).forEach(function (o) {
                _this.outcome[o].setValue(value[o]);
            });
        };
        Probability.prototype.highlight = function (outcome) {
            var _this = this;
            this.element.className = 'prob ' + outcome;
            Object.keys(this.outcome).forEach(function (o) {
                var el = _this.outcome[o].element;
                el.style.opacity = (o == outcome) ? '1.0' : '0.2';
            });
        };
        Probability.prototype.resetHighlight = function () {
            var _this = this;
            this.element.className = 'prob';
            Object.keys(this.outcome).forEach(function (o) {
                _this.outcome[o].element.style.opacity = '1.0';
            });
        };
        Probability.prototype.show = function () {
            this.element.style.display = 'block';
        };
        Probability.prototype.hide = function () {
            this.element.style.display = 'none';
        };
        return Probability;
    }());
    var ProbabilityOutcome = (function () {
        function ProbabilityOutcome(outcome, value) {
            this.element = document.createElement('div');
            this.svg = document.createElement('img');
            this.svg.setAttribute('src', 'svg/' + outcome + '.svg');
            this.element.appendChild(this.svg);
            this.value = document.createElement('div');
            this.value.className = 'value';
            this.value.style.background = ProbabilityOutcome.COLOR[outcome];
            this.setValue(value);
            this.element.appendChild(this.value);
        }
        ProbabilityOutcome.prototype.setValue = function (value) {
            this.value.style.width = Math.round(10 + value * 1.25) + 'px';
            this.value.innerText = value + '%';
        };
        ProbabilityOutcome.COLOR = {
            'success': '#9BC53D',
            'neutral': '#CEBD3C',
            'failure': '#C3423F'
        };
        return ProbabilityOutcome;
    }());
});
define("minimax", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getWinner = exports.hasTie = exports.minimaxMove = void 0;
    function minimaxMove(state, probability, depth) {
        if (depth === void 0) { depth = 10; }
        if (hasTie(state) || getWinner(state) != 0)
            return -1;
        return minimax(state, probability, state[9], true, true, depth, -1000000, 1000000);
    }
    exports.minimaxMove = minimaxMove;
    function minimax(state, probability, forPlayer, findBest, findMove, depth, alpha, beta) {
        if (alpha === void 0) { alpha = Number.MIN_VALUE; }
        if (beta === void 0) { beta = Number.MAX_VALUE; }
        if (hasTie(state))
            return 0;
        var winner = getWinner(state);
        if (winner != 0) {
            return (winner == forPlayer) ? 1000 : -1000;
        }
        else if (depth == 0) {
            return heuristic(state, forPlayer) - heuristic(state, 1 + forPlayer % 2);
        }
        var best = findBest ? -1000000000 : 1000000000;
        var bestMove = -1;
        for (var i = 0; i < 9; i++) {
            if (state[i] == 0) {
                var result = 0;
                var successState = nextState(state);
                successState[i] = state[9];
                result += probability[i * 3] * minimax(successState, probability, forPlayer, !findBest, false, depth - 1, alpha, beta);
                var neutralState = nextState(state);
                result += probability[i * 3 + 1] * minimax(neutralState, probability, forPlayer, !findBest, false, depth - 1, alpha, beta);
                var failureState = nextState(state);
                failureState[i] = failureState[9];
                result += probability[i * 3 + 2] * minimax(failureState, probability, forPlayer, !findBest, false, depth - 1, alpha, beta);
                result = result / 100;
                if (findBest) {
                    if (result > best) {
                        best = result;
                        bestMove = i;
                    }
                    if (result > alpha)
                        alpha = result;
                }
                else {
                    if (result < best) {
                        best = result;
                        bestMove = i;
                    }
                    if (result < beta)
                        beta = result;
                }
                if (beta <= alpha)
                    break;
            }
        }
        if (findMove)
            return bestMove;
        return best;
    }
    function nextState(state) {
        var next = Array.from(state);
        next[9] = 1 + next[9] % 2;
        return next;
    }
    function heuristic(state, player) {
        return 0;
    }
    function hasTie(state) {
        for (var i = 0; i < 9; i++)
            if (state[i] == 0)
                return false;
        return true;
    }
    exports.hasTie = hasTie;
    function getWinner(state) {
        for (var i = 0; i < 3; i++) {
            if (state[i] > 0 && state[i] === state[i + 3] && state[i] === state[i + 6])
                return state[i];
        }
        for (var i = 0; i < 9; i += 3) {
            if (state[i] > 0 && state[i] == state[i + 1] && state[i] == state[i + 2])
                return state[i];
        }
        if (state[0] > 0 && state[0] == state[4] && state[4] == state[8])
            return state[0];
        if (state[2] > 0 && state[2] == state[4] && state[4] == state[6])
            return state[2];
        return 0;
    }
    exports.getWinner = getWinner;
});
define("game", ["require", "exports", "display", "minimax"], function (require, exports, display_1, minimax_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Game = void 0;
    var Game = (function () {
        function Game() {
            this.cpu = [false, false, true];
            this.timeout = [0, 3000, 3000];
            this.depth = [0, 5, 7];
            this.maxDepth = [];
            this.clicking = false;
            this.thinking = false;
            var game = this;
            this.reset();
            this.element = document.getElementById('game');
            this.initializeHeader();
            this.initializeOverlay();
            this.initializeCells();
        }
        Game.prototype.initializeHeader = function () {
            this.header = new display_1.GameHeader();
            this.header.setPlayer(this.state[9]);
            this.element.appendChild(this.header.element);
            this.status = document.createElement('p');
            this.status.className = 'status';
            this.status.innerText = 'Click "start playing" to begin the match';
            this.element.appendChild(this.status);
        };
        Game.prototype.updateStatus = function () {
            if (!this.status)
                return;
            var player = this.getPlayer();
            var piece = (player == 1) ? 'X' : 'O';
            if (this.isComputerPlayer()) {
                this.setStatus('Thinking up to ' + this.depth[player] + ' moves ahead...');
            }
            else {
                this.setStatus('Select a move for ' + piece);
            }
        };
        Game.prototype.setStatus = function (status) {
            this.status.innerText = status;
        };
        Game.prototype.initializeOverlay = function () {
            var game = this;
            var overlay = document.getElementById('overlay');
            document.getElementById('start').addEventListener('click', function () {
                overlay.style.display = 'none';
                game.start();
            });
            this.playerSelect(1);
            this.playerSelect(2);
        };
        Game.prototype.initializeCells = function () {
            var game = this;
            this.cell = [];
            for (var y = 0; y < 3; y++) {
                var row = document.createElement('div');
                row.className = 'row';
                this.element.appendChild(row);
                for (var x = 0; x < 3; x++) {
                    var cell = new display_1.Cell(x, y, this.getProbability(x, y));
                    this.cell.push(cell);
                    row.appendChild(cell.element);
                    cell.click(function () {
                        game.clicked(this);
                    });
                }
            }
        };
        Game.prototype.playerSelect = function (player) {
            var game = this;
            var select = document.getElementById('p' + player);
            select.addEventListener('change', function (e) {
                game.setPlayerType(player, select.value);
            });
            game.setPlayerType(player, select.value);
        };
        Game.prototype.setPlayerType = function (player, value) {
            this.cpu[player] = true;
            delete this.depth[player];
            delete this.maxDepth[player];
            switch (value) {
                case 'human':
                    this.cpu[player] = false;
                    break;
                case 'easy':
                    this.depth[player] = 4;
                    break;
                case 'medium':
                    this.depth[player] = 5;
                    break;
                case 'hard':
                    this.depth[player] = 6;
                    break;
                case 'master':
                    this.depth[player] = 7;
                    this.maxDepth[player] = 15;
                    break;
            }
            this.header.updatePlayer(player, this.cpu[player], value);
        };
        Game.prototype.start = function () {
            if (this.isComputerPlayer())
                setTimeout(function () {
                    this.think();
                }.bind(this), 10);
            this.updateStatus();
        };
        Game.prototype.reset = function (initialPlayer) {
            if (initialPlayer === void 0) { initialPlayer = 1; }
            this.state = new Array(10).fill(0);
            this.state[9] = initialPlayer;
            this.randomize();
            if (this.cell) {
                for (var i = 0; i < 9; i++) {
                    this.cell[i].reset(this.getProbabilityAtIndex(i));
                }
            }
            this.clicking = false;
            this.thinking = false;
            if (this.header) {
                this.header.setPlayer(initialPlayer);
            }
        };
        Game.prototype.think = function () {
            if (!this.isComputerPlayer())
                return;
            this.updateStatus();
            var game = this;
            var player = this.getPlayer();
            var timeout = this.timeout[player];
            var start = Date.now();
            var end = start + timeout;
            var initialDepth = this.depth[player];
            var bestMove = (0, minimax_1.minimaxMove)(this.state, this.probability, initialDepth);
            if (this.maxDepth[player] && (start + (Date.now() - start) * 2 < end))
                for (var depth = initialDepth + 1; depth <= this.maxDepth[player]; depth++) {
                    if (Date.now() >= end)
                        break;
                    this.setStatus('Thinking further, up to ' + depth + ' moves ahead...');
                    var searchStart = Date.now();
                    var move = (0, minimax_1.minimaxMove)(this.state, this.probability, depth);
                    var duration = Date.now() - searchStart;
                    if (move != bestMove) {
                        bestMove = move;
                    }
                    if (Date.now() + duration >= end)
                        break;
                }
            setTimeout(function () {
                game.clicked(game.cell[bestMove]);
            }, 1);
        };
        Game.prototype.randomize = function () {
            var prob = new Array(27);
            for (var i = 0; i < 27; i += 3) {
                prob[i] = 5 + 5 * Math.floor(Math.random() * 18);
                prob[i + 1] = 5 + 5 * Math.floor(Math.random() * ((100 - prob[i]) / 5 - 1));
                prob[i + 2] = 100 - prob[i] - prob[i + 1];
            }
            this.probability = prob;
        };
        Game.prototype.clicked = function (cell) {
            if (cell == null || this.clicking || this.thinking || this.state[cell.index] != 0)
                return;
            var outcome = cell.randomOutcome();
            cell.highlight(outcome);
            var game = this;
            this.clicking = true;
            setTimeout(function () {
                cell.resetHighlight();
                game.playMove(outcome, cell);
                game.finishMove();
            }, 1000);
        };
        Game.prototype.playMove = function (outcome, cell) {
            if (outcome == 'success') {
                this.state[cell.index] = this.getPlayer();
                cell.mark(this.getPlayer());
            }
            else if (outcome == 'failure') {
                this.state[cell.index] = this.getNextPlayer();
                cell.mark(this.getNextPlayer());
            }
        };
        Game.prototype.finishMove = function () {
            var _this = this;
            var game = this;
            var winner = (0, minimax_1.getWinner)(this.state);
            var tied = (0, minimax_1.hasTie)(this.state);
            if (tied || winner != 0) {
                if (winner != 0) {
                    this.setStatus('Winner is ' + (winner == 1 ? 'X' : 'O'));
                    this.header.setWinner(winner);
                }
                else if (tied) {
                    this.setStatus('Game was a tie');
                    this.header.setTie();
                }
                setTimeout(function () {
                    game.reset(winner != 0 ? winner : _this.getNextPlayer());
                    game.start();
                }, 1000);
            }
            else {
                this.switchPlayer();
                this.clicking = false;
                this.thinking = false;
                this.updateStatus();
                if (this.isComputerPlayer())
                    setTimeout(function () {
                        game.think();
                    }, 1);
            }
        };
        Game.prototype.getProbability = function (x, y) {
            return this.getProbabilityAtIndex(y * 3 + x);
        };
        Game.prototype.getProbabilityAtIndex = function (index) {
            var prob = this.probability.slice(index * 3, index * 3 + 3);
            return {
                success: prob[0],
                neutral: prob[1],
                failure: prob[2]
            };
        };
        Game.prototype.getState = function (x, y) {
            return this.state[y * 3 + x];
        };
        Game.prototype.getPlayer = function () {
            return this.state[9];
        };
        Game.prototype.getPlayerPiece = function () {
            return this.state[9] == 1 ? 'X' : 'O';
        };
        Game.prototype.getNextPlayer = function () {
            return 1 + this.state[9] % 2;
        };
        Game.prototype.switchPlayer = function () {
            this.state[9] = 1 + this.state[9] % 2;
            this.header.setPlayer(this.state[9]);
        };
        Game.prototype.isComputerPlayer = function () {
            return this.cpu[this.state[9]] === true;
        };
        return Game;
    }());
    exports.Game = Game;
});
