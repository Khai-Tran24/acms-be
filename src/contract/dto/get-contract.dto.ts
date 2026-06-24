import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

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
  @IsDateString()
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
