"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentService = void 0;
const common_1 = require("@nestjs/common");
const prompt_service_1 = require("../prompt/prompt.service");
const config_1 = require("@nestjs/config");
const utils_1 = require("./utils");
let AgentService = class AgentService {
    promptService;
    configService;
    agentUrl;
    apiKey;
    modelName;
    constructor(promptService, configService) {
        this.promptService = promptService;
        this.configService = configService;
        this.agentUrl = this.configService.get('AGENT_URL') || '';
        this.apiKey = this.configService.get('API_KEY') || '';
        this.modelName = this.configService.get('MODEL_NAME') || '';
    }
    async getPrediction(query) {
        const answer = await this.callAgent(query);
        const result = (0, utils_1.extractFirstYamlFromMarkdown)(answer);
        if (result?.error) {
            throw result.error;
        }
        return result?.parsed?.reviews;
    }
    async callAgent(query) {
        const url = this.agentUrl;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: this.modelName,
                messages: this.promptService.getMessages(query),
                temperature: 0.2,
                max_tokens: 6000,
                stream: true,
            }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('无法获取响应流的读取器');
        }
        const decoder = new TextDecoder('utf-8');
        let answer = '';
        let done = false;
        let buffer = '';
        while (!done) {
            const { value, done: streamDone } = await reader.read();
            done = streamDone;
            if (value) {
                buffer += decoder.decode(value, { stream: true });
                const parts = buffer.split('\n\n');
                buffer = parts.pop() || '';
                for (const part of parts) {
                    const match = part.match(/^data: (.+)$/);
                    if (match) {
                        const data = match[1].trim();
                        if (data === '[DONE]') {
                            continue;
                        }
                        try {
                            const json = JSON.parse(data);
                            if (json.choices[0].delta?.content) {
                                answer += json.choices[0].delta.content;
                            }
                            else if (json.choices[0].message?.content) {
                                answer += json.choices[0].message.content;
                            }
                        }
                        catch (error) {
                            console.log('解析 JSON 失败:', error);
                        }
                    }
                }
            }
        }
        return answer;
    }
};
exports.AgentService = AgentService;
exports.AgentService = AgentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prompt_service_1.PromptService,
        config_1.ConfigService])
], AgentService);
//# sourceMappingURL=agent.service.js.map