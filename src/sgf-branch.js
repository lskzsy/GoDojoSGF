const SGFBranch = function (runtime) {
    this.runtime = runtime;
    this.branchMark = [];
    this.branch = runtime.root;
    this.history = [];
    this.step = -1;
}

SGFBranch.prototype.insert = function (x, y, c) {
    const chess = {
        color: c,
        x: x,
        y: y
    };
    this.runtime.data.push(chess);
    const step = ++this.step;
    if (step < this.branch.length) {
        const cur = this.branch[step];
        if (!(cur instanceof Array)) {
            if (cur.x != chess.x || cur.y != chess.y || cur.color != chess.color) {
                const old = this.branch.splice(step);
                this.branch.push(old);
                this.branch.push([chess]);
                this._nextBranch(step, this.branch.length - 1);
            }
        } else {
            const branch = this.branch;
            let selected = false;
            for (let i = step; i < branch.length; i++) {
                const cur = branch[i][0];
                if (cur.x == chess.x && cur.y == chess.y && cur.color == chess.color) {
                    // select branch
                    selected = true;
                    this._nextBranch(step, i);
                }
            }
            if (!selected) {
                // new branch
                this.branch.push([chess]);
                this._nextBranch(step, this.branch.length - 1);
            }
            this._clearBranchMark();
        }
        this._checkBranch(this.step); 
    } else {
        this.branch.push(chess);
    }
}

SGFBranch.prototype.continue = function () {
    const step = ++this.step;
    if (step < this.branch.length) {
        const cur = this.branch[step];
        if (!(cur instanceof Array)) {
            this.runtime.putChess(cur);

            this._checkBranch(step);
        } else {
            this.step--;
        }
    } else {
        this.step--;
    }
}

SGFBranch.prototype.back = function() {
    const step = this.step;
    if (step > -1) {
        const chess = this.branch[step];
        // console.log(this.branch, chess);
        this.runtime.hasFront() && 
            this.runtime.front.select(this.runtime.board[chess.x][chess.y]);

        this.runtime.board[chess.x][chess.y] = '';
        this.runtime.hasFront() && this.runtime.front.delete(chess.x, chess.y);

        this.runtime.backLife();
        this.step--;
        this.runtime.currentStep--;
        this.runtime.data.pop();

        this._clearBranchMark();
    }
    if (this.step == -1) {
        const history = this.history.pop();
        if (history) {
            this.branch = history.branch;
            this.step = history.step;
            this._checkBranch(this.step);   
        }
    }
}

SGFBranch.prototype._nextBranch = function(step, i) {
    this.history.push({
        branch: this.branch,
        step: step - 1
    });
    this.branch = this.branch[i];
    this.step = 0;
}


SGFBranch.prototype._checkBranch = function (step) {
    // console.log(this.runtime.hasFront());
    if (this.runtime.hasFront()) {
        const branch = this.branch;
        if (step + 1 < branch.length && (branch[step + 1] instanceof Array)) {
            for (let i = step + 1, j = 0; i < branch.length; i++, j++) {
                this.runtime.front.putBranch(branch[i][0].x, branch[i][0].y, j);
                this.branchMark.push({
                    x: branch[i][0].x,
                    y: branch[i][0].y
                });
            }
        }
    }
}

SGFBranch.prototype._clearBranchMark = function () {
    if (this.runtime.hasFront()) {
        this.branchMark.forEach(mark => this.runtime.front.delete(mark.x, mark.y));
    }
    this.branchMark = [];
}

module.exports = SGFBranch;
