import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
type RequestRecord = {
    lastTime: number;
};
export declare const requestRecords: Map<string, RequestRecord>;
export declare class AntDuplicateInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
export {};
