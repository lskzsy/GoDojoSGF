const SGFBoardLayer = require('./layer');
const SGFBoardLayerType = require('./layer-type');

const SGFBoardWorkspace = function (dimension, position='relative') {
    this.workspace = document.createElement('div');
    this.dimension = dimension;
    this.layerManage = {};

    this.isBuild = false;
    this.showCoordinate = false;

    this.workspace.style.position = position;
    this.workspace.style.margin = '0';
    this.workspace.style.padding = '0';

    this.nodes = [];
}

SGFBoardWorkspace.prototype.register = function (name, functions={}, config={}) {
    const layer = new SGFBoardLayer(this, name, functions, config);
    this.layerManage[name] = layer;
}

SGFBoardWorkspace.prototype.belongTo = function (hook) {
    if (hook.appendChild) {
        hook.appendChild(this.workspace);

        /** build */
        if (!this.isBuild) {
            this.isBuild = true;

            this.updateEdges();
            this.updateNodes();
            this.broadcast('build');
        }
    }
}

SGFBoardWorkspace.prototype.resize = function (width, height) {
    this.dimension.resize(width, height);
    this.updateEdges();
    this.updateNodes();
    this.broadcast('resize');
    this.showCoordinate && this.handle(SGFBoardLayerType.BOARD, 'coordinate');
}

SGFBoardWorkspace.prototype.broadcast = function (msg, params={}) {
    for (let name in this.layerManage) {
        const layer = this.layerManage[name];
        layer.call(msg, params);
    }
}

SGFBoardWorkspace.prototype.coordinate = function (show) {
    if (!this.showCoordinate && show) {
        this.showCoordinate = true;
        this.dimension.showCoordinate(true);
        this.updateNodes();
        this.broadcast('resize');
        this.handle(SGFBoardLayerType.BOARD, 'coordinate');
    } else if (this.showCoordinate && !show) {
        this.showCoordinate = false;
        this.dimension.showCoordinate(false);
        this.updateNodes();
        this.broadcast('resize');
    }
}

SGFBoardWorkspace.prototype.updateEdges = function () {
    this.workspace.style.width = this.dimension.width + 'px';
    this.workspace.style.height = this.dimension.height + 'px';

    for (let name in this.layerManage) {
        const layer = this.layerManage[name];
        layer.sizeBy(this.dimension.width, this.dimension.height);
    }
}

SGFBoardWorkspace.prototype.handle = function (layer, msg, params={}) {
    if (this.layerManage[layer]) {
        this.layerManage[layer].call(msg, params);
    }
}

SGFBoardWorkspace.prototype.updateNodes = function () {
    const answer = [];
    for (let i = 0, x = this.dimension.margin + this.dimension.baseStart; i < this.dimension.x; i++) {
        const line = [];
        for (let j = 0, y = this.dimension.margin + this.dimension.baseStart; j < this.dimension.y; j++) {
            line.push({
                x: x,
                y: y
            });
            y += this.dimension.padding + 1;
        }
        x += this.dimension.padding + 1;
        answer.push(line);
    }

    answer.get = function (x, y) {
        if (x >= this.length || y >= this[x].length) {
            return {x: -1, y: -1};
        }
        return this[x][y];
    }
    this.nodes = answer;
}

SGFBoardWorkspace.prototype.appendChild = function (view) {
    this.workspace.appendChild(view);
}

SGFBoardWorkspace.prototype.onClick = function (listener) {
    this.workspace.onclick = listener;
}

SGFBoardWorkspace.prototype.onRClick = function (listener) {
    this.workspace.oncontextmenu = listener;
}

module.exports = SGFBoardWorkspace;
