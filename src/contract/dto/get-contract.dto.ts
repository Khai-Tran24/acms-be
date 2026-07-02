import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
  IsArray,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ContractExportColumn {
  ID = 'id',
  CONTRACT_NUMBER = 'contractNumber',
  CONTRACT_YEAR = 'contractYear',
  PROPERTY_NAME = 'propertyName',
  PROPERTY_TYPE = 'propertyType',
  PROPERTY_OWNER = 'propertyOwner',
  CASE_OFFICER = 'caseOfficer',
  STARTING_PRICE = 'startingPrice',
  WINNING_PRICE = 'winningPrice',
  DISCOUNT_PRICE = 'discountPrice',
  END_REGISTER_DATE = 'endRegisterDate',
  AUCTION_DATE = 'auctionDate',
  STATUS = 'status',
  WINNER = 'winner',
  PAYMENT_STATUS = 'paymentStatus',
  CREATED_BY = 'createdBy',
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
}

export class GetContractDto {
  @ApiPropertyOptional({
    description: 'Từ khóa tìm kiếm (theo tên tài sản hoặc số hợp đồng)',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description:
      'Trường để sắp xếp kết quả (createdAt, year, contractNumber, propertyName)',
  })
  @IsOptional()
  @IsEnum(['createdAt', 'year', 'contractNumber', 'propertyName'])
  sortBy?: 'createdAt' | 'year' | 'contractNumber' | 'propertyName';

  @ApiPropertyOptional({
    description: 'Thứ tự sắp xếp (asc - tăng dần, desc - giảm dần)',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Bộ lọc theo người dùng (theo ID người dùng)',
  })
  @IsOptional()
  @IsString()
  filterByUserId?: string;

  @ApiPropertyOptional({
    description: 'Bộ lọc theo năm hợp đồng (theo năm)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  filterByYear?: number;

  @ApiPropertyOptional({
    description: 'Ngày kết thúc đăng ký (định dạng ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  endRegisterDate?: string;

  @ApiPropertyOptional({
    description: 'Ngày đấu giá (định dạng ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  auctionDate?: string;

  @ApiPropertyOptional({
    description: 'Số trang (mặc định là 1)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Số lượng bản ghi trên mỗi trang',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

export class ExportToExcelParamsDto extends GetContractDto {
  @ApiPropertyOptional({
    description:
      'Danh sách cột cần export. Có thể truyền dạng CSV: columns=contractNumber,propertyName hoặc truyền nhiều query columns=contractNumber&columns=propertyName. Nếu bỏ trống sẽ export tất cả cột mặc định.',
    enum: ContractExportColumn,
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.flatMap((item) =>
        String(item)
          .split(',')
          .map((column) => column.trim())
          .filter(Boolean),
      );
    }

    if (typeof value === 'string') {
      return value
        .split(',')
        .map((column) => column.trim())
        .filter(Boolean);
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value;
  })
  @IsArray()
  @IsEnum(ContractExportColumn, { each: true })
  columns?: ContractExportColumn[];
}
