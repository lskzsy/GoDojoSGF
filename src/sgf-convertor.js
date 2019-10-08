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
            const match = /(W|B)\[(\w)(\w)\]/.exec(raws[i]);
            if (match) {
                answer.push({
                    color: match[1].toLocaleLowerCase(),
                    x: match[2].charCodeAt() - a,
                    y: match[3].charCodeAt() - a
                });
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
