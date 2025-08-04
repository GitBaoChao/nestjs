import { encoding_for_model, TiktokenModel } from '@dqbd/tiktoken';

export const tokenCountMap: Record<string, number> = {
  gpt2: 64 * 1000,
};

export class TokenHandler {
  private originTokenCount = 0;
  private availableTokenCount = 0;
  private modelName: TiktokenModel;

  constructor(modelName: TiktokenModel) {
    this.modelName = modelName;
    this.availableTokenCount = tokenCountMap[modelName] || 0;
  }

  countTokensByModel(text: string, replyTokenCount = 5000) {
    const encoding = encoding_for_model(this.modelName);
    const tokens = encoding.encode(text);
    const count = tokens.length;
    encoding.free();
    this.originTokenCount = count;
    this.availableTokenCount = this.availableTokenCount - this.originTokenCount - replyTokenCount;
    return [count, this.availableTokenCount];
  }
}
