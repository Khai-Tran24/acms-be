import { ContractStatus } from 'src/common/enum/contract.enum';

export class UpdateContractDto {
  regulationNumber!: string;
  title!: string;
  description!: string;
  startingPrice!: number;
  applicationFee!: number;
  deposit!: number;
  registerStartDate!: Date;
  registerExpiredDate!: Date;
  auctionDate!: Date;
  auctionTime!: number;
  status!: ContractStatus;
  fileUrl!: string;
}
