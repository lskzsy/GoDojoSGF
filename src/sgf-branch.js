const Util      = require('./util');
const SGFStep   = require('./sgf-step');

const SGFBranch = function (runtime) {
    // this.runtime = runtime;
    // this.branchMark = [];
    // this.branch = runtime.root;
    // this.history = [];
    // this.step = -1;
    // this.runtime.branch = this;

    this.data = [];
}

SGFBranch.prototype.init = function (data) {
    this.data = data;
}

SGFBranch.prototype.reset = function () {
    this.data = [];
}

SGFBranch.prototype.get = function (path) {
    if (Util.typeIs(path, Array) && path.length > 0) {
        let current = this.data;
        for (let i = 0; i < path.length - 1; i++) {
            if (current.length > path[i] && Util.typeIs(current[path[i]], Array)) {
                current = current[path[i]];
            } else {
                return false;
            }
        }
        return current.length > path[path.length - 1] ? current[path[path.length - 1]] : false;
    } else {
        return false;
    }
}

SGFBranch.prototype._execute = function (path, runner) {
    if (Util.typeIs(path, Array) && path.length > 0) {
        const route = path.splice(0, path.length - 1);
        let current = this.data;
        if (route.length > 0) {
            current = this.get(route);
        }
        if (Util.typeIs(current, Array) && (path[0] == 0 || current.length > path[0])) {
            return runner(current, path[0]);
        } else {
            return false;
        }
    } else {
        return false;
    }
}

SGFBranch.prototype.getLastStepIndex = function (path) {
    return this._execute(path, (current, _) => {
        for (let i = current.length - 1; i >= 0; i--) {
            if (Util.typeIs(current[i], SGFStep)) {
                return i;
            }
        } 
    });
}

SGFBranch.prototype.getBranch = function (path) {
    return this._execute(path, (current, _) => {
        const answer = [];
        current.forEach(step => 
            Util.typeIs(step, Array) && answer.push(step[0]));
        return answer;
    });
}

SGFBranch.prototype.insert = function (path, data) {
    if (Util.typeIs(data, SGFStep)) {
        return this._execute(path, (current, index) => {
            // console.log(current, index);
            if (Util.typeIs(current[index], Array)) {
                current[index].push(data);
            } else {
                current.splice(index + 1, 0, data);
            }
            // console.log(current, index);
            return true;
        });
    } else {
        return false;
    }
}

SGFBranch.prototype.delete = function (path) {
    return this._execute(path, (current, index) => {
        if (Util.typeIs(current[index], Array)) {
            current.splice(index, 1);
        } else {
            current.splice(index);
        }
    });
}

SGFBranch.prototype.divide = function (path, data) {
    if (Util.typeIs(data, SGFStep)) {
        return this._execute(path, (current, index) => {
            if (!Util.typeIs(current[index], Array)) {
                current.push(current.splice(index));
            }
            current.push([data]);
            return current.length - 1;
        });
    } else {
        return false;
    }
}

SGFBranch.prototype.find = function (path, data, beginIndex=0) {
    if (Util.typeIs(data, SGFStep)) {
        return this._execute(path, (current, _) => {
            for (let i = beginIndex; i < current.length; i++) {
                const step = current[i];
                if (Util.typeIs(step, SGFStep) && step.equal(data)) {
                    return i;
                } else if (Util.typeIs(step, Array) && step.length > 0 && step[0].equal(data)) {
                    return i;
                }
            }
            return false;
        });
    } else {
        return false;
    }
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

SGFBranch.prototype.insert2 = function (x, y, c) {
    const stone = {
        color: c,
        x: x,
        y: y,
        marks: null
    };
    this.runtime.data.push(stone);
    const step = ++this.step;
    let created = true;
    if (step < this.branch.length) {
        const cur = this.branch[step];
        if (!(cur instanceof Array)) {
            if (cur.x != stone.x || cur.y != stone.y || cur.color != stone.color) {
                const old = this.branch.splice(step);
                this.branch.push(old);
                this.branch.push([stone]);
                this._nextBranch(step, this.branch.length - 1);
            } else {
                created = false;
            }
        } else {
            const branch = this.branch;
            let selected = false;
            for (let i = step; i < branch.length; i++) {
                const cur = branch[i][0];
                if (cur.x == stone.x && cur.y == stone.y && cur.color == stone.color) {
                    // select branch
                    selected = true;
                    this._nextBranch(step, i);
                }
            }
            if (!selected) {
                // new branch
                this.branch.push([stone]);
                this._nextBranch(step, this.branch.length - 1);
            } else {
                created = false;
            }
            this._clearBranchMark();
        }
        this._checkBranch(this.step); 
    } else {
        this.branch.push(stone);
    }
    if (created) {
        const steps = [];
        this.history.forEach(h => {steps.push(`${h.step}_${h.select}`)});
        steps.push(this.step < 0 ? 0 : this.step);
        this.runtime.onStoneCreated && this.runtime.onStoneCreated(steps, stone);
    }
}

SGFBranch.prototype.continue = function () {
    const step = ++this.step;
    if (step < this.branch.length) {
        const cur = this.branch[step];
        if (!(cur instanceof Array)) {
            this.runtime.putStone(cur);

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

SGFBranch.prototype.back = function() {
    const step = this.step;
    let flag = false;
    if (step > -1) {
        const stone = this.branch[step];
        this.runtime.select = this.runtime.board[stone.x][stone.y];
        this.runtime.hasFront() && 
        this.runtime.front.select(this.runtime.board[stone.x][stone.y]);

        this.runtime.board[stone.x][stone.y] = '';
        this.runtime.hasFront() && this.runtime.front.delete(stone.x, stone.y);

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
        step: step - 1,
        select: i
    });
    this.branch = this.branch[i];
    this.step = 0;
}

SGFBranch.prototype.delete = function (status) {
    if (status.length > 0) {
        let branch = this.runtime.root;

        for (let i = 0; i < status.length; i++) {
            if (branch[status[i]] instanceof Array) {
                branch = branch[status[i]];
            } else {
                
                break;
            }
        } 
    }
}

SGFBranch.prototype.recall = function () {
    if (this.step >= 0 && this.step == this.branch.length - 1) {
        const currentMarks = this.branch[this.step].marks;
        if (currentMarks && currentMarks.length > 0) {
            const del = currentMarks.splice(currentMarks.length - 1); 
            this.runtime.hasFront() && this.runtime.front.clearMark(del[0].x, del[0].y);               
        } else {
            let split = this.step;
            if (this.step == 0 && this.history.length > 0) {
                const history = this.history[this.history.length - 1];
                split = history.select;
            }
            const steps = [];
            this.history.forEach(h => {steps.push(`${h.step}_${h.select}`)});
            steps.push(this.step);
            this.back();
            this._clearBranchMark();
            this.branch.splice(split, 1);
            const last = this.branch.length - 1;
            if ((this.branch[last] instanceof Array) && (last == 0 || 
                !(this.branch[last - 1] instanceof Array))) {
                const only = this.branch.splice(last);
                only[0].forEach(stone => this.branch.push(stone));
            }
            this.runtime.onStoneDeleted && this.runtime.onStoneDeleted(steps);
        }
    }
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
