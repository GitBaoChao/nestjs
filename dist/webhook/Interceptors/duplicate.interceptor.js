"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AntDuplicateInterceptor = exports.requestRecords = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
exports.requestRecords = new Map();
const DUPLICATE_CHECK_TIME = 5 * 60 * 1000;
let AntDuplicateInterceptor = class AntDuplicateInterceptor {
    intercept(context, next) {
        const req = context.switchToHttp().getRequest();
        const { body } = req;
        const { object_attributes } = body;
        const key = object_attributes.url;
        const now = Date.now();
        const record = exports.requestRecords.get(key);
        if (record?.lastTime) {
            if (now - record.lastTime < DUPLICATE_CHECK_TIME) {
                console.log('重复请求拦截');
                return (0, rxjs_1.of)('done');
            }
        }
        exports.requestRecords.set(key, {
            lastTime: now,
        });
        setTimeout(() => {
            exports.requestRecords.delete(key);
        }, DUPLICATE_CHECK_TIME);
        return next.handle();
    }
};
exports.AntDuplicateInterceptor = AntDuplicateInterceptor;
exports.AntDuplicateInterceptor = AntDuplicateInterceptor = __decorate([
    (0, common_1.Injectable)()
], AntDuplicateInterceptor);
//# sourceMappingURL=duplicate.interceptor.js.map