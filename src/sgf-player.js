const Util      = require('./util');
const SGFStep   = require('./sgf-step');

const SGFPlayer = function (properties, vboard, branch) {
    this.properties = properties;
    this.vboard     = vboard;
    this.branch     = branch;

    this.step       = 0;
    this.route      = [-1];

    this.branchMark = [];
    this.hasMark = false;
}

SGFPlayer.prototype.showBranchMark = function () {
    const branches = this.branch.getBranch(this.route);
    let branchCount = 0;
    branches.forEach(branch => {
        this.vboard.hasFront() 
        && this.vboard.front.putBranch(branch.stone.x, branch.stone.y, branchCount++);

        this.branchMark.push({
            x: branch.stone.x,
            y: branch.stone.y
        });
    });
}

SGFPlayer.prototype.clearBranchMark = function () {
    if (this.branchMark.length > 0) {
        this.vboard.hasFront()
        && this.branchMark.forEach(mark => this.vboard.front.delete(mark.x, mark.y));

        this.branchMark = [];
    }
}

SGFPlayer.prototype.showMark = function () {
    const current = this.branch.get(this.route);
    if (Util.typeIs(current, SGFStep) && current.marks && this.vboard.hasFront()) {
        this.hasMark = true;
        current.marks.forEach(mark => this.vboard.front.putMark(mark));
    }
}

SGFPlayer.prototype.clearMark = function () {
    if (this.hasMark) {
        this.vboard.hasFront() && this.vboard.front.clearMark();
        this.hasMark = false;
    }
}

SGFPlayer.prototype.next = function () {
    const cp = this.route.slice();
    cp[cp.length - 1]++;
    return cp;
}

SGFPlayer.prototype.getRoute = function () {
    return this.route.slice();
}

SGFPlayer.prototype.reset = function () {
    this.step       = 0;
    this.route      = [-1];

    this.branchMark = [];
    this.hasMark = false;
}

SGFPlayer.prototype.jump = function (path) {
    if (Util.typeIs(path, Array)) {
        this.reset();
        this.vboard.reset();
    
        for (let i = 0; i < path.length - 1; i++) {
            while (this.continue());
            this.checkout(path[i]);
        }
        return this.continue(path[path.length - 1] + 1);
    } else {
        return false;
    }
}

SGFPlayer.prototype.continue = function (step=1) {
    for (let i = 0; i < step; i++) {
        this.step++;
        this.route[this.route.length - 1]++;
        const current = this.branch.get(this.route);
        if (Util.typeIs(current, SGFStep)) {
            this.clearBranchMark();
            this.clearMark();
            this.vboard.put(current.stone);
            this.showMark();

            const next = this.branch.get(this.next());
            if (Util.typeIs(next, Array)) {
                this.showBranchMark();
                return false;
            }
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
        // console.log(this.step, this.route, current);
        if (Util.typeIs(current, SGFStep)) {
            this.clearBranchMark();
            this.clearMark();
            this.vboard.delete(current.stone);
            this.vboard.input.setColor(current.stone.color);
        }

        this.step--;
        this.route[this.route.length - 1]--;
        this.showMark();
        if (this.route[this.route.length - 1] < 0 && this.route.length > 1) {
            this.route.pop();
            this.route[this.route.length - 1] = this.branch.getLastStepIndex(this.route);
            this.showBranchMark();
        }

        Util.typeIs(current, SGFStep)
        && this.vboard.backLife(current.stone);
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

module.exports = SGFPlayer;
