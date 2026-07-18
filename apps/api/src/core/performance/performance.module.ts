import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PerformanceInterceptor } from './performance.interceptor';
import { SingleFlightService } from './single-flight.service';

@Module({
  providers: [SingleFlightService, { provide: APP_INTERCEPTOR, useClass: PerformanceInterceptor }],
  exports: [SingleFlightService],
})
export class PerformanceModule {}
