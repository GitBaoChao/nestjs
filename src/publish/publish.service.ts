import { Injectable } from '@nestjs/common';
import { Review } from '../agent/types';
import { GitProvideService } from '../git-provide/git-provide.service';
import { Change } from '../git-provide/types/gitlab-api';

const issueCommentMarkdownTemplate =
  '<table><thead><tr><td><strong>问题</strong></td><td><strong>描述</strong></td></tr></thead><tbody><tr><td>__issue_header__</td><td>__issue_content__</td></tr></tbody></table>';

const issueReportMarkdownTemplate =
  '<tr>\n  <td>__issue_header__</td>\n  <td>__issue_code_url__</td>\n  <td>__issue_content__</td>\n</tr>';

@Injectable()
export class PublishService {
  async publish(
    mode: 'report' | 'comment',
    reviews: Review[],
    gitProvider: GitProvideService,
    extendedDiffFiles: Change[],
    callback?: (res: string) => void,
  ) {
    if (mode === 'comment') {
      reviews.forEach((review) => {
        const { newPath, oldPath, type, endLine, issueContent, issueHeader } = review;

        const issueContentMarkdown = issueCommentMarkdownTemplate
          .replace('__issue_header__', issueHeader)
          .replace('__issue_content__', issueContent);

        gitProvider.publishCommentToLine(newPath, oldPath, endLine, issueContentMarkdown, type);
      });
      callback?.('');
    } else {
      const { webUrl, sourceBranch, targetBranch } = gitProvider.getMrInfo();
      let issueContentMarkdown = '';
      reviews.forEach((review) => {
        const { newPath, oldPath, type, startLine, endLine, issueContent, issueHeader } = review;
        const extendedDiffFile = extendedDiffFiles.find((item) => item.new_path === newPath);

        const diffCode = this.getDiffCode(extendedDiffFile, type, startLine, endLine);

        issueContentMarkdown +=
          issueReportMarkdownTemplate
            .replace('__issue_header__', issueHeader)
            .replace(
              '__issue_code_url__',
              type === 'new'
                ? `[在 ${newPath} 中的第${startLine}到${endLine}行](${webUrl}/-/blob/${sourceBranch}/${newPath}?ref_type=heads#L${startLine}-${endLine})\n<details><summary>diff</summary>\n\n\`\`\`diff\n${diffCode}\n\`\`\`\n\n</details>`
                : `[在 ${oldPath} 中的第${startLine}到${endLine}行](${webUrl}/-/blob/${targetBranch}/${oldPath}?ref_type=heads#L${startLine}-${endLine})\n<details><summary>diff</summary>\n\n\`\`\`diff\n${diffCode}\n\`\`\`\n\n</details>`,
            )
            .replace('__issue_content__', issueContent) + '\n';
      });
      const id = await gitProvider.publishGeneralComment(
        `## 问题清单\n<table>\n  <thead><tr><td><strong>问题</strong></td><td><strong>代码位置</strong></td><td><strong>描述</strong></td></tr></thead>\n  <tbody>\n${issueContentMarkdown}\n</tbody>\n</table>`,
      );
      callback?.(id);
    }
  }

  getDiffCode(extendedDiffFile: Change | undefined, type: 'new' | 'old', startLine: number, endLine: number) {
    let diffCode = '';

    if (extendedDiffFile) {
      const { newLinesWithNumber, oldLinesWithNumber } = extendedDiffFile;
      const linesWithNumber = type === 'new' ? newLinesWithNumber : oldLinesWithNumber;
      const extendedStartLineNumber = startLine - 3;
      const extendedEndLineNumber = endLine + 3;
      const linesNumber = extendedEndLineNumber - extendedStartLineNumber;

      for (let i = 0; i <= linesNumber; i++) {
        const lineNumber = extendedStartLineNumber + i;
        const line = linesWithNumber.get(lineNumber);
        if (line) {
          diffCode += line + '\n';
        }
      }
    }

    return diffCode;
  }

  // 推送通知
  publishNotification(
    publishParams: {
      pushUrl: string;
      userName: string;
      projectName: string;
      sourceBranch: string;
      targetBranch: string;
    },
    content: string,
  ) {
    const { pushUrl, userName, projectName, sourceBranch, targetBranch } = publishParams;
    if (!pushUrl) {
      return;
    }
    fetch(pushUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        msgtype: 'markdown',
        markdown: {
          content:
            `**${userName}** 在项目 **${projectName}** 发起了合并请求\n源分支：**${sourceBranch}**\n目标分支：**${targetBranch}**\n\n` +
            content,
        },
      }),
    });
  }
}
