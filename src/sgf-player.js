const GoRule    = require('./go-rule');
const SGFBranch = require('./sgf-branch');
const Util      = require('./util');
const SGFStep   = require('./sgf-step');

const SGFPlayer = function (properties, vboard, branch) {
    // this.currentStep = 0;
    // this.board = [];
    // this.front = null;
    // this.select = 'b';
    // this.isKo = isKo

    // this.data = [];
    // this.killBy = {};
    // this.root = [];

    // this.width = 0;
    // this.height = 0;

    // this.onStoneCreated = null;
    // this.onStoneDeleted = null;
    // this.onBranchMove = null;
    
    // this.goRule = new GoRule(this);
    // this.branch = new SGFBranch();


    this.properties = properties;
    this.vboard     = vboard;
    this.branch     = branch;

    this.step       = 0;
    this.route      = [-1];
}

SGFPlayer.prototype.next = function () {
    const cp = this.route.slice();
    cp[cp.length - 1]++;
    return cp;
}

SGFPlayer.prototype.getRoute = function () {
    return this.route.slice();
}

SGFPlayer.prototype.continue = function (step=1) {
    for (let i = 0; i < step; i++) {
        this.step++;
        this.route[this.route.length - 1]++;
        const current = this.branch.get(this.route);
        // console.log('player', this.route, current);
        if (Util.typeIs(current, SGFStep)) {
            this.vboard.put(current.stone);
        } else {
            this.step--;
            this.route[this.route.length - 1]--;
            return false;
        }
    }
    return true;
}

SGFPlayer.prototype.back = function (step=1) {
    for (let i = 0; i < step; i++) {
        if (this.step == 0) {
            return false;
        }

        const current = this.branch.get(this.route);
        if (Util.typeIs(current, SGFStep)) {
            this.vboard.delete(current.stone.x, current.stone.y);
        }

        this.step--;
        this.route[this.route.length - 1]--;
        if (this.route[this.route.length - 1] < 0 && this.route.length > 1) {
            this.route.pop();
        }
    }

    return true;
}

SGFPlayer.prototype.checkout = function (branchIndex) {
    this.route[this.route.length - 1] = branchIndex;
    this.route.push(-1);
    this.continue();
}

SGFPlayer.prototype.setFront = function (front) {
    this.front = front;
}

SGFPlayer.prototype.hasFront = function () {
    return this.front != null;
}

SGFPlayer.prototype.init = function (w, h, data) {
    this.width = w;
    this.height = h;

    this.root = data;
    for (let i = 0; i < w; i++) {
        const line = [];
        for (let j = 0; j < h; j++) {
            line.push('');
        }
        this.board.push(line);
    }
}

SGFPlayer.prototype.boardPass = function (x, y, c) {
    return this.board[x][y] != c && this.board[x][y] !== '';
} 

SGFPlayer.prototype.kill = function (chesses) {
    this.killBy[this.currentStep + 1] = [];
    for (let j = 0; j < chesses.length; j++) {
        this.killBy[this.currentStep + 1].push({
            x: chesses[j].x,
            y: chesses[j].y,
            color: this.board[chesses[j].x][chesses[j].y]
        });
        this.board[chesses[j].x][chesses[j].y] = '';
        this.front && this.front.delete(chesses[j].x, chesses[j].y);
    }
}

SGFPlayer.prototype.backLife = function () {
    const dead = this.killBy[this.currentStep];
    if (dead) {
        dead.forEach(d => { this.currentStep--; this.putStone(d); });
        this.killBy[this.currentStep] = false;
    }
}

SGFPlayer.prototype.putStone = function (chess, isNew=false) {
    if (this.board[chess.x][chess.y] === '' 
            && !this.goRule.isAsphyxiating(chess.x, chess.y, chess.color)) {
        this.currentStep++;
        if (isNew) {
            this.branch.insert(chess.x, chess.y, chess.color);
        }
        this.branch.checkMark();
        if (chess.color == 'w') {
            this.front && this.front.putWhite(chess.x, chess.y, this.currentStep);
            this.board[chess.x][chess.y] = 'w';
            this.select = 'b';
            this.front && this.mode == 'repeat' && this.front.select('b');
        } else {
            this.front && this.front.putBlack(chess.x, chess.y, this.currentStep);
            this.board[chess.x][chess.y] = 'b';
            this.select = 'w';
            this.front && this.mode == 'repeat' && this.front.select('w');
        }
        this.data.push(chess);
    }
}

module.exports = SGFPlayer;
