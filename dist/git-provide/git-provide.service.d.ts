import { Config, MrRequestBody } from "./types/git-provide";
import { Change, GitlabChangesRes } from "./types/gitlab-api";
export declare const baseUrl = "http://git.innodealing.cn";
export declare class GitProvideService {
    private userName;
    private commitMessage;
    private sourceBranch;
    private targetBranch;
    private projectName;
    private projectId;
    private mrId;
    private baseUrl;
    private gitlabToken;
    private mrUrl;
    private webUrl;
    private changes;
    private diffRefs;
    private originDiffTokenCount;
    private gitlabHeaders;
    constructor(mrRequestBody: MrRequestBody, config: Config);
    getMrInfo(): {
        userName: string;
        commitMessage: string;
        sourceBranch: string;
        targetBranch: string;
        projectName: string;
        projectId: number;
        mrId: number;
        mrUrl: string;
        webUrl: string;
    };
    getFullDiff(): Promise<Change[]>;
    gitDiffFiles(): Promise<GitlabChangesRes>;
    filterNoCodeFile(): void;
    getFileContent(targetFilePath: string, branch: string): Promise<string>;
    publishCommentToLine(newPath: string, oldPath: string, endLine: number, issueContent: string, type: "new" | "old"): Promise<"" | {
        id: string;
    }>;
    publishGeneralComment(issueContent: string): Promise<string>;
}
