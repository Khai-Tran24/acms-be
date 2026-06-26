import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { Role } from 'src/common/enum/role.enum';

export class UpdateUserDto {
  @ApiProperty({
    description: 'The username of the user',
    example: 'john_doe',
  })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'john.doe@example.com',
  })
  @IsString()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'The active status of the user',
    example: true,
  })
  @IsBoolean()
  isActive!: boolean;

  @ApiProperty({
    description: 'The role of the user',
    example: 'ADMIN',
  })
  @IsNotEmpty()
  @IsString()
  role!: Role;

  refreshToken!: string;
  accessToken!: string;
  otp!: number;
  otpExpireAt!: Date;
}
