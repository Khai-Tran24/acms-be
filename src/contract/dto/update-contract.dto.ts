import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { IsDateAfter } from 'src/common/decorators/date.decorator';
import { IsGreaterThan } from 'src/common/decorators/number.decorator';
import {
  ContractStatus,
  PaymentStatus,
  PropertyType,
} from 'src/common/enum/contract.enum';

export class UpdateContractDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contractNumber!: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  contractYear!: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  propertyName!: string;

  @ApiProperty({ enum: PropertyType })
  @IsString()
  @IsNotEmpty()
  propertyType!: PropertyType;

  @ApiProperty({ type: () => Object })
  @IsOptional()
  propertyOwner?: {
    name: string;
    address: string;
    phone: string;
  };

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  caseOfficer!: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  startingPrice!: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  @IsGreaterThan('startingPrice', {
    message: 'Giá trúng phải lớn hơn hoặc bằng giá khởi điểm',
  })
  winningPrice!: number;

  @ApiProperty({ type: () => Object })
  @IsOptional()
  discountPrice!: {
    amount: number;
    times: number;
  };

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  endRegisterDate!: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  @IsDateAfter('endRegisterDate', {
    message: 'Ngày đấu giá phải sau ngày hết hạn đăng ký',
  })
  auctionDate!: string;

  @ApiProperty({ enum: ContractStatus })
  @IsNotEmpty()
  status!: ContractStatus;

  @ApiProperty({ type: () => Object })
  @IsOptional()
  winner!: {
    name: string;
    address: string;
    phone: string;
  };

  @ApiProperty({ enum: PaymentStatus })
  @IsOptional()
  paymentStatus!: PaymentStatus;

  // @ApiProperty()
  // @IsString()
  // @IsOptional()
  // fileUrl!: string;
}
