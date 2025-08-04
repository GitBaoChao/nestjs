"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatchHandler = void 0;
const utils_1 = require("./utils");
class PatchHandler {
    extendedDiffFiles;
    constructor(diffFiles) {
        this.extendedDiffFiles = diffFiles.filter((diffFile) => diffFile.diff);
    }
    getExtendedDiffContent(gitProvider) {
        this.extendedLines();
        this.addLineNumber();
        const { commitMessage } = gitProvider.getMrInfo();
        let extendedDiff = `commit message: ${commitMessage}\n\n`;
        extendedDiff += this.extendedDiffFiles.reduce((pre, cur) => {
            return pre + `## new_path: ${cur.new_path}\n` + `## old_path: ${cur.old_path}\n` + cur.extendedDiff + '\n\n';
        }, '');
        return extendedDiff;
    }
    extendedLines() { }
    addLineNumber() {
        this.extendedDiffFiles.forEach((diffFile) => {
            let newDiff = '';
            const oldLinesWithNumber = new Map();
            const newLinesWithNumber = new Map();
            const hunks = (0, utils_1.splitHunk)(diffFile.diff);
            hunks.forEach((hunk) => {
                const [newHunkLines, newHunkLinesWithNumber, oldHunkLinesWithNumber] = (0, utils_1.comptuedHunkLineNumer)(hunk);
                newDiff += newHunkLines.join('\n');
                newHunkLinesWithNumber.forEach((line, lineNumber) => {
                    newLinesWithNumber.set(lineNumber, line);
                });
                oldHunkLinesWithNumber.forEach((line, lineNumber) => {
                    oldLinesWithNumber.set(lineNumber, line);
                });
            });
            diffFile.extendedDiff = newDiff;
            diffFile.newLinesWithNumber = newLinesWithNumber;
            diffFile.oldLinesWithNumber = oldLinesWithNumber;
        });
    }
    getExtendedDiffFiles() {
        return this.extendedDiffFiles;
    }
}
exports.PatchHandler = PatchHandler;
//# sourceMappingURL=patch.service.js.map