module.exports = {
    build: function () { 
        this.marks = {};
    },
    resize: function () {
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let tag in this.marks) {
            this.call('put', this.marks[tag]);
        }
    },
    put: function (params) {
        const markCtx   = this.canvas.getContext('2d');
        const dimension = this.workspace.dimension;
        const nodes     = this.workspace.nodes;

        const loc = nodes.get(params.x, params.y);

        let markSize = dimension.padding / 5;
        markCtx.fillStyle = this.config.markColor;
        markCtx.strokeStyle = this.config.markColor;
        markCtx.lineWidth = 1;
        markCtx.beginPath();
        if (params.type == 'CR') {
            markCtx.arc(loc.x, loc.y, markSize, 0, 2 * Math.PI);
        } else if (params.type == 'TR') {
            markSize = dimension.padding / 4;
            const ySize = markSize / 2;
            const xSize = markSize * Math.sqrt(3) / 2 
            markCtx.moveTo(loc.x - xSize, loc.y + ySize);
            markCtx.lineTo(loc.x, loc.y - markSize);
            markCtx.lineTo(loc.x + xSize, loc.y + ySize);
        } else if (params.type == 'SQ') {
            markCtx.rect(
                loc.x - markSize, loc.y - markSize,
                markSize * 2, markSize * 2);
        } else if (params.type == 'MA') {
            const ySize = markSize;
            markCtx.lineWidth = 2;
            markCtx.moveTo(loc.x - ySize, loc.y - ySize);
            markCtx.lineTo(loc.x + ySize, loc.y + ySize);
            markCtx.moveTo(loc.x + ySize, loc.y - ySize);
            markCtx.lineTo(loc.x - ySize, loc.y + ySize);
        } else if (/^LB[A-Z]?$/.test(params.type)) {
            markCtx.font = `${parseInt(dimension.padding * 2 / 3) - 1}px bold Apercu`;
            markCtx.textAlign = 'center';
            markCtx.textBaseline = 'middle';
            markCtx.fillText(params.type.length == 3 ? params.type[2] : 'A', loc.x, loc.y, dimension.padding - 2);
        }
        markCtx.closePath(); 
        markCtx.fill();
        markCtx.stroke();

        this.marks[`${params.x}:${params.y}`] = params;
    },
    delete: function (params) {
        const ctx       = this.canvas.getContext('2d');
        const dimension = this.workspace.dimension;
        const nodes     = this.workspace.nodes;

        if (params.x >= 0 && params.y >= 0) {
            const loc = nodes.get(params.x, params.y);
            const r = dimension.padding / 2;
            ctx.clearRect(loc.x - r, loc.y - r, dimension.padding, dimension.padding);

            const tag = `${params.x}:${params.y}`;
            this.marks[tag] && delete this.marks[tag];
        } else {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.marks = {};
        }
    }
}
