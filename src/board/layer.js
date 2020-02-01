const SGFBoardLayer = function (workspace, name, functions, config) {
    this.canvas     = document.createElement('canvas');
    this.workspace  = workspace;
    this.name       = name;
    this.mapper     = {};
    this.config     = config;

    for (let key in functions) {
        this.mapper[key] = functions[key].bind(this);
    }

    this.canvas.style.position = 'absolute';
    workspace.appendChild(this.canvas);
}

SGFBoardLayer.prototype.call = function (functionName, params={}) {
    if (this.mapper[functionName]) {
        return this.mapper[functionName](params);
    } else {
        return null;
    }
}

SGFBoardLayer.prototype.sizeBy = function (dimension) {
    this.canvas.width = dimension.width;
    this.canvas.height = dimension.height;
    this.canvas.style.width = dimension.styleWidth + 'px';
    this.canvas.style.height = dimension.styleHeight + 'px';
}

module.exports = SGFBoardLayer;
