const Util      = require('./util');
const SGFStep   = require('./sgf-step');

const SGFBranch = function () {
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
    path = path.slice();
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
    let pathCopy = path.slice();
    return this._execute(path, (current, index) => {
        if (Util.typeIs(current[index], Array)) {
            current.splice(index, 1);

            if (current.length - 2 >= 0 
                && Util.typeIs(current[current.length - 2], SGFStep) 
                && Util.typeIs(current[current.length - 1], Array)) {
                /** 如果当前仅剩一条分支，则合并回主干 */
                const branch = current.splice(current.length - 1);
                branch[0].forEach(step => current.push(step));
            }
        } else {
            if (index == 0 && this.data.length > 1) {
                path = pathCopy.slice(0, pathCopy.length - 1);
                this.delete(path);
            } else {
                current.splice(index);
            }
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

module.exports = SGFBranch;
