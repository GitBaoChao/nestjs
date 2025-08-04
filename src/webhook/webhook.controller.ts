import { Controller, Post, Body, Headers, UseInterceptors } from '@nestjs/common';
import { MrRequestBody } from '../git-provide/types/git-provide';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../types';
import { GitProvideService } from '../git-provide/git-provide.service';
import { TokenHandler } from '../tokens';
import { PatchHandler } from '../patch/patch.service';
import { AgentService } from '../agent/agent.service';
import { PublishService } from '../publish/publish.service';
import { AntDuplicateInterceptor, requestRecords } from './Interceptors/duplicate.interceptor';

@Controller('webhook')
export class WebhookController {
  constructor(
    private readonly configService: ConfigService<EnvConfig>,
    private readonly agentService: AgentService,
    private readonly publishService: PublishService,
  ) {}

  @Post('trigger')
  @UseInterceptors(AntDuplicateInterceptor)
  async trigger(@Body() body: MrRequestBody, @Headers() header: Record<string, string>) {
    const gitlabToken = header['x-gitlab-token'] || '';
    const mode = (header['x-ai-mode'] || 'report') as 'report' | 'comment';
    const pushUrl = header['x-push-url'] || header['x-qwx-robot-url'] || '';
    const baseUrl = this.configService.get<string>('GITLAB_BASE_URL') || '';

    const gitProvider = new GitProvideService(body, {
      gitlabToken,
      baseUrl,
    });

    const { userName, projectName, sourceBranch, targetBranch, mrUrl } = gitProvider.getMrInfo();
    const commonPublishParams = {
      pushUrl,
      userName,
      projectName,
      sourceBranch,
      targetBranch,
    };

    if (!gitlabToken) {
      requestRecords.delete(mrUrl);
      this.publishService.publishNotification(commonPublishParams, `代码评审报告生成失败：gitlab token 不能为空`);
      throw new Error('gitlab token 不能为空');
    }

    const tokenHandler = new TokenHandler('gpt2');

    try {
      const diffFiles = await gitProvider.getFullDiff();

      const patchHandler = new PatchHandler(diffFiles);

      const extendedDiffContent = patchHandler.getExtendedDiffContent(gitProvider);

      const [tokenCount, availableTokenCount] = tokenHandler.countTokensByModel(extendedDiffContent);

      console.log('tokenCount >>>', tokenCount);
      console.log('availableTokenCount >>>', availableTokenCount);

      const reviews = await this.agentService.getPrediction(extendedDiffContent);

      console.log('reviews >>>', reviews);

      if (reviews) {
        this.publishService.publish(mode, reviews, gitProvider, patchHandler.getExtendedDiffFiles(), (id) => {
          this.publishService.publishNotification(
            commonPublishParams,
            `代码评审完毕 ${mode === 'report' ? mrUrl + '#note_' + id : mrUrl}`,
          );
        });
      } else {
        throw new Error('模型生成内容异常');
      }
    } catch (error) {
      requestRecords.delete(mrUrl);
      console.error('error >>>', error);
      this.publishService.publishNotification(commonPublishParams, `代码评审报告生成失败：${error}`);
    }

    return 'ok';
  }
}
