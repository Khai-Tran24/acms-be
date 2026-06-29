import { Injectable } from '@nestjs/common';
import { ContractService } from 'src/contract/contract.service';
import { UserService } from 'src/user/user.service';
import { GetAnalyticsDataDto } from './dto/get-analytics-query';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly contractService: ContractService,
    private readonly userService: UserService,
  ) {}

  private async getSummaryData(
    query: GetAnalyticsDataDto,
  ): Promise<SummaryData> {
    const [contractsSummary, usersSummary] = await Promise.all([
      this.contractService.computeContractsSummary(query),
      this.userService.computeUserStatistics(),
    ]);

    return {
      contracts: contractsSummary,
      users: usersSummary,
    };
  }

  private async getChartData(query: GetAnalyticsDataDto): Promise<ChartData> {
    const contractsChartData =
      await this.contractService.getContractChartData(query);

    return {
      contractsOverTime: contractsChartData.contractsOverTime,
      percentageOfContractsByStatus:
        contractsChartData.percentageOfContractsByStatus,
      percentageOfContractsByPropertyType:
        contractsChartData.percentageOfContractsByPropertyType,
      percentageOfContractsByPaymentStatus:
        contractsChartData.percentageOfContractsByPaymentStatus,
    };
  }

  async getAnalytics(query: GetAnalyticsDataDto): Promise<AnalyticsData> {
    const [summaryData, chartData] = await Promise.all([
      this.getSummaryData(query),
      this.getChartData(query),
    ]);

    return {
      summary: summaryData,
      chart: chartData,
    };
  }
}

interface AnalyticsData {
  summary: SummaryData;
  chart: ChartData;
}

interface ChartData {
  contractsOverTime: {
    labels: string[];
    data: number[];
  };
  percentageOfContractsByStatus: {
    labels: string[];
    data: number[];
  };
  percentageOfContractsByPropertyType: {
    labels: string[];
    data: number[];
  };
  percentageOfContractsByPaymentStatus: {
    labels: string[];
    data: number[];
  };
}

interface SummaryData {
  contracts: {
    totalContracts: number;
    contractsByStatus: Record<string, number>;
    contractsByPropertyType: Record<string, number>;
    contractsByPaymentStatus: Record<string, number>;
  };
  users: {
    activeUsers: number;
    inactiveUsers: number;
  };
}
