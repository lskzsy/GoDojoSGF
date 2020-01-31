const SGFBoardLayerType = require('./layer-type');

const SGFBoardConfirmHandle = function (board) {
    this.board          = board;
    this.runtime        = board.runtime;
    this.workspace      = board.workspace;
    this.realListener   = board._onclick.bind(board);
    this.callback       = null;

    this.waitConfirmEvent = null;
}

SGFBoardConfirmHandle.prototype.bindCallback = function (callback) {
    this.callback = callback;
}

SGFBoardConfirmHandle.prototype.mount = function () {
    this.workspace.onClick(this.handle.bind(this));
}

SGFBoardConfirmHandle.prototype.handle = function (event) {
    const pos = this.board._clickLoc(event);
    this.waitConfirmEvent = pos;
    this.workspace.handle(SGFBoardLayerType.PROMPT, 'confirmView', {
        x: pos.x,
        y: pos.y,
        select: this.runtime.select
    });
    if (this.callback) {
        this.callback();
    }
}

SGFBoardConfirmHandle.prototype.confirm = function () {
    if (this.runtime.isConfirm && this.waitConfirmEvent) {
        const listener = this.runtime.onClickListener;
        if (listener) {
            listener(this.waitConfirmEvent.x, this.waitConfirmEvent.y);
        }
        this.waitConfirmEvent = null;
        this.workspace.handle(SGFBoardLayerType.PROMPT, 'clearConfirmView');
    }
}

SGFBoardConfirmHandle.prototype.quit = function () {
    if (this.runtime.isConfirm && this.waitConfirmEvent) {
        this.waitConfirmEvent = null;
        this.workspace.handle(SGFBoardLayerType.PROMPT, 'clearConfirmView');
    }
}

SGFBoardConfirmHandle.prototype.dismount = function () {
    this.workspace.onClick(this.realListener);
}

module.exports = SGFBoardConfirmHandle;
