import { Injectable } from '@nestjs/common';

export interface HealthResponse {
  status: 'ok' | 'error';
  version: string;
  uptime: number;
  timestamp: string;
  checks?: Record<string, HealthCheck>;
}

export interface HealthCheck {
  status: string;
  [key: string]: unknown;
}

@Injectable()
export class HealthService {
  private readonly startTime: number;
  private readonly version: string;

  constructor() {
    this.startTime = Date.now();
    this.version = process.env.npm_package_version || '0.1.0';
  }

  getBaseHealth(): Omit<HealthResponse, 'checks'> {
    return {
      status: 'ok',
      version: this.version,
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString(),
    };
  }

  buildHealthResponse(checks?: Record<string, HealthCheck>): HealthResponse {
    const base = this.getBaseHealth();
    
    if (checks) {
      const hasError = Object.values(checks).some(
        (check) => check.status !== 'up'
      );
      
      return {
        ...base,
        status: hasError ? 'error' : 'ok',
        checks,
      };
    }

    return base;
  }
}
