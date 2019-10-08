const SGFBoard = function (hook, option = {}) {
    this.width = option.width || 19;
    this.height = option.height || 19;
    this.lineColor = option.lineColor || 'black';
    this.background = option.background || '#fff';
    this.margin = option.margin || 20;
    this.padding = option.padding || 30;
    this.branchColor = option.branchColor || 'blue';

    this.workspace = document.createElement('div');
    this.board = document.createElement('canvas');
    this.chessLayer = document.createElement('canvas');
    this.promptLayer = document.createElement('canvas');
    this.workspace.appendChild(this.board);
    this.workspace.appendChild(this.chessLayer);
    this.workspace.appendChild(this.promptLayer);

    this.runtime = {
        select: 'b',
        onClickListeners: [],
        onRClickListeners: []
    }

    this._build();
    this._bind();

    if (hook.appendChild) {
        hook.appendChild(this.workspace);
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
    }.bind(this);
    this.workspace.onmouseleave = function(event) {
        if (this.promptX != -1 && this.promptY != -1) {
            this.delete(this.promptX, this.promptY, true);
        }
    }.bind(this);
}

SGFBoard.prototype._onclick = function (event) {
    const pos = this._clickLoc(event);

    for (let i = 0; i < this.runtime.onClickListeners.length; i++) {
        const listener = this.runtime.onClickListeners[i];
        if (!listener(pos.x, pos.y, this.runtime.select)) {
            return;
        }
    };

    this._drawObject(pos.x, pos.y, this.runtime.select);
}

SGFBoard.prototype._clickLoc = function (event) {
    const x = event.offsetX - this.margin;
    const y = event.offsetY - this.margin;
    const s = this.padding / 2;
    let xPos = 0;
    let yPos = 0;

    if (x < 0 && x > -1 * s) {
        xPos = 0;
    } else if (x > this.boardWidth && this.boardWidth + s) {
        xPos = this.width - 1;
    } else {
        xPos = parseInt((x + s) / (this.padding + 1));
    }
    if (y < 0 && y > -1 * s) {
        yPos = 0;
    } else if (y > this.boardHeight && this.boardHeight + s) {
        yPos = this.height - 1;
    } else {
        yPos = parseInt((y + s) / (this.padding + 1));
    }

    return {x: xPos, y: yPos};
}

SGFBoard.prototype._buildLayerStyle = function (width, height) {
    this.board.width = width;
    this.board.height = height;
    this.board.style.position = 'absolute';

    this.chessLayer.width = width;
    this.chessLayer.height = height
    this.chessLayer.style.position = 'absolute';

    this.promptLayer.width = width;
    this.promptLayer.height = height;
    this.promptLayer.style.position = 'absolute';

    this.workspace.style.position = 'relative';
    this.workspace.style.width = width + 'px';
    this.workspace.style.height = height + 'px';
    this.workspace.style.margin = '0';
    this.workspace.style.padding = '0';
}

SGFBoard.prototype._build = function () {
    this.node = this._getNodes();

    this.boardWidth = (this.width - 1) * this.padding + this.width;
    this.visableWidth = this.boardWidth + 2 * this.margin;
    this.boardHeight = (this.height - 1) * this.padding + this.height;
    this.visableHeight = this.boardHeight + 2 * this.margin;
    this._buildLayerStyle(this.visableWidth, this.visableHeight);

    const ctx = this.board.getContext('2d');
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
}

SGFBoard.prototype._drawStar = function (ctx, loc) {
    ctx.beginPath();
    ctx.arc(loc.x, loc.y, 3.5, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
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
    } else if (type >= 'A' && type <= 'Z') {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(loc.x, loc.y, this.padding / 3, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();

        ctx.font = `${parseInt(this.padding / 2) - 1}px bold 黑体`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = this.branchColor;
        ctx.fillText(type, loc.x, loc.y, this.padding - 2);
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

SGFBoard.prototype.delete = function (x, y, prompt = false) {
    const ctx = prompt ? this.promptLayer.getContext('2d') : this.chessLayer.getContext('2d');
    const loc = this.node.get(x, y);
    const r = this.padding / 2;
    ctx.clearRect(loc.x - r, loc.y - r, this.padding, this.padding);
}

SGFBoard.prototype.setOnClickListener = function (listener) {
    if (this.runtime.onClickListeners.indexOf(listener) < 0) {
        this.runtime.onClickListeners.push(listener);
    }   
}

SGFBoard.prototype.removeOnClickListener = function (listener) {
    const search = this.runtime.onClickListeners.indexOf(listener);
    if (search > -1) {
        this.runtime.onClickListeners.splice(search, 1);
    }   
}

SGFBoard.prototype.setOnRClickListener = function (listener) {
    if (this.runtime.onRClickListeners.indexOf(listener) < 0) {
        this.runtime.onRClickListeners.push(listener);
    }   
}

SGFBoard.prototype.removeOnRClickListener = function (listener) {
    const search = this.runtime.onRClickListeners.indexOf(listener);
    if (search > -1) {
        this.runtime.onRClickListeners.splice(search, 1);
    }   
}

SGFBoard.prototype.change = function (type) {
    if (type == 'b') {
        this.select('w');
    } else {
        this.select('b');
    }
}

SGFBoard.prototype.select = function (type) {
    this.runtime.select = type;
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
