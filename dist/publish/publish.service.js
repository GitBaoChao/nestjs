"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishService = void 0;
const common_1 = require("@nestjs/common");
const issueCommentMarkdownTemplate = "<table><thead><tr><td><strong>问题</strong></td><td><strong>描述</strong></td></tr></thead><tbody><tr><td>__issue_header__</td><td>__issue_content__</td></tr></tbody></table>";
const issueReportMarkdownTemplate = "<tr>\n  <td>__issue_header__</td>\n  <td>__issue_code_url__</td>\n  <td>__issue_content__</td>\n</tr>";
let PublishService = class PublishService {
    async publish(mode, reviews, gitProvider, extendedDiffFiles, callback) {
        if (mode === "comment") {
            reviews.forEach((review) => {
                const { newPath, oldPath, type, endLine, issueContent, issueHeader } = review;
                const issueContentMarkdown = issueCommentMarkdownTemplate
                    .replace("__issue_header__", issueHeader)
                    .replace("__issue_content__", issueContent);
                gitProvider.publishCommentToLine(newPath, oldPath, endLine, issueContentMarkdown, type);
            });
            callback?.("");
        }
        else {
            const { webUrl, sourceBranch, targetBranch } = gitProvider.getMrInfo();
            let issueContentMarkdown = "";
            reviews.forEach((review) => {
                const { newPath, oldPath, type, startLine, endLine, issueContent, issueHeader, } = review;
                const extendedDiffFile = extendedDiffFiles.find((item) => item.new_path === newPath);
                const diffCode = this.getDiffCode(extendedDiffFile, type, startLine, endLine);
                issueContentMarkdown +=
                    issueReportMarkdownTemplate
                        .replace("__issue_header__", issueHeader)
                        .replace("__issue_code_url__", type === "new"
                        ? `[在 ${newPath} 中的第${startLine}到${endLine}行](${webUrl}/-/blob/${sourceBranch}/${newPath}?ref_type=heads#L${startLine}-${endLine})\n<details><summary>diff</summary>\n\n\`\`\`diff\n${diffCode}\n\`\`\`\n\n</details>`
                        : `[在 ${oldPath} 中的第${startLine}到${endLine}行](${webUrl}/-/blob/${targetBranch}/${oldPath}?ref_type=heads#L${startLine}-${endLine})\n<details><summary>diff</summary>\n\n\`\`\`diff\n${diffCode}\n\`\`\`\n\n</details>`)
                        .replace("__issue_content__", issueContent) + "\n";
            });
            const id = await gitProvider.publishGeneralComment(`## 问题清单\n<table>\n  <thead><tr><td><strong>问题</strong></td><td><strong>代码位置</strong></td><td><strong>描述</strong></td></tr></thead>\n  <tbody>\n${issueContentMarkdown}\n</tbody>\n</table>`);
            callback?.(id);
        }
    }
    getDiffCode(extendedDiffFile, type, startLine, endLine) {
        let diffCode = "";
        if (extendedDiffFile) {
            const { newLinesWithNumber, oldLinesWithNumber } = extendedDiffFile;
            const linesWithNumber = type === "new" ? newLinesWithNumber : oldLinesWithNumber;
            const extendedStartLineNumber = startLine - 3;
            const extendedEndLineNumber = endLine + 3;
            const linesNumber = extendedEndLineNumber - extendedStartLineNumber;
            for (let i = 0; i <= linesNumber; i++) {
                const lineNumber = extendedStartLineNumber + i;
                const line = linesWithNumber.get(lineNumber);
                if (line) {
                    diffCode += line + "\n";
                }
            }
        }
        return diffCode;
    }
    publishNotification(publishParams, content) {
        const { pushUrl, userName, projectName, sourceBranch, targetBranch } = publishParams;
        if (!pushUrl) {
            return;
        }
        fetch(pushUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                msgtype: "markdown",
                markdown: {
                    content: `**${userName}** 在项目 **${projectName}** 发起了合并请求\n源分支：**${sourceBranch}**\n目标分支：**${targetBranch}**\n\n` +
                        content,
                },
            }),
        });
    }
};
exports.PublishService = PublishService;
exports.PublishService = PublishService = __decorate([
    (0, common_1.Injectable)()
], PublishService);
//# sourceMappingURL=publish.service.js.map