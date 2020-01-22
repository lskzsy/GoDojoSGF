const SGFBoard = require('./board/index');
const SGFRuntime = require('./sgf-runtime');
const SGFConvertor = require('./sgf-convertor');
const SGFBranch = require('./sgf-branch');

window.SGF = function (option) {
    this.encoding = option.encoding || 'utf-8';
    this.boardSize = (option.boardSize || '19') + '';
    this.application = 'GoDojoSGF:1.0.0';
    this.fileFormat = option.fileFormat || 1;
    this.gameMode = option.gameMode || 1;
    this.isKo = option.isKo || false

    this.convertor = new SGFConvertor();
    this.runtime = new SGFRuntime(this.isKo);
    this.data = [];

    if (this.boardSize.indexOf(':') > -1) {
        const split = this.boardSize.split(':');
        this.width = parseInt(split[0]);
        this.height = parseInt(split[1]);
    } else {
        this.width = this.height = parseInt(this.boardSize);
    }

    if (option.data) {
        const info = this.convertor.do(option.data);
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

SGF.prototype.save = function () {
    return this.convertor.to(this);
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

SGF.prototype.resize = function (width, height) {
    this.runtime && this.runtime.hasFront() && this.runtime.front.resize(width, height);
}

SGF.prototype._rclick = function () {
    this.branch.recall();
}

SGF.prototype._click = function (x, y) {
    const mode = this.runtime.mode;
    if (/^mark(TR|CR|SQ|MA|LB)$/.test(mode)) {
        this.branch.insertMark(x, y, mode.substr(4));
    } else {
        if (mode == 'w' || mode == 'b') {
            this.runtime.select = mode;
        }
        this.runtime.putStone({
            x: x,
            y: y,
            color: this.runtime.select
        }, true);
    }  
}

SGF.prototype.putStone = function (x, y) {
    this._click(x, y);
}

SGF.prototype.delStone = function (status) {
    this.branch.delete(status);
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

SGF.prototype.onStoneCreated = function (listener) {
    this.runtime.onStoneCreated = listener;
}

SGF.prototype.onStoneDeleted = function (listener) {
    this.runtime.onStoneDeleted = listener;
}

SGF.prototype.onBranchMove = function (listener) {
    this.runtime.onBranchMove = listener;
}
