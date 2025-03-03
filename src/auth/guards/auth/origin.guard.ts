import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OriginGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const origin = request.headers.origin;
    const allowedOrigin = this.configService.get<string>('FRONTEND_URL'); // cambiar por FRONTEND_URL 

    return origin === allowedOrigin;
  }
}