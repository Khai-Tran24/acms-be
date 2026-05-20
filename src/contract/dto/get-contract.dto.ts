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
    description: 'Từ khóa tìm kiếm (theo số quy chế, tiêu đề, mô tả)',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Trường để sắp xếp kết quả (username, email, createdAt)',
  })
  @IsOptional()
  @IsEnum(['username', 'email', 'createdAt'])
  sortBy?: 'username' | 'email' | 'createdAt';

  @ApiPropertyOptional({
    description: 'Thứ tự sắp xếp (asc - tăng dần, desc - giảm dần)',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({
    description: 'Bộ lọc (auctioneer, secretary, createdBy)',
  })
  @IsOptional()
  @IsEnum(['auctioneer', 'secretary', 'createdBy'])
  filterBy?: 'auctioneer' | 'secretary' | 'createdBy';

  @ApiPropertyOptional({
    description: 'Ngày bắt đầu đăng ký (định dạng ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  startRegisterDate?: string;

  @ApiPropertyOptional({
    description: 'Ngày kết thúc đăng ký (định dạng ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  endRegisterDate?: string;

  @ApiPropertyOptional({
    description: 'Ngày đấu giá (định dạng ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  @Type(() => Date)
  auctionDate?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái hợp đồng (DRAFT, PUBLISHED, CLOSED)',
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

  // Computed property for pagination object (for internal use)
  get pagination() {
    return {
      page: this.page || 1,
      limit: this.limit || 10,
      total: 0,
    };
  }
}
