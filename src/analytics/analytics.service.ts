import { Injectable } from '@nestjs/common';
import { ContractService } from 'src/contract/contract.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly contractService: ContractService) {}
}
