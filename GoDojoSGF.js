var SGF = function (sgfData) {
    this.encoding = 'utf-8';
    this.boardSize = '19';
    this.application = 'GoDojoSGF:1.0.0';
    this.fileFormat = 1;
    this.gameMode = 1;
    this.board = null;
    this.runtime = {
        currentStep: 0,
        board: [],
        branchMark: [],
        data: [],
        killBy: {}
    };

    const rawData = sgfData.replace(/\n/g, '');
    this.symbolMap = this._scan(rawData);
    this.data = [];
    this.file = [];
    if (this.symbolMap && rawData[0] == '(') {
        let raws = this._parse(rawData, 0, this.symbolMap[0]);
        this._parseRoot(raws[0]);
        this.file = this.data = this._convert(raws.slice(1));
        this.runtime.history = [];
        this.runtime.step = -1;
        this.runtime.branch = this.data;

        for (let i = 0; i < this.width; i++) {
            const line = [];
            for (let j = 0; j < this.height; j++) {
                line.push('');
            }
            this.runtime.board.push(line);
        }
    }
}

SGF.prototype.default = function () {
    if (this.board) {
        let current = this.data;
        let i = 0;
        let l = this.data.length;
        while (i < l) {
            if (current[i] instanceof Array) {
                l = current[i].length;
                current = current[i];
                i = 0;
            } else {
                this.putChess(current[i]);
                i++;
            }
        }
    }
}

SGF.prototype.putChess = function (chess) {
    if (this.runtime.board[chess.x][chess.y] === '' 
            && !this._isAsphyxiating(chess.x, chess.y, chess.color.toLowerCase())) {
        if (chess.color == 'W') {
            this.board.putWhite(chess.x, chess.y);
            this.runtime.board[chess.x][chess.y] = 'w';
            this.board.select('b');
        } else {
            this.board.putBlack(chess.x, chess.y);
            this.runtime.board[chess.x][chess.y] = 'b';
            this.board.select('w');
        }
        this.runtime.data.push(chess);
    }
}

SGF.prototype.insert = function (x, y, c) {
    const chess = {
        color: c.toUpperCase(),
        x: x,
        y: y
    };
    this.runtime.data.push(chess);
    const step = ++this.runtime.step;
    if (step < this.runtime.branch.length) {
        const cur = this.runtime.branch[step];
        if (!(cur instanceof Array)) {
            if (cur.x != chess.x || cur.y != chess.y || cur.color != chess.color) {
                const old = this.runtime.branch.splice(step);
                const newBranch = [];
                this.runtime.branch.push(old);
                this.runtime.branch.push([chess]);
                this._nextBranch(step, this.runtime.branch.length - 1);
            }
        } else {
            const branch = this.runtime.branch;
            let selected = false;
            for (let i = step; i < branch.length; i++) {
                const cur = branch[i][0];
                if (cur.x == chess.x && cur.y == chess.y && cur.color == chess.color) {
                    // select branch
                    selected = true;
                    this._nextBranch(step, i);
                }
            }
            if (!selected) {
                // new branch
                this.runtime.branch.push([chess]);
                this._nextBranch(step, this.runtime.branch.length - 1);
            }
            this._clearBranchMark();
        }
        this._checkBranch(this.runtime.step); 
    } else {
        this.runtime.branch.push(chess);
    }
}

SGF.prototype._clearBranchMark = function () {
    this.runtime.branchMark.forEach(mark => this.board.delete(mark.x, mark.y));
    this.runtime.branchMark = [];
}

SGF.prototype._nextBranch = function(step, i) {
    this.runtime.history.push({
        branch: this.runtime.branch,
        step: step - 1
    });
    this.runtime.branch = this.runtime.branch[i];
    this.runtime.step = 0;
}

SGF.prototype.continue = function () {
    const step = ++this.runtime.step;
    if (step < this.runtime.branch.length) {
        const cur = this.runtime.branch[step];
        if (!(cur instanceof Array)) {
            this.runtime.currentStep++;
            this.putChess(cur);

            this._checkBranch(step);
        } else {
            this.runtime.step--;
        }
    } else {
        this.runtime.step--;
    }
}

SGF.prototype.back = function() {
    const step = this.runtime.step;
    if (step > -1) {
        const chess = this.runtime.branch[step];
        // console.log(this.runtime.branch, chess);
        if (this.runtime.board[chess.x][chess.y] == 'w') {
            this.board.select('w');
        } else {
            this.board.select('b');
        }
        this.runtime.board[chess.x][chess.y] = '';
        this.board.delete(chess.x, chess.y);

        this._backLife();
        this.runtime.step--;
        this.runtime.currentStep--;
        this.runtime.data.pop();

        this._clearBranchMark();
    }
    if (this.runtime.step == -1) {
        const history = this.runtime.history.pop();
        if (history) {
            this.runtime.branch = history.branch;
            this.runtime.step = history.step;
            this._checkBranch(this.runtime.step);   
        }
    }
}

SGF.prototype._checkBranch = function (step) {
    const branch = this.runtime.branch;
    if (step + 1 < branch.length && (branch[step + 1] instanceof Array)) {
        for (let i = step + 1, j = 0; i < branch.length; i++, j++) {
            this.board.putBranch(branch[i][0].x, branch[i][0].y, j);
            this.runtime.branchMark.push({
                x: branch[i][0].x,
                y: branch[i][0].y
            });
        }
    }
}

SGF.prototype.showOn = function (id) {
    const parent = document.getElementById(id);
    this.board = new SGFBoard(parent, {
        width: this.width,
        height: this.height
    });
    this.board.setOnClickListener(this._click.bind(this));
    this.board.setOnRClickListener(this._rclick.bind(this));
}

SGF.prototype._rclick = function (x, y) {

}

SGF.prototype._click = function (x, y, type) {
    if (type == 'b' || type == 'w') {
        if (this.runtime.board[x][y] === '' 
            && !this._isAsphyxiating(x, y, type)) { 
            this.runtime.board[x][y] = type;
            this.runtime.currentStep++;
            this.insert(x, y, type);

            setTimeout(() => {
                if (type == 'b') {
                    this.board.select('w');
                } else {
                    this.board.select('b');
                }
            }, 10);    
            return true;
        } else {
            return false;
        }
    }
}

SGF.prototype._backLife = function () {
    const dead = this.runtime.killBy[this.runtime.currentStep];
    if (dead) {
        dead.forEach(d => this.putChess(d));
        this.runtime.killBy[this.runtime.currentStep] = undefined;
    }
}

SGF.prototype._isAsphyxiating = function (x, y, c) {
    this.runtime.board[x][y] = c;
    this._clearDead(x, y, c);
    const breach = !this._searchBreath(x, y);
    this.runtime.board[x][y] = '';
    return breach;
}

SGF.prototype._clearDead = function (x, y, c) {
    const xx = [0, 1, 0, -1];
    const yy = [1, 0, -1, 0];
  
    for (let i = 0; i < 4; i++) {
        const xt = x + xx[i];
        const yt = y + yy[i];

        if (xt >= 0 && xt < this.width && yt >= 0 && yt < this.height
            && this.runtime.board[xt][yt] != c && this.runtime.board[xt][yt] !== '') {
            const chesses = [];
            if (!this._searchBreath(xt, yt, chesses)) {
                this.runtime.killBy[this.runtime.currentStep + 1] = [];
                for (let j = 0; j < chesses.length; j++) {
                    this.runtime.killBy[this.runtime.currentStep + 1].push({
                        x: chesses[j].x,
                        y: chesses[j].y,
                        color: this.runtime.board[chesses[j].x][chesses[j].y].toUpperCase()
                    });
                    this.runtime.board[chesses[j].x][chesses[j].y] = '';
                    this.board.delete(chesses[j].x, chesses[j].y);
                }
            }
        }
    }
}

SGF.prototype._searchBreath = function (x, y, chesses = []) {
    const xx = [0, 1, 0, -1];
    const yy = [1, 0, -1, 0];
    const queue = [];
    const visited = {};
    const c = this.runtime.board[x][y];
    const breath = false;
    queue.push({x: x, y: y});
    visited[`${x}:${y}`] = true;
    chesses.push({x: x, y: y});

    while (queue.length > 0) {
        // bfs
        const cur = queue.splice(0, 1)[0];
        for (let i = 0; i < 4; i++) {
            const xt = cur.x + xx[i];
            const yt = cur.y + yy[i];

            if (!visited[`${xt}:${yt}`] && xt >= 0 && xt < this.width && yt >= 0 && yt < this.height) {
                visited[`${xt}:${yt}`] = true;
                const chess = this.runtime.board[xt][yt];
                if (chess == c) {
                    queue.push({x: xt, y: yt});
                    chesses.push({x: xt, y: yt});
                } else if (chess == '') {
                    return true;
                }
            }
        }
    }
    return breath;
}

SGF.prototype._convert = function (raws) {
    const answer = [];
    const a = 'a'.charCodeAt();
    for (let i = 0; i < raws.length; i++) {
        if (typeof(raws[i]) == 'object') {
            answer.push(this._convert(raws[i]));
        } else {
            const match = /(W|B)\[(\w)(\w)\]/.exec(raws[i]);
            if (match) {
                answer.push({
                    color: match[1],
                    x: match[2].charCodeAt() - a,
                    y: match[3].charCodeAt() - a
                });
            }
        }
    }
    return answer;
}

SGF.prototype._parse = function (rawData, start, end) { 
    const answer = [];
    let i = start + 1;
    let branch = rawData.indexOf('(', i);
    if (branch > end || branch == -1) {
        branch = end;
    }
    const steps = rawData.substring(i, branch).split(';');
    steps.forEach(step => {
        if (step.length > 0) {
            answer.push(step);
        }
    });

    /**
        届かない恋をしていても 映しだす日がくるかな
     */
    i = branch;
    while (i < end && i != -1) {
        let j = this.symbolMap[i];
        answer.push(this._parse(rawData, i, j));
        i = rawData.indexOf('(', j);
    }
    return answer;
}

SGF.prototype._scan = function (rawData) {
    const symbolMap = {};
    const stack = [];
    let deep = 0;
    for (let i = 0; i < rawData.length; i++) {
        switch (rawData[i]) {
            case '(':
                stack[deep++] = i;
                break;
            case ')':
                symbolMap[stack[--deep]] = i;
                break;
        }
    }

    if (deep) {
        return null;
    } else {
        return symbolMap;
    }
}

SGF.prototype._parseRoot = function (rootData) {
    if (AP = /AP\[(.*?)\]/.exec(rootData)) {
        this.application = AP[1];
    }
    if (CA = /CA\[(.*?)\]/.exec(rootData)) {
        this.encoding = CA[1];
    }
    if (GM = /GM\[(\d+)\]/.exec(rootData)) {
        this.gameMode =  parseInt(GM[1]);
    }
    if (FF = /FF\[([1-4])\]/.exec(rootData)) {
        this.fileFormat =  parseInt(FF[1]);
    }
    if (SZ = /SZ\[(\d+|\d+:\d+)\]/.exec(rootData)) {
        this.boardSize = SZ[1];
        this.width = 0;
        this.height = 0;
        if (this.boardSize.indexOf(':') > -1) {
            const answer = this.boardSize.split(':');
            this.width = answer[0];
            this.height = answer[1];
        } else {
            this.width = this.height = parseInt(this.boardSize);
        }
    }
}

var SGFBoard = function (hook, option = {}) {
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
