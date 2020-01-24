module.exports = {
    build: function () {
        this.stones = {};
        this.branchMarks = {};
        this.current = null;
        this.showStep = false;
        this.maxStep = 0;
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
        this.call('drawStone', params);

        if (this.current && !params.isHistory && this.call('updateMaxStep', params.step)) {
            this.current.isHistory = true;
            params.last = this.current;
            this.call('clear', this.current);
            this.call('drawStone', this.current);
        }
        this.current = params;

        this.stones[`${params.x}:${params.y}`] = params;
    },
    drawStone: function (params) {
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

        if (params.isHistory == undefined) {
            params.isHistory = false;
        }
    
        let show = false;
        if (!params.isHistory) {
            ctx.fillStyle = 'red';
            show = true;
        } else {
            ctx.fillStyle = params.isBlack ? '#fff' : '#000';
            show = this.showStep;
        }       
        if (show) {
            ctx.font = `${parseInt(dimension.padding / 2) - 1}px bolder Kaiti`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${params.step}`, loc.x, loc.y + 1, dimension.padding - 2);
        }
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
        this.call('clear', params);
        const tag = `${params.x}:${params.y}`;
        if (this.stones[tag]) {
            if (this.stones[tag].last && this.call('updateMaxStep', params.step)) {
                this.current = this.stones[tag].last;
                this.current.isHistory = false;
                this.call('clear', this.current);
                this.call('drawStone', this.current);
                this.maxStep--;
            }
            delete this.stones[tag];
        }
        this.branchMarks[tag] && delete this.branchMarks[tag];
    },
    clear: function (params) {
        const ctx       = this.canvas.getContext('2d');
        const dimension = this.workspace.dimension;
        const nodes     = this.workspace.nodes;

        const loc = nodes.get(params.x, params.y);
        const r = dimension.padding / 2;
        ctx.clearRect(loc.x - r, loc.y - r, dimension.padding, dimension.padding);
    },
    showStepView: function (flag) {
        if (flag != this.showStep) {
            this.showStep = flag;
            this.call('resize');
        }
    },
    updateMaxStep: function (step) {
        if (this.maxStep < step) {
            this.maxStep = step;
            return true;
        } else {
            return false;
        }
    }
}
