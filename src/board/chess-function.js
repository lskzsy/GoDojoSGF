module.exports = {
    build: function () {
        this.stones = {};
        this.branchMarks = {};
    },
    resize: function () {
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let tag in this.stones) {
            this.call('putStone', this.stones[tag]);
        }
        for (let tag in this.branchMarks) {
            this.call('putBranch', this.branchMarks[tag]);
        }
    },
    putWhite: function (params) {
        params.isBlack = false;
        this.call('putStone', params);
    },
    putBlack: function (params) {
        params.isBlack = true;
        this.call('putStone', params);
    },
    putStone: function (params) {
        const ctx       = this.canvas.getContext('2d');
        const dimension = this.workspace.dimension;
        const nodes     = this.workspace.nodes;

        const loc = nodes.get(params.x, params.y);

        ctx.fillStyle = params.isBlack ? '#000' : '#fff';
        ctx.strokeStyle = this.config.lineColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(loc.x, loc.y, dimension.padding / 2 - 1, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        this.stones[`${params.x}:${params.y}`] = params;
    },
    putBranch: function (params) {
        const ctx       = this.canvas.getContext('2d');
        const dimension = this.workspace.dimension;
        const nodes     = this.workspace.nodes;

        const loc = nodes.get(params.x, params.y);

        ctx.fillStyle = this.config.background;
        ctx.beginPath();
        ctx.arc(loc.x, loc.y, dimension.padding / 3, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();

        ctx.font = `${parseInt(dimension.padding / 2) - 1}px bold Apercu`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = this.config.branchColor;
        ctx.fillText(params.type, loc.x, loc.y, dimension.padding - 2);

        this.branchMarks[`${params.x}:${params.y}`] = params;
    },
    delete: function (params) {
        const ctx       = this.canvas.getContext('2d');
        const dimension = this.workspace.dimension;
        const nodes     = this.workspace.nodes;

        const loc = nodes.get(params.x, params.y);
        const r = dimension.padding / 2;
        ctx.clearRect(loc.x - r, loc.y - r, dimension.padding, dimension.padding);

        const tag = `${params.x}:${params.y}`;
        this.stones[tag] && delete this.stones[tag];
        this.branchMarks[tag] && delete this.branchMarks[tag];
    }
}
