"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenHandler = exports.tokenCountMap = void 0;
const tiktoken_1 = require("@dqbd/tiktoken");
exports.tokenCountMap = {
    gpt2: 64 * 1000,
};
class TokenHandler {
    originTokenCount = 0;
    availableTokenCount = 0;
    modelName;
    constructor(modelName) {
        this.modelName = modelName;
        this.availableTokenCount = exports.tokenCountMap[modelName] || 0;
    }
    countTokensByModel(text, replyTokenCount = 5000) {
        const encoding = (0, tiktoken_1.encoding_for_model)(this.modelName);
        const tokens = encoding.encode(text);
        const count = tokens.length;
        encoding.free();
        this.originTokenCount = count;
        this.availableTokenCount = this.availableTokenCount - this.originTokenCount - replyTokenCount;
        return [count, this.availableTokenCount];
    }
}
exports.TokenHandler = TokenHandler;
//# sourceMappingURL=index.js.map