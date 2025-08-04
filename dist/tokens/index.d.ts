import { TiktokenModel } from '@dqbd/tiktoken';
export declare const tokenCountMap: Record<string, number>;
export declare class TokenHandler {
    private originTokenCount;
    private availableTokenCount;
    private modelName;
    constructor(modelName: TiktokenModel);
    countTokensByModel(text: string, replyTokenCount?: number): number[];
}
