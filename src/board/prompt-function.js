module.exports = {
    build: function () {
        this.confirmParams = null;
    },
    resize: function () {
        if (this.confirmParams) {
            this.call('confirmView', this.confirmParams);
        }
    },
    put: function (params) {
        switch (params.select) {
            case 'w':
                this.call('stone', params);
                break;
            case 'b':
                this.call('stone', params);
                break;
            default:
                this.call('mark', params);
                break;
        }   
    },
    stone: function (params) {
        const ctx       = this.canvas.getContext('2d');
        const dimension = this.workspace.dimension;
        const nodes     = this.workspace.nodes;
        const loc = nodes.get(params.x, params.y);

        ctx.fillStyle = params.select == 'b' ? '#00000055' : '#ffffffdd';
        ctx.strokeStyle = this.config.lineColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(loc.x, loc.y, dimension.padding / 2 - 1, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    },
    mark: function (params) {
        const markCtx   = this.canvas.getContext('2d');
        const dimension = this.workspace.dimension;
        const nodes     = this.workspace.nodes;
        const loc = nodes.get(params.x, params.y);

        let markSize = dimension.padding / 5;
        markCtx.fillStyle = '#ffffffdd';
        markCtx.strokeStyle = this.config.markColor;
        markCtx.lineWidth = 1;
        markCtx.beginPath();
        if (params.select == 'CR') {
            markCtx.arc(loc.x, loc.y, markSize, 0, 2 * Math.PI);
        } else if (params.select == 'TR') {
            markSize = dimension.padding / 4;
            const ySize = markSize / 2;
            const xSize = markSize * Math.sqrt(3) / 2 
            markCtx.moveTo(loc.x - xSize, loc.y + ySize);
            markCtx.lineTo(loc.x, loc.y - markSize);
            markCtx.lineTo(loc.x + xSize, loc.y + ySize);
        } else if (params.select == 'SQ') {
            markCtx.rect(
                loc.x - markSize, loc.y - markSize,
                markSize * 2, markSize * 2);
        } else if (params.select == 'MA') {
            const ySize = markSize;
            markCtx.lineWidth = 2;
            markCtx.moveTo(loc.x - ySize, loc.y - ySize);
            markCtx.lineTo(loc.x + ySize, loc.y + ySize);
            markCtx.moveTo(loc.x + ySize, loc.y - ySize);
            markCtx.lineTo(loc.x - ySize, loc.y + ySize);
        } else if (/^LB[A-Z]?$/.test(params.select)) {
            markCtx.font = `${parseInt(dimension.padding * 2 / 3) - 1}px bold Apercu`;
            markCtx.textAlign = 'center';
            markCtx.textBaseline = 'middle';
            markCtx.fillText(params.select.length == 3 ? params.select[2] : 'A', loc.x, loc.y, dimension.padding - 2);
        }
        markCtx.closePath(); 
        markCtx.fill();
        markCtx.stroke();
    },
    delete: function (params) {
        const ctx       = this.canvas.getContext('2d');
        const dimension = this.workspace.dimension;
        const nodes     = this.workspace.nodes;

        const loc = nodes.get(params.x, params.y);
        const r = dimension.padding / 2;
        ctx.clearRect(loc.x - r, loc.y - r, dimension.padding, dimension.padding);
    },
    show: function (flag) {
        if (flag) {
            this.canvas.style.display = '';
        } else {
            this.canvas.style.display = 'none';
        }
    },
    confirmView: function (params) {
        this.call('clearConfirmView');  
        this.call('stone', params);
        this.confirmParams = params;
    },
    clearConfirmView: function () {
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.confirmParams = null;
    }
}
