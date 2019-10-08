const GoRule = function (runtime) {
    this.runtime = runtime;
    this.width = runtime.width;
    this.height = runtime.height;
}

GoRule.isAsphyxiating = function (runtime, x, y, c) {
    const rule = new GoRule(runtime);
    return rule._isAsphyxiating(x, y, c);
}

GoRule.prototype._isAsphyxiating = function (x, y, c) {
    this.runtime.board[x][y] = c;
    this._clearDead(x, y, c);
    const breach = !this._searchBreath(x, y);
    this.runtime.board[x][y] = '';
    return breach;
}

GoRule.prototype._clearDead = function (x, y, c) {
    const xx = [0, 1, 0, -1];
    const yy = [1, 0, -1, 0];
  
    for (let i = 0; i < 4; i++) {
        const xt = x + xx[i];
        const yt = y + yy[i];

        if (xt >= 0 && xt < this.width && yt >= 0 && yt < this.height
            && this.runtime.boardPass(xt, yt, c)) {
            const chesses = [];
            if (!this._searchBreath(xt, yt, chesses)) {
                this.runtime.kill(chesses);
            }
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

            if (!visited[`${xt}:${yt}`] && xt >= 0 && xt < this.width && yt >= 0 && yt < this.height) {
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
