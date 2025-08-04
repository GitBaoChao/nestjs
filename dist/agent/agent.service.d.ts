import { PromptService } from "../prompt/prompt.service";
import { EnvConfig } from "../types";
import { ConfigService } from "@nestjs/config";
export declare class AgentService {
    private readonly promptService;
    private readonly configService;
    private readonly agentUrl;
    private readonly apiKey;
    private readonly modelName;
    constructor(promptService: PromptService, configService: ConfigService<EnvConfig>);
    getPrediction(query: string): Promise<import("./types").Review[] | undefined>;
    callAgent(query: string): Promise<string>;
}
