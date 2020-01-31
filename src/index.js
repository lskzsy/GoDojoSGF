const SGFBoard      = require('./board/index');
const SGFRuntime    = require('./sgf-runtime');

window.SGF = function (option) {
    this.runtime = new SGFRuntime(option);
}

SGF.create = function (option) {
    return new SGF(option);
}

SGF.prototype.right = function () {
    while (this.runtime.player.continue());
}

SGF.prototype.save = function () {
    return this.runtime.toString();
}

SGF.prototype.left = function () {
    while (this.runtime.player.back());
}

SGF.prototype.continue = function () {
    this.runtime.player.continue()
}

SGF.prototype.back = function() {
    this.runtime.player.back();
}

SGF.prototype.showOn = function (id, option) {
    const parent = document.getElementById(id);

    option.width = this.runtime.properties.x;
    option.height = this.runtime.properties.y;
    const board = new SGFBoard(parent, option);
    board.setOnClickListener(this._click.bind(this));
    board.setOnRClickListener(this._rclick.bind(this));

    this.runtime.setFront(board);
}

SGF.prototype.resize = function (width, height) {
    this.runtime.hasFront() && this.runtime.front.resize(width, height);
}

SGF.prototype._rclick = function () {
    this.runtime.recall();
}

SGF.prototype._click = function (x, y) {
    const mode = this.runtime.input.mode;
    if (/^mark(TR|CR|SQ|MA|LB)$/.test(mode)) {
        this.runtime.putMark(x, y, mode.substr(4));
    } else {
        if (mode == 'w' || mode == 'b') {
            this.runtime.input.select = mode;
        }
        this.runtime.putStone({
            x: x,
            y: y,
            color: this.runtime.input.select
        });
    }  
}

SGF.prototype.putStone = function (x, y) {
    this._click(x, y);
}

SGF.prototype.delStone = function (status) {
    // this.branch.delete(status);
}

SGF.prototype.setInputMode = function (mode) {
    this.runtime.input.set(mode);
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

SGF.prototype.showStep = function () {
    this.runtime.hasFront() && this.runtime.front.showStep();
}

SGF.prototype.hideStep = function () {
    this.runtime.hasFront() && this.runtime.front.hideStep();
}

SGF.prototype.onStoneCreated = function (listener) {
    this.runtime.onStoneCreated(listener);
}

SGF.prototype.onStoneDeleted = function (listener) {
    this.runtime.onStoneDeleted(listener);
}

SGF.prototype.onBranchMove = function (listener) {
    this.runtime.onBranchMove(listener);
}

SGF.prototype.confirmPutStone = function () {
    this.runtime.hasFront() && this.runtime.front.confirm();
}

SGF.prototype.quitPutStone = function () {
    this.runtime.hasFront() && this.runtime.front.quit();
}

SGF.prototype.confirmMode = function (flag) {
    this.runtime.hasFront() && this.runtime.front.confirmMode(flag);
}
