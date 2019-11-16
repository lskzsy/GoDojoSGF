const SGFConvertor = function () {
    this.symbolMap = null;
}

SGFConvertor.prototype.do = function (sgfData) {
    const rawData = sgfData.replace(/\n/g, '');
    const answer = {};
    if (rawData[0] == '(') {
        this.symbolMap = this._scan(rawData);
        if (this.symbolMap) {
            const raws = this._parse(rawData, 0, this.symbolMap[0]);
            answer.root = this._parseRoot(raws[0]);
            answer.data = this._convert(raws.slice(1));
            return answer;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

SGFConvertor.prototype._scan = function (rawData) {
    const symbolMap = {};
    const stack = [];
    let deep = 0;
    for (let i = 0; i < rawData.length; i++) {
        switch (rawData[i]) {
            case '(':
                stack[deep++] = i;
                break;
            case ')':
                symbolMap[stack[--deep]] = i;
                break;
        }
    }

    if (deep) {
        return null;
    } else {
        return symbolMap;
    }
}

SGFConvertor.prototype._convert = function (raws) {
    const answer = [];
    const a = 'a'.charCodeAt();
    for (let i = 0; i < raws.length; i++) {
        if (typeof(raws[i]) == 'object') {
            answer.push(this._convert(raws[i]));
        } else {
            const match = /^(W|B)\[(\w)(\w)\](.*?)$/.exec($.trim(raws[i]));
            if (match) {
                const stone = {
                    color: match[1].toLocaleLowerCase(),
                    x: match[2].charCodeAt() - a,
                    y: match[3].charCodeAt() - a,
                    marks: null
                };       
                if (match[4].length > 0) {
                    stone.marks = [];
                    const ms = match[4].match(/(TR|SQ|MA|CR)(\[\w\w\])+/g);
                    ms.forEach(mark => {
                        const mM = /^(TR|SQ|MA|CR)(.*?)$/.exec(mark);
                        if (mM) {
                            const ms = mM[2].match(/\[\w\w\]/g);
                            ms.forEach(m => stone.marks.push({
                                type: mM[1],
                                x: m[1].charCodeAt() - a,
                                y: m[2].charCodeAt() - a,
                            }));
                        }
                    });
                    const lbM = /LB((\[\w\w:[A-Z]\])+)/.exec(match[4]);
                    if (lbM) {
                        const lbs = lbM[1].match(/\[\w\w:[A-Z]\]/g);
                        lbs.forEach(lb => stone.marks.push({
                            type: 'LB',
                            x: lb[1].charCodeAt() - a,
                            y: lb[2].charCodeAt() - a,
                            d: lb[4]
                        }));
                    }
                }
                answer.push(stone);
            }
        }
    }
    return answer;
}

SGFConvertor.prototype._parse = function (rawData, start, end) { 
    const answer = [];
    let i = start + 1;
    let branch = rawData.indexOf('(', i);
    if (branch > end || branch == -1) {
        branch = end;
    }
    const steps = rawData.substring(i, branch).split(';');
    steps.forEach(step => {
        if (step.length > 0) {
            answer.push(step);
        }
    });

    /**
        届かない恋をしていても 映しだす日がくるかな
     */
    i = branch;
    while (i < end && i != -1) {
        let j = this.symbolMap[i];
        answer.push(this._parse(rawData, i, j));
        i = rawData.indexOf('(', j);
    }
    return answer;
}

SGFConvertor.prototype._parseRoot = function (rootData) {
    const answer = {};
    if (AP = /AP\[(.*?)\]/.exec(rootData)) {
        answer.application = AP[1];
    }
    if (CA = /CA\[(.*?)\]/.exec(rootData)) {
        answer.encoding = CA[1];
    }
    if (GM = /GM\[(\d+)\]/.exec(rootData)) {
        answer.gameMode =  parseInt(GM[1]);
    }
    if (FF = /FF\[([1-4])\]/.exec(rootData)) {
        answer.fileFormat =  parseInt(FF[1]);
    }
    if (SZ = /SZ\[(\d+|\d+:\d+)\]/.exec(rootData)) {
        answer.boardSize = SZ[1];
        answer.width = 0;
        answer.height = 0;
        if (answer.boardSize.indexOf(':') > -1) {
            const split = answer.boardSize.split(':');
            answer.width = split[0];
            answer.height = split[1];
        } else {
            answer.width = answer.height = parseInt(answer.boardSize);
        }
    }
    return answer;
}

module.exports = SGFConvertor;
