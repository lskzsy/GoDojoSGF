const SGFVirtualStone = require('./sgf-virtual-stone');
const Util            = require('./util');

const SGFStep = function (x, y, color, step, marks=null) {
    this.stone = new SGFVirtualStone(x, y, color, step);
    this.marks = marks;
}

SGFStep.prototype.addMark = function (mark) {
    if (this.marks == null) {
        this.marks = [];
    }

    this.marks.push(mark);
}

SGFStep.prototype.equal = function (other) {
    if (Util.typeIs(other, SGFStep)) {
        return other.stone.x == this.stone.x 
        && other.stone.y == this.stone.y
        && other.stone.color == this.stone.color
        && other.stone.step == this.stone.step;
    } else {
        return false;
    }
}

module.exports = SGFStep;
