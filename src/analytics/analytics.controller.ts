import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { GetAnalyticsDataDto } from './dto/get-analytics-query';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  @ApiBearerAuth()
  getAnalyticsData(@Query() query: GetAnalyticsDataDto): Promise<any> {
    return this.analyticsService.getAnalytics(query);
  }
}
