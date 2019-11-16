const SGFBranch = function (runtime) {
    this.runtime = runtime;
    this.branchMark = [];
    this.branch = runtime.root;
    this.history = [];
    this.step = -1;
    this.runtime.branch = this;
}

SGFBranch.prototype.insertMark = function (x, y, type) {
    const mark = {
        x: x,
        y: y,
        type: type
    };
    if (type == 'LB') {
        let count = 0;
        if (this.branch[this.step].marks != undefined
            && this.branch[this.step].marks != null) {
            this.branch[this.step].marks.forEach(mark => {
                mark.type == 'LB' && count++;
            });
        }
        mark.d = String.fromCharCode('A'.charCodeAt() + count);
    }
    this.runtime.hasFront() &&
    this.runtime.front.putMark(mark);
    
    if (this.branch[this.step].marks == null) {
        this.branch[this.step].marks = [];
    }
    this.branch[this.step].marks.push(mark);
}

SGFBranch.prototype.insert = function (x, y, c) {
    const chess = {
        color: c,
        x: x,
        y: y,
        marks: null
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

            return this._checkBranch(step);
        } else {
            this.step--;
            return true;
        }
    } else {
        this.step--;
        return true;
    }
}

SGFBranch.prototype.delete = function (stone) {
    
}

SGFBranch.prototype.back = function() {
    const step = this.step;
    let flag = false;
    if (step > -1) {
        const chess = this.branch[step];
        this.runtime.select = this.runtime.board[chess.x][chess.y];
        this.runtime.hasFront() && 
        this.runtime.front.select(this.runtime.board[chess.x][chess.y]);

        this.runtime.board[chess.x][chess.y] = '';
        this.runtime.hasFront() && this.runtime.front.delete(chess.x, chess.y);

        this.runtime.backLife();
        this.runtime.currentStep--;
        this.step--;
        this.runtime.data.pop();

        this._clearBranchMark();
    }
    if (this.step == -1) {
        flag = true;
        const history = this.history.pop();
        if (history) {
            this.branch = history.branch;
            this.step = history.step;
            flag = this._checkBranch(this.step);   
        }
    }
    this.checkMark();
    return flag;
}

SGFBranch.prototype.checkMark = function () {
    if (this.runtime.hasFront()) {
        this.runtime.front.clearMark();
        if (this.step >= 0 && this.branch[this.step]) {
            const stone = this.branch[this.step];
            if (stone.marks) {
                stone.marks.forEach(mark => this.runtime.front.putMark(mark));
            }
        }   
    }
}

SGFBranch.prototype._nextBranch = function (step, i) {
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
            return true;
        }
    }

    return false;
}

SGFBranch.prototype._clearBranchMark = function () {
    if (this.runtime.hasFront()) {
        this.branchMark.forEach(mark => this.runtime.front.delete(mark.x, mark.y));
    }
    this.branchMark = [];
}

module.exports = SGFBranch;
