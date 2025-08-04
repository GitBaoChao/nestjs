import { GitProvideService } from 'src/git-provide/git-provide.service';
import { Change } from '../git-provide/types/gitlab-api';
import { comptuedHunkLineNumer, splitHunk } from './utils';

/**
 * 处理 diff 内容
 */
export class PatchHandler {
  private extendedDiffFiles: Change[];
  constructor(diffFiles: Change[]) {
    this.extendedDiffFiles = diffFiles.filter((diffFile) => diffFile.diff);
  }

  getExtendedDiffContent(gitProvider: GitProvideService) {
    // TODO: 扩展 context
    this.extendedLines();
    // 扩展行号
    this.addLineNumber();

    const { commitMessage } = gitProvider.getMrInfo();

    let extendedDiff = `commit message: ${commitMessage}\n\n`;

    extendedDiff += this.extendedDiffFiles.reduce((pre, cur) => {
      return pre + `## new_path: ${cur.new_path}\n` + `## old_path: ${cur.old_path}\n` + cur.extendedDiff + '\n\n';
    }, '');

    return extendedDiff;
  }

  extendedLines() {}

  /**
   * diff 内容添加真实的行号diffs
   */
  addLineNumber() {
    this.extendedDiffFiles.forEach((diffFile) => {
      let newDiff = '';
      const oldLinesWithNumber: Map<number, string> = new Map();
      const newLinesWithNumber: Map<number, string> = new Map();
      const hunks = splitHunk(diffFile.diff);
      hunks.forEach((hunk) => {
        const [newHunkLines, newHunkLinesWithNumber, oldHunkLinesWithNumber] = comptuedHunkLineNumer(hunk);
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
