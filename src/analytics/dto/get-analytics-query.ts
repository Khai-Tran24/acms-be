import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { IsDateAfter } from 'src/common/decorators/date.decorator';

export class GetAnalyticsDataDto {
  @ApiPropertyOptional({
    description: 'Start date for analytics data (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for analytics data (YYYY-MM-DD)',
  })
  @IsDateString()
  @IsDateAfter('startDate', {
    message: 'endDate must be after startDate',
  })
  @IsOptional()
  endDate?: string;

  // @ApiPropertyOptional({
  //   description: 'Group analytics data by day, week, or month',
  // })
  // @IsString()
  // @IsOptional()
  // period?: 'day' | 'week' | 'month';
}
