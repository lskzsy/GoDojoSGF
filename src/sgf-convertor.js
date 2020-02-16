const SGFStep = require('./sgf-step');

const SGFConvertor = function () {
    this.symbolMap = null;
    this.step = 0;
}

SGFConvertor.prototype.do = function (sgfData) {
    const rawData = sgfData;
    const answer = {};
    if (rawData[0] == '(') {
        this.symbolMap  = this._scan(rawData);
        this.step       = 0;
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

SGFConvertor.prototype.to = function (runtime) {
    const data = this._toString(runtime.branch.data);
    return `(;CA[${runtime.properties.encoding}]SZ[${runtime.properties.boardSize}]AP[${runtime.properties.application}]${data})`;
}

SGFConvertor.prototype._toString = function (raw) {
    const a = 'a'.charCodeAt();
    let data = '';
    raw.forEach(step => {
        if (step instanceof Array) {
            data += `(${this._toString(step)})`;
        } else {
            const stone = step.stone;
            data += `;${stone.color.toUpperCase()}[${String.fromCharCode(a + stone.x)}${String.fromCharCode(a + stone.y)}]`;
            if (step.marks && step.marks.length > 0) {
                const markSet = {};
                step.marks.forEach(mark => {
                    if (!markSet[mark.type]) {
                        markSet[mark.type] = [];
                    }
                    markSet[mark.type].push(mark);
                });
                for (let k in markSet) {
                    const v = markSet[k];
                    data += k;
                    v.forEach(vv => {
                        if (vv.type == 'LB') {
                            data += `[${String.fromCharCode(a + vv.x)}${String.fromCharCode(a + vv.y)}:${vv.d}]`;
                        } else {
                            data += `[${String.fromCharCode(a + vv.x)}${String.fromCharCode(a + vv.y)}]`;
                        }
                    });
                }
            }  
            if (step.comment) {
                data += `C[${step.comment}]`;
            }
        }
    });
    return data;
}

SGFConvertor.prototype._scan = function (rawData) {
    const symbolMap = {};
    const stack = [];
    let deep = 0;
    let isContent = false;
    for (let i = 0; i < rawData.length; i++) {
        switch (rawData[i]) {
            case '[':
                isContent = true;
                break;
            case ']':
                if (i - 1 >= 0 && rawData[i - 1] != '\\') {
                    isContent = false;   
                }
                break;
            case '(':
                if (!isContent) {
                    stack[deep++] = i;
                }
                break;
            case ')':
                if (!isContent) {
                    symbolMap[stack[--deep]] = i;
                }
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
    let current = 0;
    for (let i = 0; i < raws.length; i++) {
        if (typeof(raws[i]) == 'object') {
            answer.push(this._convert(raws[i]));
        } else {
            const match = /^(W|B)\[(\w)(\w)\](.*?)$/s.exec($.trim(raws[i]));
            if (match) {
                this.step++;
                current++;
                const step = new SGFStep(
                    match[2].charCodeAt() - a,
                    match[3].charCodeAt() - a,
                    match[1].toLocaleLowerCase(),
                    this.step
                );
                if (match[4].length > 0) {
                    window.TEST = match[4];
                    const ms = match[4].match(/(TR|SQ|MA|CR|C)(\[(.*?)[^\\]\])+/sg);
                    ms && ms.forEach(mark => {
                        const mM = /^(TR|SQ|MA|CR|C)(.*?)$/s.exec(mark);
                        if (mM) {
                            if (mM[1] == 'C') {
                                step.addComment(mM[2].substr(1, mM[2].length - 2));
                            } else {
                                const ms = mM[2].match(/\[\w\w\]/g);
                                ms.forEach(m => step.addMark({
                                    type: mM[1],
                                    x: m[1].charCodeAt() - a,
                                    y: m[2].charCodeAt() - a,
                                }));
                            }
                        }
                    });
                    const lbM = /LB((\[\w\w:[A-Z]\])+)/.exec(match[4]);
                    if (lbM) {
                        const lbs = lbM[1].match(/\[\w\w:[A-Z]\]/g);
                        lbs.forEach(lb => step.addMark({
                            type: 'LB',
                            x: lb[1].charCodeAt() - a,
                            y: lb[2].charCodeAt() - a,
                            d: lb[4]
                        }));
                    }
                }
                answer.push(step);
            }
        }
    }
    this.step -= current;
    return answer;
}

SGFConvertor.prototype._parse = function (rawData, start, end) { 
    const answer = [];
    let i = start + 1;
    let k = i;
    let branch = -1;
    window.TEST = rawData;
    do {
        branch = rawData.indexOf('(', k);
        if (branch > end || branch == -1) {
            branch = end;
            break;
        }
        k = branch + 1;
    } while (!this.symbolMap[branch]);

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
        if (j) {
            answer.push(this._parse(rawData, i, j));
            i = rawData.indexOf('(', j);
        }
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
