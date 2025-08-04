import { Review } from '../agent/types';
import { GitProvideService } from '../git-provide/git-provide.service';
import { Change } from '../git-provide/types/gitlab-api';
export declare class PublishService {
    publish(mode: 'report' | 'comment', reviews: Review[], gitProvider: GitProvideService, extendedDiffFiles: Change[], callback?: (res: string) => void): Promise<void>;
    getDiffCode(extendedDiffFile: Change | undefined, type: 'new' | 'old', startLine: number, endLine: number): string;
    publishNotification(publishParams: {
        pushUrl: string;
        userName: string;
        projectName: string;
        sourceBranch: string;
        targetBranch: string;
    }, content: string): void;
}
