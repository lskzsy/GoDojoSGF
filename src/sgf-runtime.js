const GoRule            = require('./go-rule');
const SGFPlayer         = require('./sgf-player');
const SGFVirtualBoard   = require('./sgf-virtual-board');
const SGFBranch         = require('./sgf-branch');
const SGFStep           = require('./sgf-step');
const SGFConvertor      = require('./sgf-convertor');
const SGFInput          = require('./sgf-input');
const Util              = require('./util');

const SGFRuntime = function (option={}) {
    //  current board data
    this.board = new SGFVirtualBoard();

    //  viewer component
    this.front = null;

    //  board properties
    this.properties = {
        x:              option.x || 19,           //  x limit for board coordinate
        y:              option.y || 19,           //  y limit for board coordinate
        isKo:           option.isKo || false,
        encoding:       option.encoding || 'UTF-8',
        boardSize:      (option.boardSize || '19') + '',
        application:    option.application || 'GoDojoSGF:20200126',
        fileFormat:     option.fileFormat || 1,
        gameMode:       option.gameMode || 1,
        initData:       option.data || false
    }

    if (this.properties.boardSize.indexOf(':') > -1) {
        const split = this.properties.boardSize.split(':');
        this.properties.x = parseInt(split[0]);
        this.properties.y = parseInt(split[1]);
    } else {
        this.properties.x = this.properties.y = parseInt(this.properties.boardSize);
    }

    //  event handlers
    this.handlers = {
        onStoneCreated: null,   //  callback when stone created
        onStoneDeleted: null,   //  callback when stone deleted
        onBranchMove: null      //  callback when branch was changed
    }

    this.branch     = new SGFBranch();
    this.player     = new SGFPlayer(this.properties, this.board, this.branch);
    this.goRule     = new GoRule(this.board, this.properties.isKo);
    this.convertor  = new SGFConvertor();
    this.input      = new SGFInput();

    this.build();
}

SGFRuntime.prototype.build = function () {
    this.board.build(this.properties);
    this.board.setRule(this.goRule);
    this.board.setInput(this.input);

    /** convert sgf string data, if user input */
    if (this.properties.initData) {
        this.initBySGFString(this.properties.initData);
    }
}

SGFRuntime.prototype.initBySGFString = function (string) {
    const info = this.convertor.do(string);
    if (info) {
        //  string is valid
        const root = info.root;
        root.application && (this.properties.application = root.application);
        root.boardSize && (this.properties.boardSize = root.boardSize);
        root.width && (this.properties.x = root.width);
        root.height && (this.properties.y = root.height);
        root.encoding && (this.properties.encoding = root.encoding);
        root.fileFormat && (this.properties.fileFormat = root.fileFormat);
        root.gameMode && (this.properties.gameMode = root.gameMode);

        this.branch.init(info.data);
    }
}

SGFRuntime.prototype.reset = function () {
}

SGFRuntime.prototype.toString = function () {
    return this.convertor.to(this);
}

SGFRuntime.prototype.updateBySGFString = function (string) {
    this.reset();
    this.initBySGFString(string);
}

SGFRuntime.prototype.putStone = function (chess) {
    const step = new SGFStep(chess.x, chess.y, chess.color, this.player.step + 1);
    if (this.board.pass(chess.x, chess.y) && !this.goRule.isAsphyxiating(step.stone)) {
        let created = false;
        let changed = false;

        /** 判断是否应该加入分支 */
        const next  = this.player.next();
        const exist = this.branch.get(next);
        if (Util.typeIs(exist, SGFStep)) {
            if (!exist.equal(step)) {
                /** 如果新步骤不同于存在当前步骤，创建分支 */
                const branchIndex = this.branch.divide(next, step);
                if (branchIndex !== false) {
                    /** 播放器切换至新的分支上 */
                    this.player.checkout(branchIndex);
                    created = true;
                    changed = true;
                }
            } else {
                /** 如果新步骤等于存在当前步骤，播放器向后播放 */
                this.player.continue();
            }
        } else if (Util.typeIs(exist, Array)) {
            /** 下一步为分支 */
            const branchBegin = next[next.length - 1];
            const index = this.branch.find(next, step, branchBegin);
            if (index === false) {
                /** 分支中不存在当前步骤，创建分支 */
                const branchIndex = this.branch.divide(next, step);
                if (branchIndex !== false) {
                    /** 播放器切换至新的分支上 */
                    this.player.checkout(branchIndex);
                    created = true;
                    changed = true;
                }
            } else {
                /** 若分支中已存在当前步骤，则切换到分支上 */
                this.player.checkout(index);
                changed = true;
            }
        } else {
            /** 若分支上不存在该步骤，则直接插入 */
            this.branch.insert(this.player.getRoute(), step);
            /** 播放器向后播放 */
            this.player.continue();
            created = true        
        }

        if (created) {
            /** 存在新步骤创建，即通知回调 */
            // this.handlers.onStoneCreated && 
            //     this.handlers.onStoneCreated(this.player.route, step);
        }
        if (changed) {
            /** 存在分支切换，即通知回调 */
            this.handlers.onBranchMove && 
                this.handlers.onBranchMove();
        }
    }
}

SGFRuntime.prototype.setFront = function (front) {
    this.front = front;
    this.board.setFront(front);
    this.input.setFront(front);
}

SGFRuntime.prototype.hasFront = function () {
    return this.front != null;
}

SGFRuntime.prototype.onStoneCreated = function (callback) {
    this.handlers.onStoneCreated = callback;
}

SGFRuntime.prototype.onStoneDeleted = function (callback) {
    this.handlers.onStoneDeleted = callback;
}

SGFRuntime.prototype.onBranchMove = function (callback) {
    this.handlers.onBranchMove = callback;
}

module.exports = SGFRuntime;
