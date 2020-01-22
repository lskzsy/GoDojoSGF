module.exports = {
    build: function () {
        this.call('paint');
    },
    resize: function () {
        this.call('paint');
    },
    paint: function () {
        const ctx       = this.canvas.getContext('2d');
        const dimension = this.workspace.dimension;
        const nodes     = this.workspace.nodes;

        /** clear all */
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        /** draw background */
        ctx.beginPath();
        ctx.fillStyle = this.config.background;
        ctx.rect(dimension.baseStart, dimension.baseStart, dimension.baseWidth, dimension.baseHeight);
        ctx.fill();
        ctx.closePath();

        /** draw base line */
        ctx.strokeStyle = this.config.lineColor;
        for (let i = 0, 
                x = dimension.margin + dimension.baseStart, 
                y = dimension.margin + dimension.baseStart; 
                i < dimension.y; i++) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + dimension.boardHeight);
            ctx.closePath();
            ctx.stroke();
            x += dimension.padding + 1;
        }
        for (let i = 0, 
                x = dimension.margin + dimension.baseStart, 
                y = dimension.margin + dimension.baseStart; 
                i < dimension.x; i++) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + dimension.boardWidth, y);
            ctx.closePath();
            ctx.stroke();
            y += dimension.padding + 1;
        }

        /** draw star */
        ctx.fillStyle = this.config.lineColor;
        const _drawStar = function (loc) {
            ctx.beginPath();
            ctx.arc(loc.x, loc.y, 3.5, 0, 2 * Math.PI);
            ctx.closePath();
            ctx.fill();
        }

        let orientation = []
        let portrait = [];
        if (dimension.x > 6 && dimension.x < 10) {
            orientation = [2, dimension.x - 3];
        } else if ((dimension.x > 9 && dimension.x < 15) || !(dimension.x % 2)) {
            orientation = [3, dimension.x - 4];
        } else if (dimension.x > 14) {
            orientation = [3, parseInt(dimension.x / 2), dimension.x - 4];
        }
        if (dimension.y > 6 && dimension.y < 10) {
            portrait = [2, dimension.y - 3];
        } else if ((dimension.y > 9 && dimension.y < 15) || !(dimension.y % 2)) {
            portrait = [3, dimension.y - 4];
        } else if (dimension.y > 14) {
            portrait = [3, parseInt(dimension.y / 2), dimension.y - 4];
        }
        for (let i = 0; i < orientation.length; i++) {
            for (let j = 0; j < portrait.length; j++) {
                _drawStar(nodes.get(orientation[i], portrait[j])); 
            }
        }
        if (dimension.x == 13 && dimension.y == 13) {
            _drawStar(nodes.get(6, 6));   
        }
    },
    coordinate: function () {
        const ctx       = this.canvas.getContext('2d');
        const dimension = this.workspace.dimension;
        const nodes     = this.workspace.nodes;

        ctx.font = `${parseInt(dimension.padding / 2) - 1}px bold Apercu`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 0, c='A'; i < dimension.x; i++) {
            if (c == 'I') {
                i--;
            } else {
                const loc = nodes.get(i, 0);
                ctx.fillText(c, loc.x, dimension.padding * 2 / 3, dimension.padding - 2);
                ctx.fillText(c, loc.x, dimension.height - dimension.padding * 2 / 3, dimension.padding - 2);
            }
            c = String.fromCharCode(c.charCodeAt() + 1);
        }

        for (let i = 0; i < dimension.y; i++) {
            const loc = nodes.get(0, i);
            ctx.fillText(i + 1, dimension.padding * 2 / 3, loc.y,  dimension.padding - 2);
            ctx.fillText(i + 1, dimension.width - dimension.padding * 2 / 3, loc.y, dimension.padding - 2);
        }
    }
}
