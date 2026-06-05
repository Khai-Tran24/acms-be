import { Role } from 'src/common/enum/role.enum';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetUserQueryDto {
  @ApiProperty({ description: 'Search by username or email', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by user role',
    enum: Role,
    required: false,
  })
  @IsOptional()
  @IsEnum(Role)
  filterByRole?: Role;

  @ApiProperty({
    description: 'Filter by user status (active/inactive)',
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  filterByStatus?: boolean;

  @ApiProperty({
    description: 'Sort by field',
    enum: ['username', 'email', 'createdAt'],
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: 'username' | 'email' | 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc';

  @ApiProperty({ description: 'Page number for pagination', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiProperty({ description: 'Number of items per page', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}
