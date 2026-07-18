import { Injectable } from '@nestjs/common';
import { AnalyticsRefreshDto } from './dto';
import { BookAnalyticsCoordinator } from './book-analytics.coordinator';

@Injectable()
export class AnalyticsRefreshCoordinator {
  constructor(private readonly coordinator: BookAnalyticsCoordinator) {}
  request(dto: AnalyticsRefreshDto, userId?: string) { return this.coordinator.refresh(dto, userId); }
}
