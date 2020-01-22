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

SGFBoardLayer.prototype.sizeBy = function (width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
}

module.exports = SGFBoardLayer;
