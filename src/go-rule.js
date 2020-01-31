const GoRule = function (vboard, isKo) {
    this.vboard = vboard;
    this.isKo   = isKo;

    this.lastKill = null
    this.lastPut = null

    this.deathStones = [];
}

GoRule.prototype.isAsphyxiating = function (stone) {
    this.vboard.data[stone.x][stone.y] = stone;
    this._clearDead(stone);
    this.deathStones.forEach(stone => this.vboard.data[stone.x][stone.y] = false);
    const breach = this._searchBreath(stone);
    if (breach) {
        this.lastPut = {
            x: stone.x,
            y: stone.y
        }
    }
    this.deathStones.forEach(stone => this.vboard.data[stone.x][stone.y] = stone);
    this.vboard.data[stone.x][stone.y] = false;
    return !breach;
}

GoRule.prototype.getDeathStones = function () {
    return this.deathStones;
}

GoRule.prototype._clearDead = function (stone) {
    const xx = [0, 1, 0, -1];
    const yy = [1, 0, -1, 0];
  
    this.deathStones = [];
    let clear = []
    for (let i = 0; i < 4; i++) {
        const xt = stone.x + xx[i];
        const yt = stone.y + yy[i];

        if (this.vboard.refuse(xt, yt, stone.color)) {
            const chesses = [];
            if (!this._searchBreath(this.vboard.data[xt][yt], chesses)) {
                clear = clear.concat(chesses);
            }
        }
    }

    if (clear.length > 0) {
        let isomorph = false;
        // console.log(this.lastPut, this.lastKill, clear[0], x, y);
        if (this.lastPut != null && this.lastKill != null && clear.length == 1) {
            isomorph = clear[0].x == this.lastPut.x && clear[0].y == this.lastPut.y
            && stone.x == this.lastKill.x && stone.y == this.lastKill.y;
        }

        if (!(this.isKo && isomorph)) {
            this.lastKill = clear.length == 1 ? clear[0] : null;
            this.deathStones = clear;
        } 
    }
}

GoRule.prototype._searchBreath = function (stone, chesses = []) {
    const xx = [0, 1, 0, -1];
    const yy = [1, 0, -1, 0];
    const queue = [];
    const visited = {};
    const breath = false;
    queue.push(stone);
    visited[`${stone.x}:${stone.y}`] = true;
    chesses.push(stone);

    while (queue.length > 0) {
        // bfs
        const cur = queue.splice(0, 1)[0];
        for (let i = 0; i < 4; i++) {
            const xt = cur.x + xx[i];
            const yt = cur.y + yy[i];

            if (!visited[`${xt}:${yt}`] && this.vboard.in(xt, yt)) {
                visited[`${xt}:${yt}`] = true;
                const nstone = this.vboard.data[xt][yt];
                if (nstone === false) {
                    return true;
                } else if (nstone.color == stone.color) {
                    queue.push(nstone);
                    chesses.push(nstone);
                }
            }
        }
    }
    return breath;
}

module.exports = GoRule;
