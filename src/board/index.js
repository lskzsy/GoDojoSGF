const SGFBoardDimension         = require('./dimension');
const SGFBoardLayerType         = require('./layer-type');
const SGFBoardWorkspace         = require('./workspace');

const BoardLayerFunction        = require('./board-function');
const ChessLayerFunction        = require('./chess-function');
const PromptLayerFunction       = require('./prompt-function');
const MarkLayerFuntcion         = require('./mark-function');

const SGFBoardPromptHandle      = require('./prompt-handle');
const SGFBoardConfirmHandle     = require('./confirm-handle');


const SGFBoard = function (hook, option = {}) {
    this.width = option.width || 19;
    this.height = option.height || 19;
    this.lineColor = option.lineColor || 'black';
    this.background = option.background || 'white';
    this.branchColor = option.branchColor || 'blue';
    this.markColor = option.markColor || 'red';
    this.styleWidth = option.styleWidth || 0;
    this.styleHeight = option.styleHeight || 0;
    this.position = option.position || 'relative';

    this.dimension = new SGFBoardDimension(this.width, this.height, this.styleWidth, this.styleHeight);
    this.workspace = new SGFBoardWorkspace(this.dimension, this.position);
    this.workspace.register(SGFBoardLayerType.BOARD, BoardLayerFunction, { lineColor: this.lineColor, background: this.background });
    this.workspace.register(SGFBoardLayerType.CHESS, ChessLayerFunction, { branchColor: this.branchColor, background: this.background });
    this.workspace.register(SGFBoardLayerType.PROMPT, PromptLayerFunction);
    this.workspace.register(SGFBoardLayerType.MARK, MarkLayerFuntcion, { markColor: this.markColor });
    this.workspace.belongTo(hook);

    this.runtime = {
        select: 'b',
        onClickListener: null,
        onRClickListener: null,
        isPrompt: true,
        isConfirm: false
    }

    this._bind();
}

SGFBoard.prototype._bind = function () {
    this.confirmHandle = new SGFBoardConfirmHandle(this);
    this.workspace.onClick(this._onclick.bind(this));
    this.workspace.onRClick(this._onrclick.bind(this));
    SGFBoardPromptHandle.hook(this);
}

SGFBoard.prototype._onrclick = function (event) {
    event.preventDefault(); 
    const pos = this._clickLoc(event);
    if (this.runtime.onRClickListener) {
        this.runtime.onRClickListener(pos.x, pos.y);
    }
}

SGFBoard.prototype._onclick = function (event) {
    const pos       = this._clickLoc(event);
    const listener  = this.runtime.onClickListener;
    if (listener) {
        listener(pos.x, pos.y);
    }
}

SGFBoard.prototype._clickLoc = function (event) {
    const x = event.offsetX;
    const y = event.offsetY;
    const s = this.dimension.padding / 2;
    let xPos = 0;
    let yPos = 0;

    if (x < 0 && x > -1 * s) {
        xPos = 0;
    } else if (x > this.dimension.boardWidth + this.dimension.baseStart 
            && x < this.dimension.boardWidth + this.dimension.baseStart  + s) {
        xPos = this.dimension.x - 1;
    } else {
        xPos = parseInt((x - this.dimension.baseStart) / (this.dimension.padding + 1));
    }
    if (y < 0 && y > -1 * s) {
        yPos = 0;
    } else if (y > this.dimension.boardHeight + this.dimension.baseStart 
            && y < this.dimension.boardHeight + this.dimension.baseStart  + s) {
        yPos = this.dimension.y - 1;
    } else {
        yPos = parseInt((y - this.dimension.baseStart) / (this.dimension.padding + 1));
    }

    return {x: xPos, y: yPos};
}

SGFBoard.prototype.putWhite = function (x, y, step) {
    this.workspace.handle(SGFBoardLayerType.CHESS, 'putWhite', {x: x, y : y, step: step});
}

SGFBoard.prototype.putBlack = function (x, y, step) {
    this.workspace.handle(SGFBoardLayerType.CHESS, 'putBlack', {x: x, y : y, step: step});
}

SGFBoard.prototype.putBranch = function (x, y, branch) {
    const type = 'A'.charCodeAt() + branch;
    this.workspace.handle(SGFBoardLayerType.CHESS, 'putBranch', {x: x, y: y, type: String.fromCharCode(type)})
}

SGFBoard.prototype.putMark = function (mark) {
    let type = mark.type;
    if (mark.type == 'LB') {
        type += mark.d;
    }
    this.workspace.handle(SGFBoardLayerType.MARK, 'put', {
        x: mark.x,
        y: mark.y,
        type: type
    });
}

SGFBoard.prototype.clearMark = function (x=-1, y=-1) {
    this.workspace.handle(SGFBoardLayerType.MARK, 'delete', {
        x: x,
        y: y
    });
}

SGFBoard.prototype.delete = function (x, y, step) {
    this.workspace.handle(SGFBoardLayerType.CHESS, 'delete', {x: x, y : y, step: step});
}

SGFBoard.prototype.setOnClickListener = function (listener) {
    this.runtime.onClickListener = listener;
}

SGFBoard.prototype.removeOnClickListener = function () {
    if (this.runtime.onClickListener) {
        this.runtime.onClickListener = null;
    }   
}

SGFBoard.prototype.setOnRClickListener = function (listener) {
    this.runtime.onRClickListener = listener;
}

SGFBoard.prototype.removeOnRClickListener = function () {
    if (this.runtime.onRClickListener) {
        this.runtime.onRClickListener = null;
    }   
}

SGFBoard.prototype.hideCoordinate = function () {
    this.workspace.coordinate(false);
}

SGFBoard.prototype.showCoordinate = function () {
    this.workspace.coordinate(true);
}

SGFBoard.prototype.hidePrompt = function () {
    this.workspace.handle(SGFBoardLayerType.PROMPT, 'show', false);
    this.runtime.isPrompt = false;
}

SGFBoard.prototype.showPrompt = function () {
    this.workspace.handle(SGFBoardLayerType.PROMPT, 'show', true);
    this.runtime.isPrompt = true;
    this.runtime.isConfirm = false;
}

SGFBoard.prototype.confirmMode = function (flag) {
    if (this.runtime.isConfirm != flag) {
        this.runtime.isConfirm = flag;
        if (flag) {
            this.runtime.isPrompt = false;
            this.workspace.handle(SGFBoardLayerType.PROMPT, 'show', true);
            this.confirmHandle.mount();
        } else {
            this.confirmHandle.dismount();
        }
    }
}

SGFBoard.prototype.showStep = function () {
    this.workspace.handle(SGFBoardLayerType.CHESS, 'showStepView', true);
}

SGFBoard.prototype.hideStep = function () {
    this.workspace.handle(SGFBoardLayerType.CHESS, 'showStepView', false);
}

SGFBoard.prototype.resize = function (width, height) {
    this.workspace.resize(width, height);
}

SGFBoard.prototype.select = function (type) {
    this.runtime.select = type;
}

SGFBoard.prototype.confirm = function () {
    this.confirmHandle.confirm();
}

SGFBoard.prototype.quit = function () {
    this.confirmHandle.quit();
}

module.exports = SGFBoard;
