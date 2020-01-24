DEFAULT = {
    MARGIN_BY_PADDING: 0.8
}

const SGFBoardDimension = function (x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width  = width;
    this.height = height;

    this.margin  = 0;
    this.padding = 0;
    this.marginByPadding = DEFAULT.MARGIN_BY_PADDING;

    this.boardWidth  = 0;
    this.boardHeight = 0;
    this.baseStart   = 0;
    this.baseWidth   = 0;
    this.baseHeight  = 0;

    this.showCoord = false;

    this.baseLine();
}

SGFBoardDimension.prototype.baseLine = function () {
    let total = this.width;
    let unit = this.x;
    if (this.width > this.height) {
        total = this.height;
        unit = this.y;
    }
    
    this.padding = (total - unit) / (unit - 1 + 2 * this.marginByPadding + (this.showCoord ? 2 : 0));
    this.margin = this.marginByPadding * this.padding;

    this.boardWidth = this.width - 2 * this.margin - (this.showCoord ? 2 * this.padding : 0) - 1;
    this.boardHeight = this.height - 2 * this.margin - (this.showCoord ? 2 * this.padding : 0) - 1;

    this.baseStart = this.showCoord ? this.padding : 0;
    this.baseWidth = this.width - (this.showCoord ? 2 * this.padding : 0);
    this.baseHeight = this.height - (this.showCoord ? 2 * this.padding : 0);
}

SGFBoardDimension.prototype.resize = function (width, height, marginByPadding=0) {
    this.width  = width;
    this.height = height;
    if (marginByPadding > 0) {
        this.marginByPadding = marginByPadding;
    }

    this.baseLine();
}

SGFBoardDimension.prototype.showCoordinate = function (flag) {
    if (flag != this.showCoord) {
        this.showCoord = flag;
        this.baseLine();
    }
}

module.exports = SGFBoardDimension;
