const SGFVirtualStone   = require('./sgf-virtual-stone');
const Util              = require('./util');

const SGFVirtualBoard = function () {
    this.data   = [];
    this.x      = 19;
    this.y      = 19;
    this.front  = null;
    this.rule   = null;
    this.input  = null;
}

SGFVirtualBoard.prototype.setFront = function (front) {
    this.front = front;
}

SGFVirtualBoard.prototype.hasFront = function () {
    return this.front != null;
}

SGFVirtualBoard.prototype.setRule = function (rule) {
    this.rule = rule;
}

SGFVirtualBoard.prototype.hasRule = function () {
    return this.rule != null;
}

SGFVirtualBoard.prototype.setInput = function (input) {
    this.input = input;
}

SGFVirtualBoard.prototype.hasInput = function () {
    return this.input != null;
}

SGFVirtualBoard.prototype.build = function (properties) {
    for (let i = 0; i < properties.x; i++) {
        const line = [];
        for (let j = 0; j < properties.y; j++) {
            line.push(false);
        }
        this.data.push(line);
    }
    this.x = properties.x;
    this.y = properties.y;
}

SGFVirtualBoard.prototype.pass = function (x, y) {
    return this.in(x, y) && !Util.typeIs(this.data[x][y], SGFVirtualStone); 
}

SGFVirtualBoard.prototype.refuse = function (x, y, color) {
    if (this.in(x, y)) {
        return Util.typeIs(this.data[x][y], SGFVirtualStone) && this.data[x][y].color != color;
    } else {
        return false;
    }
}

SGFVirtualBoard.prototype.put = function (stone) {
    if (Util.typeIs(stone, SGFVirtualStone) && this.pass(stone.x, stone.y)) {
        if (!this.hasRule() || !this.rule.isAsphyxiating(stone)) {
            this.data[stone.x][stone.y] = stone;
            if (this.hasFront()) {
                if (stone.color == 'w') {
                    this.front.putWhite(stone.x, stone.y, stone.step);
                } else {
                    this.front.putBlack(stone.x, stone.y, stone.step);
                }
            }        
            
            const deaths = this.rule.getDeathStones();
            deaths.forEach(dstone => this.delete(dstone.x, dstone.y));

            this.hasInput() && this.input.repeat(stone.color);
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

SGFVirtualBoard.prototype.delete = function (x, y) {
    if (this.in(x, y)) {
        this.data[x][y] = false;
        this.hasFront() && this.front.delete(x, y);
        return true;
    } else {
        return false;
    }
}

SGFVirtualBoard.prototype.in = function (x, y) {
    return x >= 0 && x < this.x && y >= 0 && y < this.y;
}

module.exports = SGFVirtualBoard;
