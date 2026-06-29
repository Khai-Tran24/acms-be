import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { ContractModule } from 'src/contract/contract.module';
import { UserModule } from 'src/user/user.module';

@Module({
  providers: [AnalyticsService],
  controllers: [AnalyticsController],
  imports: [ContractModule, UserModule],
})
export class AnalyticsModule {}
