import { MrRequestBody } from '../git-provide/types/git-provide';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../types';
import { AgentService } from '../agent/agent.service';
import { PublishService } from '../publish/publish.service';
export declare class WebhookController {
    private readonly configService;
    private readonly agentService;
    private readonly publishService;
    constructor(configService: ConfigService<EnvConfig>, agentService: AgentService, publishService: PublishService);
    trigger(body: MrRequestBody, header: Record<string, string>): Promise<string>;
}
