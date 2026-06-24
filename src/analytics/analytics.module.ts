import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { ContractModule } from 'src/contract/contract.module';

@Module({
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  imports: [ContractModule],
})
export class AnalyticsModule {}
