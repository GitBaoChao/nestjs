import { GitProvideService } from 'src/git-provide/git-provide.service';
import { Change } from '../git-provide/types/gitlab-api';
export declare class PatchHandler {
    private extendedDiffFiles;
    constructor(diffFiles: Change[]);
    getExtendedDiffContent(gitProvider: GitProvideService): string;
    extendedLines(): void;
    addLineNumber(): void;
    getExtendedDiffFiles(): Change[];
}
