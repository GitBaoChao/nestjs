"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comptuedHunkLineNumer = exports.splitHunk = void 0;
const splitHunk = (diff) => {
    const lines = diff.split('\n');
    const hunks = [];
    let curentHunk = {
        oldStart: 0,
        newStart: 0,
        hunkLines: [],
    };
    lines.forEach((line) => {
        if (line.startsWith('@@')) {
            const match = line.match(/@@ -(\d+),?(\d+)? \+(\d+),?(\d+)? @@/);
            if (curentHunk.hunkLines.length) {
                hunks.push(curentHunk);
                curentHunk = {
                    oldStart: 0,
                    newStart: 0,
                    hunkLines: [],
                };
            }
            if (match) {
                curentHunk.oldStart = parseInt(match[1], 10);
                curentHunk.newStart = parseInt(match[3], 10);
            }
        }
        curentHunk.hunkLines.push(line);
    });
    if (curentHunk.hunkLines.length) {
        hunks.push(curentHunk);
    }
    return hunks;
};
exports.splitHunk = splitHunk;
const comptuedHunkLineNumer = (hunk) => {
    const { oldStart, newStart } = hunk;
    const temp = [];
    const newHunkLines = [hunk.hunkLines[0]];
    let maxHaedLength = 0;
    const oldLines = new Map();
    const newLines = new Map();
    let oldLineNumber = oldStart;
    let newLineNumber = newStart;
    hunk.hunkLines.slice(1).forEach((line) => {
        let head = '';
        if (line.startsWith('-')) {
            head = `(${oldLineNumber}, )`;
            temp.push([head, line]);
            oldLines.set(oldLineNumber, line);
            oldLineNumber++;
            maxHaedLength = Math.max(maxHaedLength, head.length);
        }
        else if (line.startsWith('+')) {
            head = `( , ${newLineNumber})`;
            temp.push([head, line]);
            newLines.set(newLineNumber, line);
            newLineNumber++;
            maxHaedLength = Math.max(maxHaedLength, head.length);
        }
        else {
            head = `(${oldLineNumber}, ${newLineNumber})`;
            temp.push([head, line]);
            oldLines.set(oldLineNumber, line);
            newLines.set(newLineNumber, line);
            oldLineNumber++;
            newLineNumber++;
            maxHaedLength = Math.max(maxHaedLength, head.length);
        }
        if (head.length > maxHaedLength) {
            maxHaedLength = head.length;
        }
    });
    temp.forEach(([head, line]) => {
        newHunkLines.push(`${head.padEnd(maxHaedLength)} ${line}`);
    });
    return [newHunkLines, newLines, oldLines];
};
exports.comptuedHunkLineNumer = comptuedHunkLineNumer;
//# sourceMappingURL=utils.js.map