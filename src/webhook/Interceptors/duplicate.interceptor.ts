import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, of } from 'rxjs';

type RequestRecord = {
  lastTime: number;
};

export const requestRecords = new Map<string, RequestRecord>();
const DUPLICATE_CHECK_TIME = 5 * 60 * 1000; // 5分钟 避免重复的报告生成

@Injectable()
export class AntDuplicateInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { body } = req;
    const { object_attributes } = body;
    const key = object_attributes.url as string;
    const now = Date.now();

    const record = requestRecords.get(key);

    if (record?.lastTime) {
      if (now - record.lastTime < DUPLICATE_CHECK_TIME) {
        console.log('重复请求拦截');
        return of('done');
      }
    }

    requestRecords.set(key, {
      lastTime: now,
    });

    setTimeout(() => {
      requestRecords.delete(key);
    }, DUPLICATE_CHECK_TIME);

    return next.handle();
  }
}
