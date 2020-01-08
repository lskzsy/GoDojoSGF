const GoRule = function (runtime) {
    this.runtime = runtime;

    this.lastKill = null
    this.lastPut = null
}

GoRule.prototype.isAsphyxiating = function (x, y, c) {
    this.runtime.board[x][y] = c;
    this._clearDead(x, y, c);
    const breach = this._searchBreath(x, y);
    if (breach) {
        this.lastPut = {
            x: x,
            y: y
        }
    }
    this.runtime.board[x][y] = '';
    return !breach;
}

GoRule.prototype._clearDead = function (x, y, c) {
    const xx = [0, 1, 0, -1];
    const yy = [1, 0, -1, 0];
  
    let clear = []
    for (let i = 0; i < 4; i++) {
        const xt = x + xx[i];
        const yt = y + yy[i];

        if (xt >= 0 && xt < this.runtime.width && yt >= 0 && yt < this.runtime.height
            && this.runtime.boardPass(xt, yt, c)) {
            const chesses = [];
            if (!this._searchBreath(xt, yt, chesses)) {
                clear = clear.concat(chesses);
            }
        }
    }

    if (clear.length > 0) {
        let isomorph = false;
        // console.log(this.lastPut, this.lastKill, clear[0], x, y);
        if (this.lastPut != null && this.lastKill != null && clear.length == 1) {
            isomorph = clear[0].x == this.lastPut.x && clear[0].y == this.lastPut.y
            && x == this.lastKill.x && y == this.lastKill.y;
        }

        if (!(this.runtime.isKo && isomorph)) {
            this.lastKill = clear.length == 1 ? clear[0] : null;
            this.runtime.kill(clear);
        } 
    }
}

GoRule.prototype._searchBreath = function (x, y, chesses = []) {
    const xx = [0, 1, 0, -1];
    const yy = [1, 0, -1, 0];
    const queue = [];
    const visited = {};
    const c = this.runtime.board[x][y];
    const breath = false;
    queue.push({x: x, y: y});
    visited[`${x}:${y}`] = true;
    chesses.push({x: x, y: y});

    while (queue.length > 0) {
        // bfs
        const cur = queue.splice(0, 1)[0];
        for (let i = 0; i < 4; i++) {
            const xt = cur.x + xx[i];
            const yt = cur.y + yy[i];

            if (!visited[`${xt}:${yt}`] && xt >= 0 && xt < this.runtime.width && yt >= 0 && yt < this.runtime.height) {
                visited[`${xt}:${yt}`] = true;
                const chess = this.runtime.board[xt][yt];
                if (chess == c) {
                    queue.push({x: xt, y: yt});
                    chesses.push({x: xt, y: yt});
                } else if (chess == '') {
                    return true;
                }
            }
        }
    }
    return breath;
}

module.exports = GoRule;
