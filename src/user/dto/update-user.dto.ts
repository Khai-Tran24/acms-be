import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

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

  refreshToken!: string;
  accessToken!: string;
  otp!: number;
  otpExpireAt!: Date;

  @ApiProperty({
    description: 'The active status of the user',
    example: true,
  })
  isActive!: boolean;
}
