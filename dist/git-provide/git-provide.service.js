"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitProvideService = void 0;
class GitProvideService {
    userName;
    commitMessage;
    sourceBranch;
    targetBranch;
    projectName;
    projectId;
    mrId;
    baseUrl;
    gitlabToken;
    mrUrl;
    webUrl;
    changes = [];
    diffRefs;
    originDiffTokenCount = 0;
    gitlabHeaders;
    constructor(mrRequestBody, config) {
        this.userName = mrRequestBody.user.username;
        this.mrUrl = mrRequestBody.object_attributes.url;
        this.commitMessage = mrRequestBody.object_attributes.title;
        this.sourceBranch = mrRequestBody.object_attributes.source_branch;
        this.targetBranch = mrRequestBody.object_attributes.target_branch;
        this.projectName = mrRequestBody.project.name;
        this.projectId = mrRequestBody.project.id;
        this.mrId = mrRequestBody.object_attributes.iid;
        this.baseUrl = config.baseUrl;
        this.gitlabToken = config.gitlabToken;
        this.webUrl = mrRequestBody.project.web_url;
        this.gitlabHeaders = {
            "PRIVATE-TOKEN": this.gitlabToken,
            "Content-Type": "application/json",
        };
    }
    getMrInfo() {
        return {
            userName: this.userName,
            commitMessage: this.commitMessage,
            sourceBranch: this.sourceBranch,
            targetBranch: this.targetBranch,
            projectName: this.projectName,
            projectId: this.projectId,
            mrId: this.mrId,
            mrUrl: this.mrUrl,
            webUrl: this.webUrl,
        };
    }
    async getFullDiff() {
        await this.gitDiffFiles();
        this.filterNoCodeFile();
        return this.changes;
    }
    async gitDiffFiles() {
        const { baseUrl, projectId, mrId, gitlabHeaders } = this;
        const url = `${baseUrl}/api/v4/projects/${encodeURIComponent(projectId)}/merge_requests/${mrId}/changes`;
        const res = await fetch(url, {
            headers: gitlabHeaders,
        });
        if (!res.ok) {
            const errorText = await res.text();
            console.error("API错误响应:", errorText);
            throw new Error(`获取MR变更文件失败: ${res.status} ${res.statusText}`);
        }
        const resJson = (await res.json());
        this.changes = resJson.changes;
        this.diffRefs = resJson.diff_refs;
        return resJson;
    }
    filterNoCodeFile() {
        const codeFileSuffix = ["ts", "tsx", "js", "jsx", "vue", "py"];
        this.changes = this.changes.filter((change) => {
            const newFileSuffix = change.new_path.split(".").pop() || "";
            return codeFileSuffix.includes(newFileSuffix);
        });
    }
    async getFileContent(targetFilePath, branch) {
        const { baseUrl, projectId, gitlabToken } = this;
        try {
            const encodedFilePath = encodeURIComponent(targetFilePath).replace(/\./g, "%2E");
            const url = `${baseUrl}/api/v4/projects/${encodeURIComponent(projectId)}/repository/files/${encodedFilePath}/raw?ref=${encodeURIComponent(branch)}`;
            const res = await fetch(url, {
                headers: {
                    "PRIVATE-TOKEN": gitlabToken,
                },
            });
            if (!res.ok) {
                const errorText = await res.text();
                console.error(`获取文件内容失败: ${res.status} ${res.statusText} - 文件: ${targetFilePath}, 分支: ${branch}, error: ${errorText}`);
                return "";
            }
            const fileContent = await res.text();
            return fileContent;
        }
        catch (error) {
            console.error(`获取文件内容失败: ${targetFilePath}, 分支: ${branch}, error: ${error}`);
            return "";
        }
    }
    async publishCommentToLine(newPath, oldPath, endLine, issueContent, type) {
        const { baseUrl, projectId, mrId, gitlabHeaders, diffRefs } = this;
        const url = `${baseUrl}/api/v4/projects/${projectId}/merge_requests/${mrId}/discussions`;
        const position = {
            position_type: "text",
            base_sha: diffRefs.base_sha,
            head_sha: diffRefs.head_sha,
            start_sha: diffRefs.start_sha,
            new_path: newPath,
            old_path: oldPath,
            new_line: type === "new" ? endLine : undefined,
            old_line: type === "old" ? endLine : undefined,
        };
        const response = await fetch(url, {
            method: "POST",
            headers: gitlabHeaders,
            body: JSON.stringify({
                body: issueContent,
                position,
            }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`发送行级评论失败 (${response.status}):`, errorText, newPath, oldPath, endLine);
            return "";
        }
        const result = (await response.json());
        console.log(`行级评论发送成功 - 文件: ${newPath}, 行号: ${endLine}, 评论ID: ${result.id}`);
        return result;
    }
    async publishGeneralComment(issueContent) {
        const { baseUrl, projectId, mrId, gitlabHeaders } = this;
        const url = `${baseUrl}/api/v4/projects/${projectId}/merge_requests/${mrId}/notes`;
        const response = await fetch(url, {
            method: "POST",
            headers: gitlabHeaders,
            body: JSON.stringify({
                body: issueContent,
            }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`发送通用评论失败 (${response.status}):`, errorText);
            return "";
        }
        const result = (await response.json());
        console.log(`完善报告发送成功 - 评论ID: ${result.id}`);
        return result.id;
    }
}
exports.GitProvideService = GitProvideService;
//# sourceMappingURL=git-provide.service.js.map