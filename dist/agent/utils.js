"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixYamlFormatIssues = fixYamlFormatIssues;
exports.extractFirstYamlFromMarkdown = extractFirstYamlFromMarkdown;
const yaml = require("js-yaml");
function fixYamlFormatIssues(yamlContent) {
    const lines = yamlContent.split("\n");
    const fixedLines = [];
    let inReviewItem = false;
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        if (line.trim().startsWith("- newPath:") ||
            line.trim().startsWith("-newPath:")) {
            inReviewItem = true;
            line = "  - newPath: |";
        }
        else if (inReviewItem) {
            const trimmedLine = line.trim();
            if (trimmedLine.includes(":")) {
                const colonIndex = trimmedLine.indexOf(":");
                const fieldName = trimmedLine.substring(0, colonIndex).trim();
                const fieldValue = trimmedLine.substring(colonIndex + 1).trim();
                const validFields = [
                    "newPath",
                    "oldPath",
                    "startLine",
                    "endLine",
                    "type",
                    "issueHeader",
                    "issueContent",
                ];
                if (validFields.includes(fieldName)) {
                    if ([
                        "newPath",
                        "oldPath",
                        "type",
                        "issueHeader",
                        "issueContent",
                    ].includes(fieldName)) {
                        line = `    ${fieldName}: |`;
                    }
                    else {
                        line = `    ${fieldName}: ${fieldValue}`;
                    }
                }
                else {
                    line = `    ${trimmedLine}`;
                }
            }
            else if (trimmedLine.length > 0) {
                line = `      ${trimmedLine}`;
            }
            if (i + 1 < lines.length) {
                const nextLine = lines[i + 1].trim();
                if (nextLine.startsWith("- newPath:") ||
                    nextLine.startsWith("-newPath:")) {
                    inReviewItem = false;
                }
            }
        }
        fixedLines.push(line);
    }
    return fixedLines.join("\n");
}
function extractFirstYamlFromMarkdown(markdownText, isParse = true) {
    const regex = /```yaml\s*([\s\S]*?)\s*```/;
    const match = regex.exec(markdownText);
    if (!match) {
        return null;
    }
    const yamlContent = match[1];
    const result = {
        content: yamlContent,
        fixedContent: null,
        parsed: null,
        error: null,
        fixApplied: false,
    };
    if (isParse) {
        try {
            const mrReview = yaml.load(yamlContent);
            if (mrReview && mrReview.reviews && Array.isArray(mrReview.reviews)) {
                mrReview.reviews.forEach((review) => {
                    review.newPath = review.newPath?.replace(/\n/g, "") || "";
                    review.oldPath = review.oldPath?.replace(/\n/g, "") || "";
                    review.type =
                        review.type?.replace(/\n/g, "") || "new";
                });
                result.parsed = mrReview;
            }
        }
        catch {
            console.log("直接解析失败，尝试修复格式...");
            try {
                const fixedYamlContent = fixYamlFormatIssues(yamlContent);
                result.fixedContent = fixedYamlContent;
                result.fixApplied = true;
                const mrReview = yaml.load(fixedYamlContent);
                if (mrReview && mrReview.reviews && Array.isArray(mrReview.reviews)) {
                    mrReview.reviews.forEach((review) => {
                        review.newPath = review.newPath?.replace(/\n/g, "") || "";
                        review.oldPath = review.oldPath?.replace(/\n/g, "") || "";
                        review.type =
                            review.type?.replace(/\n/g, "") || "new";
                    });
                    result.parsed = mrReview;
                }
                console.log("格式修复成功，解析完成");
            }
            catch (fixError) {
                result.error =
                    fixError instanceof Error ? fixError : new Error(String(fixError));
                console.log("格式修复后仍然解析失败:", result.error.message);
            }
        }
    }
    return result;
}
//# sourceMappingURL=utils.js.map