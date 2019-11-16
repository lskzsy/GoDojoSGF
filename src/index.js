const SGFBoard = require('./sgf-board');
const SGFRuntime = require('./sgf-runtime');
const SGFConvertor = require('./sgf-convertor');
const SGFBranch = require('./sgf-branch');
const GoRule = require('./go-rule');

window.SGF = function (option) {
    this.encoding = option.encoding || 'utf-8';
    this.boardSize = (option.boardSize || '19') + '';
    this.application = 'GoDojoSGF:1.0.0';
    this.fileFormat = option.fileFormat || 1;
    this.gameMode = option.gameMode || 1;

    this.runtime = new SGFRuntime();
    this.data = [];

    if (this.boardSize.indexOf(':') > -1) {
        const split = this.boardSize.split(':');
        this.width = split[0];
        this.height = split[1];
    } else {
        this.width = this.height = parseInt(this.boardSize);
    }

    if (option.data) {
        const convertor = new SGFConvertor();
        const info = convertor.do(option.data);
        if (info) {
            //  root info
            const root = info.root;
            root.application && (this.application = root.application);
            root.boardSize && (this.boardSize = root.boardSize);
            root.width && (this.width = root.width);
            root.height && (this.height = root.height);
            root.encoding && (this.encoding = root.encoding);
            root.fileFormat && (this.fileFormat = root.fileFormat);
            root.gameMode && (this.gameMode = root.gameMode);
            //  data info
            this.data = info.data;
        }
    }
     //  runtime
     this.runtime.init(this.width, this.height, this.data);
     this.branch = new SGFBranch(this.runtime);
}

SGF.create = function (option) {
    return new SGF(option);
}

SGF.prototype.right = function () {
    if (this.runtime.hasFront()) {
        while (!this.branch.continue());
    }
}

SGF.prototype.left = function () {
    if (this.runtime.hasFront()) {
        while (!this.branch.back());
    }
}

SGF.prototype.continue = function () {
    this.branch.continue();
}

SGF.prototype.back = function() {
    this.branch.back();
}

SGF.prototype.showOn = function (id, option) {
    const parent = document.getElementById(id);

    option.width = this.width;
    option.height = this.height;
    const board = new SGFBoard(parent, option);
    board.setOnClickListener(this._click.bind(this));
    board.setOnRClickListener(this._rclick.bind(this));

    this.runtime && this.runtime.setFront(board);
}

SGF.prototype._rclick = function () {
    if (step > -1) {
        const stone = this.runtime.branch[this.runtime.step];
        this.branch.delete(stone);
    }  
}

SGF.prototype._click = function (x, y) {
    const mode = this.runtime.mode;
    if (/^mark(TR|CR|SQ|MA|LB)$/.test(mode)) {
        this.branch.insertMark(x, y, mode.substr(4));
    } else {
        if (mode == 'w' || mode == 'b') {
            this.runtime.select = mode;
        }
        this.runtime.putChess({
            x: x,
            y: y,
            color: this.runtime.select
        }, true);
    }  
}

SGF.prototype.setInputMode = function (mode) {
    this.runtime.mode = mode;
    if (mode == 'w' || mode == 'b') {
        this.runtime.select = mode;
        this.runtime.hasFront() &&
        this.runtime.front.select(mode);
    } else if (/^mark(TR|CR|SQ|MA|LB)$/.test(mode)) {
        this.runtime.hasFront() &&
        this.runtime.front.select(mode.substr(4));
    } else if (mode == 'repeat') {
        this.runtime.front.select(this.runtime.select);
    }
}

SGF.prototype.hideCoordinate = function () {
    this.runtime.hasFront() && this.runtime.front.hideCoordinate();
}

SGF.prototype.showCoordinate = function () {
    this.runtime.hasFront() && this.runtime.front.showCoordinate();
}

SGF.prototype.hidePrompt = function () {
    this.runtime.hasFront() && this.runtime.front.hidePrompt();
}

SGF.prototype.showPrompt = function () {
    this.runtime.hasFront() && this.runtime.front.showPrompt();
}
