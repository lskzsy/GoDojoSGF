const SGFBoardLayerType = require('./layer-type');

const SGFBoardPromptHandle = function (board) {
    this.promptX = -1;
    this.promptY = -1;
    this.workspace  = board.workspace;
    this.runtime    = board.runtime;
    this.board      = board;

    this.workspace.workspace.onmousemove = this.onMouseMove.bind(this);
    this.workspace.workspace.onmouseleave = this.onMouseLeave.bind(this);
}

SGFBoardPromptHandle.prototype.onMouseMove = function (event) {
    if (this.runtime.isPrompt) {
        const pos = this.board._clickLoc(event);
        if (pos.x != this.promptX || pos.y != this.promptY) {
            if (this.promptX != -1 && this.promptY != -1) {
                this.workspace.handle(SGFBoardLayerType.PROMPT, 'delete', {
                    x: this.promptX, y: this.promptY
                });
            }
            this.promptX = pos.x;
            this.promptY = pos.y;
            if (this.promptX != -1 && this.promptY != -1) {
                this.workspace.handle(SGFBoardLayerType.PROMPT, 'put', {
                    x: this.promptX, y: this.promptY, 
                    select: this.runtime.select
                });
            }
        }
    }
}

SGFBoardPromptHandle.prototype.onMouseLeave = function (event) {
    if (this.runtime.isPrompt && this.promptX != -1 && this.promptY != -1) {
        this.workspace.handle(SGFBoardLayerType.PROMPT, 'delete', {
            x: this.promptX, y: this.promptY
        });
    }
}

SGFBoardPromptHandle.hook = function (workspace) {
    new SGFBoardPromptHandle(workspace);
}

module.exports = SGFBoardPromptHandle;
