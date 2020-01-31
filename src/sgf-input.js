const SGFInput = function () {
    this.mode = 'repeat';
    this.select = 'b';
    this.front = null;
}

SGFInput.prototype.set = function (mode) {
    this.mode = mode;
    if (mode == 'w' || mode == 'b') {
        this.select = mode;
        this.hasFront() &&
        this.front.select(mode);
    } else if (/^mark(TR|CR|SQ|MA|LB)$/.test(mode)) {
        this.hasFront() &&
        this.front.select(mode.substr(4));
    } else if (mode == 'repeat') {
        this.front.select(this.select);
    }
}

SGFInput.prototype.setColor = function (color) {
    this.select = color;
    this.front.select(this.select);
}

SGFInput.prototype.repeat = function (color) {
    /** repeat模式，触发交替落子 */
    if (this.mode == 'repeat') {
        if (color == 'w') {
            this.select = 'b';
            this.hasFront() && this.front.select('b');
        } else {
            this.select = 'w';
            this.hasFront() && this.front.select('w');
        }
    }
}

SGFInput.prototype.setFront = function (front) {
    this.front = front;
}

SGFInput.prototype.hasFront = function () {
    return this.front != null;
}

module.exports = SGFInput;
