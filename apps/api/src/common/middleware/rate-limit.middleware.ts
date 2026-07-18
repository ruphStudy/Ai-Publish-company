import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NextFunction, Request, Response } from 'express';

interface RateWindow { count: number; resetAt: number }

@Injectable()
export class RateLimitMiddleware {
  private readonly windows = new Map<string, RateWindow>();
  constructor(private readonly config: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const ttl = this.config.get<number>('rateLimit.ttl', 60_000);
    const max = this.config.get<number>('rateLimit.max', 100);
    const now = Date.now();
    const key = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const current = this.windows.get(key);
    const window = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + ttl }
      : current;
    window.count += 1;
    this.windows.set(key, window);
    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', Math.max(0, max - window.count));
    res.setHeader('RateLimit-Reset', Math.ceil(window.resetAt / 1000));
    if (window.count > max) throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    next();
  }
}
