import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ContractStatus } from 'src/common/enum/contract.enum';

export class CreateContractDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  regulationNumber!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  startingPrice!: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  applicationFee!: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  deposit!: number;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  registerStartDate!: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  registerExpiredDate!: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  auctionDate!: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  auctionTime!: number;

  @ApiProperty({ enum: ContractStatus })
  @IsNotEmpty()
  status!: ContractStatus;

  @ApiProperty()
  @IsString()
  fileUrl!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  auctioneer!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  secretary!: string;
}
