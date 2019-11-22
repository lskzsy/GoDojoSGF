const SGFBoard = function (hook, option = {}) {
    this.width = option.width || 19;
    this.height = option.height || 19;
    this.lineColor = option.lineColor || 'black';
    this.background = option.background || 'white';
    this.margin = option.margin || 50;
    this.padding = option.padding || 30;
    this.branchColor = option.branchColor || 'blue';
    this.markColor = option.markColor || 'red';
    this.styleWidth = option.styleWidth || 0;
    this.styleHeight = option.styleHeight || 0;

    this.workspace = document.createElement('div');
    this.board = document.createElement('canvas');
    this.coordinate = document.createElement('canvas');
    this.chessLayer = document.createElement('canvas');
    this.promptLayer = document.createElement('canvas');
    this.markLayer = document.createElement('canvas');
    this.workspace.appendChild(this.board);
    this.workspace.appendChild(this.coordinate);
    this.workspace.appendChild(this.chessLayer);
    this.workspace.appendChild(this.markLayer);
    this.workspace.appendChild(this.promptLayer);

    this.runtime = {
        select: 'b',
        onClickListener: null,
        onRClickListener: null,
        isPrompt: true
    }

    this._build();
    this._bind();

    if (hook.appendChild) {
        hook.appendChild(this.workspace);
    }
}

SGFBoard.prototype.resize = function (width, height) {
    this.styleWidth = width;
    this.styleHeight = height;
    if (this.styleWidth > 0) { 
        this.scaleX = this.visableWidth / this.styleWidth;
    }
    if (this.styleHeight > 0) {
        this.scaleY = this.visableHeight / this.styleHeight;
    }
    if (this.styleWidth > 0) {
        this.coordinate.style.width = 
        this.board.style.width =
        this.chessLayer.style.width =
        this.promptLayer.style.width =
        this.markLayer.style.width =
        this.workspace.style.width = this.styleWidth + 'px';
    }
    if (this.styleHeight > 0) {
        this.coordinate.style.height =
        this.board.style.height =
        this.chessLayer.style.height =
        this.promptLayer.style.height =
        this.markLayer.style.height =
        this.workspace.style.height = this.styleHeight + 'px';
    }
}

SGFBoard.prototype._bind = function () {
    this.workspace.onclick = this._onclick.bind(this);
    this.workspace.oncontextmenu = function(event) { 
        event.preventDefault(); 
        const pos = this._clickLoc(event);
        this.runtime.onRClickListeners.forEach(listener => listener(pos.x, pos.y)); 
    }.bind(this);

    this.promptX = -1;
    this.promptY = -1;
    this.workspace.onmousemove = function(event) {
        if (this.runtime.isPrompt) {
            const pos = this._clickLoc(event);
            if (pos.x != this.promptX || pos.y != this.promptY) {
                if (this.promptX != -1 && this.promptY != -1) {
                    this.delete(this.promptX, this.promptY, true);
                }
                this.promptX = pos.x;
                this.promptY = pos.y;
                if (this.promptX != -1 && this.promptY != -1) {
                    this._drawObject(this.promptX, this.promptY, this.runtime.select, true);
                }
            }
        }
    }.bind(this);
    this.workspace.onmouseleave = function(event) {
        if (this.runtime.isPrompt && this.promptX != -1 && this.promptY != -1) {
            this.delete(this.promptX, this.promptY, true);
        }
    }.bind(this);
}

SGFBoard.prototype._onclick = function (event) {
    const pos = this._clickLoc(event);
    
    const listener = this.runtime.onClickListener;
    if (listener) {
        listener(pos.x, pos.y);
    }
}

SGFBoard.prototype._clickLoc = function (event) {
    const x = event.offsetX * this.scaleX - this.margin
    const y = event.offsetY * this.scaleY - this.margin;
    const s = this.padding / 2;
    let xPos = 0;
    let yPos = 0;

    if (x < 0 && x > -1 * s) {
        xPos = 0;
    } else if (x > this.boardWidth && x < this.boardWidth + s) {
        xPos = this.width - 1;
    } else {
        xPos = parseInt(x / (this.padding + 1)) + ((x % (this.padding + 1)) > s ? 1 : 0);
    }
    if (y < 0 && y > -1 * s) {
        yPos = 0;
    } else if (y > this.boardHeight && y < this.boardHeight + s) {
        yPos = this.height - 1;
    } else {
        yPos = parseInt(y / (this.padding + 1)) + ((y % (this.padding + 1)) > s ? 1 : 0);
    }

    return {x: xPos, y: yPos};
}

SGFBoard.prototype._buildLayerStyle = function (width, height) {
    this.coordinate.width = this.board.width = this.chessLayer.width =
    this.promptLayer.width = this.markLayer.width = width;

    this.coordinate.height = this.board.height = this.chessLayer.height =
    this.promptLayer.height = this.markLayer.height = height;

    this.coordinate.style.position = this.board.style.position = this.chessLayer.style.position = 
    this.promptLayer.style.position = this.markLayer.style.position = 'absolute';

    this.workspace.style.position = 'relative';
    this.workspace.style.width = width + 'px';
    this.workspace.style.height = height + 'px';
    this.workspace.style.margin = '0';
    this.workspace.style.padding = '0';
}

SGFBoard.prototype._build = function () {
    this.boardWidth = (this.width - 1) * this.padding + this.width;
    this.visableWidth = this.boardWidth + 2 * this.margin;
    this.boardHeight = (this.height - 1) * this.padding + this.height;
    this.visableHeight = this.boardHeight + 2 * this.margin;
    this._buildLayerStyle(this.visableWidth, this.visableHeight);

    this.scaleX = 1;
    this.scaleY = 1;
    this.resize(this.styleWidth, this.styleHeight);
    this.node = this._getNodes();
 
    const ctx = this.board.getContext('2d');

    ctx.beginPath();
    ctx.fillStyle = this.background;
    ctx.rect(
        this.margin - this.padding / 2, this.margin - this.padding / 2, 
        this.boardWidth + this.padding, this.boardHeight + this.padding);
    ctx.fill();
    ctx.closePath();

    ctx.strokeStyle = this.lineColor;
    for (let i = 0, x = this.margin, y = this.margin; i < this.width; i++) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + this.boardHeight);
        ctx.closePath();
        ctx.stroke();
        x += this.padding + 1;
    }
    for (let i = 0, x = this.margin, y = this.margin; i < this.width; i++) {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + this.boardWidth, y);
        ctx.closePath();
        ctx.stroke();
        y += this.padding + 1;
    }

    let orientation = []
    let portrait = [];
    if (this.width > 6 && this.width < 10) {
        orientation = [2, this.width - 3];
    } else if ((this.width > 9 && this.width < 15) || !(this.width % 2)) {
        orientation = [3, this.width - 4];
    } else if (this.width > 14) {
        orientation = [3, parseInt(this.width / 2), this.width - 4];
    }
    if (this.height > 6 && this.height < 10) {
        portrait = [2, this.height - 3];
    } else if ((this.height > 9 && this.height < 15) || !(this.height % 2)) {
        portrait = [3, this.height - 4];
    } else if (this.height > 14) {
        portrait = [3, parseInt(this.height / 2), this.height - 4];
    }
    ctx.fillStyle = this.lineColor;
    for (let i = 0; i < orientation.length; i++) {
        for (let j = 0; j < portrait.length; j++) {
            this._drawStar(ctx, this.node.get(orientation[i], portrait[j])); 
        }
    }
    if (this.width == 13 && this.height == 13) {
        this._drawStar(ctx, this.node.get(6, 6));   
    }
    this._drawCoordinate();
}

SGFBoard.prototype._drawStar = function (ctx, loc) {
    ctx.beginPath();
    ctx.arc(loc.x, loc.y, 3.5, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
}

SGFBoard.prototype._drawCoordinate = function () {
    const ctx = this.coordinate.getContext('2d');
    ctx.font = `${parseInt(this.padding / 2) - 1}px bold Apercu`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0, c='A'; i < this.width; i++) {
        if (c == 'I') {
            i--;
        } else {
            const loc = this.node.get(i, 0);
            ctx.fillText(c, loc.x, this.padding * 2 / 3, this.padding - 2);
            ctx.fillText(c, loc.x, this.visableHeight - this.padding * 2 / 3, this.padding - 2);
        }
        c = String.fromCharCode(c.charCodeAt() + 1);
    }

    for (let i = 0; i < this.height; i++) {
        const loc = this.node.get(0, i);
        ctx.fillText(i + 1, this.padding * 2 / 3, loc.y,  this.padding - 2);
        ctx.fillText(i + 1, this.visableWidth - this.padding * 2 / 3, loc.y, this.padding - 2);
    }
}

SGFBoard.prototype._drawObject = function (x, y, type, prompt = false) {
    const ctx = prompt ? this.promptLayer.getContext('2d') : this.chessLayer.getContext('2d');
    const loc = this.node.get(x, y);
    if (type == 'w') {
        ctx.fillStyle = prompt ? '#ffffffdd' : '#fff';
        ctx.strokeStyle = this.lineColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(loc.x, loc.y, this.padding / 2 - 1, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else if (type == 'b') {
        ctx.fillStyle = prompt ? '#00000055' : '#000';
        ctx.strokeStyle = this.lineColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(loc.x, loc.y, this.padding / 2 - 1, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else if (type.length == 1 && type >= 'A' && type <= 'Z') {
        ctx.fillStyle = this.background;
        ctx.beginPath();
        ctx.arc(loc.x, loc.y, this.padding / 3, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();

        ctx.font = `${parseInt(this.padding / 2) - 1}px bold Apercu`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = this.branchColor;
        ctx.fillText(type, loc.x, loc.y, this.padding - 2);
    } else {
        const markCtx = prompt ? ctx : this.markLayer.getContext('2d');
        let markSize = this.padding / 5;
        markCtx.fillStyle = prompt ? '#00000055' : this.markColor;
        markCtx.strokeStyle = this.markColor;
        markCtx.lineWidth = 1;
        markCtx.beginPath();
        if (type == 'CR') {
            markCtx.arc(loc.x, loc.y, markSize, 0, 2 * Math.PI);
        } else if (type == 'TR') {
            markSize = this.padding / 4;
            const ySize = markSize / 2;
            const xSize = markSize * Math.sqrt(3) / 2 
            markCtx.moveTo(loc.x - xSize, loc.y + ySize);
            markCtx.lineTo(loc.x, loc.y - markSize);
            markCtx.lineTo(loc.x + xSize, loc.y + ySize);
        } else if (type == 'SQ') {
            markCtx.rect(
                loc.x - markSize, loc.y - markSize,
                markSize * 2, markSize * 2);
        } else if (type == 'MA') {
            const ySize = markSize;
            markCtx.lineWidth = 2;
            markCtx.moveTo(loc.x - ySize, loc.y - ySize);
            markCtx.lineTo(loc.x + ySize, loc.y + ySize);
            markCtx.moveTo(loc.x + ySize, loc.y - ySize);
            markCtx.lineTo(loc.x - ySize, loc.y + ySize);
        } else if (/^LB[A-Z]?$/.test(type)) {
            markCtx.font = `${parseInt(this.padding * 2 / 3) - 1}px bold Apercu`;
            markCtx.textAlign = 'center';
            markCtx.textBaseline = 'middle';
            markCtx.fillText(type.length == 3 ? type[2] : 'A', loc.x, loc.y, this.padding - 2);
        }
        markCtx.closePath(); 
        markCtx.fill();
        markCtx.stroke();
    }
}

SGFBoard.prototype.putWhite = function (x, y) {
    this._drawObject(x, y, 'w');
}

SGFBoard.prototype.putBlack = function (x, y) {
    this._drawObject(x, y, 'b');
}

SGFBoard.prototype.putBranch = function (x, y, branch) {
    const type = 'A'.charCodeAt() + branch;
    this._drawObject(x, y, String.fromCharCode(type));
}

SGFBoard.prototype.putMark = function (mark) {
    let type = mark.type;
    if (mark.type == 'LB') {
        type += mark.d;
    }
    this._drawObject(mark.x, mark.y, type);
}

SGFBoard.prototype.clearMark = function () {
    const ctx = this.markLayer.getContext('2d');
    ctx.clearRect(0, 0, this.board.width, this.board.height);
}

SGFBoard.prototype.delete = function (x, y, prompt = false) {
    const ctx = prompt ? this.promptLayer.getContext('2d') : this.chessLayer.getContext('2d');
    const loc = this.node.get(x, y);
    const r = this.padding / 2;
    ctx.clearRect(loc.x - r, loc.y - r, this.padding, this.padding);
}

SGFBoard.prototype.setOnClickListener = function (listener) {
    this.runtime.onClickListener = listener;
}

SGFBoard.prototype.removeOnClickListener = function (listener) {
    if (this.runtime.onClickListener) {
        this.runtime.onClickListener = null;
    }   
}

SGFBoard.prototype.setOnRClickListener = function (listener) {
    this.runtime.onRClickListener = listener;
}

SGFBoard.prototype.removeOnRClickListener = function (listener) {
    if (this.runtime.onRClickListener) {
        this.runtime.onRClickListener = null;
    }   
}

SGFBoard.prototype.select = function (type) {
    this.runtime.select = type;
}

SGFBoard.prototype.hideCoordinate = function () {
    this.coordinate.style.display = 'none';
}

SGFBoard.prototype.showCoordinate = function () {
    this.coordinate.style.display = '';
}

SGFBoard.prototype.hidePrompt = function () {
    this.promptLayer.style.display = 'none';
    this.runtime.isPrompt = false;
}

SGFBoard.prototype.showPrompt = function () {
    this.promptLayer.style.display = '';
    this.runtime.isPrompt = true;
}

SGFBoard.prototype._getNodes = function () {
    const answer = [];
    for (let i = 0, x = this.margin; i < this.width; i++) {
        const line = [];
        for (let j = 0, y = this.margin; j < this.height; j++) {
            line.push({
                x: x,
                y: y
            });
            y += this.padding + 1;
        }
        x += this.padding + 1;
        answer.push(line);
    }

    answer.get = function (x, y) {
        if (x >= this.length || y >= this[x].length) {
            return {x: -1, y: -1};
        }
        return this[x][y];
    }
    return answer;
}

module.exports = SGFBoard;
