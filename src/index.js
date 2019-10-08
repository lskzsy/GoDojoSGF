const SGFBoard = require('./sgf-board');
const SGFRuntime = require('./sgf-runtime');
const SGFConvertor = require('./sgf-convertor');
const SGFBranch = require('./sgf-branch');
const GoRule = require('./go-rule');

window.SGF = function (sgfData) {
    this.encoding = 'utf-8';
    this.boardSize = '19';
    this.application = 'GoDojoSGF:1.0.0';
    this.fileFormat = 1;
    this.gameMode = 1;

    this.runtime = new SGFRuntime();
    this.goRule = null;

    const convertor = new SGFConvertor();
    const info = convertor.do(sgfData);
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
        //  runtime
        this.runtime.init(this.width, this.height, this.data);
        this.branch = new SGFBranch(this.runtime);
    }
}

SGF.prototype.default = function () {
    if (this.runtime.hasFront()) {
        let current = this.data;
        let i = 0;
        let l = this.data.length;
        while (i < l) {
            if (current[i] instanceof Array) {
                l = current[i].length;
                current = current[i];
                i = 0;
            } else {
                this.runtime.putChess(current[i]);
                i++;
            }
        }
    }
}

SGF.prototype.continue = function () {
    this.branch.continue();
}

SGF.prototype.back = function() {
    this.branch.back();
}

SGF.prototype.showOn = function (id) {
    const parent = document.getElementById(id);
    const board = new SGFBoard(parent, {
        width: this.width,
        height: this.height
    });
    board.setOnClickListener(this._click.bind(this));
    board.setOnRClickListener(this._rclick.bind(this));

    this.runtime && this.runtime.setFront(board);
}

SGF.prototype._delete = function (stone) {
    
}

SGF.prototype._rclick = function () {
    if (step > -1) {
        const stone = this.runtime.branch[this.runtime.step];
        this._delete(stone);
    }  
}

SGF.prototype._click = function (x, y, type) {
    if (type == 'b' || type == 'w') {
        if (this.runtime.board[x][y] === '' 
            && !GoRule.isAsphyxiating(this.runtime, x, y, type)) { 
            this.runtime.board[x][y] = type;
            this.runtime.currentStep++;
            this.branch.insert(x, y, type);

            setTimeout(() => {
                this.runtime.hasFront() && this.runtime.front.change(type);
            }, 10);    
            return true;
        } else {
            return false;
        }
    }
}
