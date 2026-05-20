import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsDateAfter } from 'src/common/decorators/date.decorator';
import { IsGreaterThan } from 'src/common/decorators/number.decorator';
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
  @IsGreaterThan('deposit', {
    message: 'Giá khởi điểm phải lớn hơn tiền đặt cọc',
  })
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
  @IsDateAfter('registerStartDate', {
    message: 'Ngày hết hạn đăng ký phải sau ngày bắt đầu đăng ký',
  })
  registerExpiredDate!: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  @IsDateAfter('registerExpiredDate', {
    message: 'Ngày đấu giá phải sau ngày hết hạn đăng ký',
  })
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
  @IsOptional()
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
