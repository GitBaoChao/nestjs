"use strict";
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
            ? (desc = Object.getOwnPropertyDescriptor(target, key))
            : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
var __param =
  (this && this.__param) ||
  function (paramIndex, decorator) {
    return function (target, key) {
      decorator(target, key, paramIndex);
    };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const git_provide_service_1 = require("../git-provide/git-provide.service");
const tokens_1 = require("../tokens");
const patch_service_1 = require("../patch/patch.service");
const agent_service_1 = require("../agent/agent.service");
const publish_service_1 = require("../publish/publish.service");
const duplicate_interceptor_1 = require("./Interceptors/duplicate.interceptor");
let WebhookController = class WebhookController {
  configService;
  agentService;
  publishService;
  constructor(configService, agentService, publishService) {
    this.configService = configService;
    this.agentService = agentService;
    this.publishService = publishService;
  }
  async trigger(body, header) {
    const gitlabToken = header["x-gitlab-token"] || "";
    const mode = header["x-ai-mode"] || "report";
    const pushUrl = header["x-push-url"] || header["x-qwx-robot-url"] || "";
    const baseUrl = "http://gitlab.com";
    const gitProvider = new git_provide_service_1.GitProvideService(body, {
      gitlabToken,
      baseUrl,
    });
    const { userName, projectName, sourceBranch, targetBranch, mrUrl } =
      gitProvider.getMrInfo();
    const commonPublishParams = {
      pushUrl,
      userName,
      projectName,
      sourceBranch,
      targetBranch,
    };
    if (!gitlabToken) {
      duplicate_interceptor_1.requestRecords.delete(mrUrl);
      this.publishService.publishNotification(
        commonPublishParams,
        `代码评审报告生成失败：gitlab token 不能为空`
      );
      throw new Error("gitlab token 不能为空");
    }
    const tokenHandler = new tokens_1.TokenHandler("gpt2");
    try {
      const diffFiles = await gitProvider.getFullDiff();
      const patchHandler = new patch_service_1.PatchHandler(diffFiles);
      const extendedDiffContent =
        patchHandler.getExtendedDiffContent(gitProvider);
      const [tokenCount, availableTokenCount] =
        tokenHandler.countTokensByModel(extendedDiffContent);
      console.log("tokenCount >>>", tokenCount);
      console.log("availableTokenCount >>>", availableTokenCount);
      const reviews =
        await this.agentService.getPrediction(extendedDiffContent);
      console.log("reviews >>>", reviews);
      if (reviews) {
        this.publishService.publish(
          mode,
          reviews,
          gitProvider,
          patchHandler.getExtendedDiffFiles(),
          (id) => {
            this.publishService.publishNotification(
              commonPublishParams,
              `代码评审完毕 ${mode === "report" ? mrUrl + "#note_" + id : mrUrl}`
            );
          }
        );
      } else {
        throw new Error("模型生成内容异常");
      }
    } catch (error) {
      duplicate_interceptor_1.requestRecords.delete(mrUrl);
      console.error("error >>>", error);
      this.publishService.publishNotification(
        commonPublishParams,
        `代码评审报告生成失败：${error}`
      );
    }
    return "ok";
  }
};
exports.WebhookController = WebhookController;
__decorate(
  [
    (0, common_1.Post)("trigger"),
    (0, common_1.UseInterceptors)(
      duplicate_interceptor_1.AntDuplicateInterceptor
    ),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise),
  ],
  WebhookController.prototype,
  "trigger",
  null
);
exports.WebhookController = WebhookController = __decorate(
  [
    (0, common_1.Controller)("webhook"),
    __metadata("design:paramtypes", [
      config_1.ConfigService,
      agent_service_1.AgentService,
      publish_service_1.PublishService,
    ]),
  ],
  WebhookController
);
//# sourceMappingURL=webhook.controller.js.map
