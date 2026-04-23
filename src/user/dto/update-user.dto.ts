import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends CreateUserDto {
  refreshToken!: string;
  otp!: number;
  otpExpireAt!: Date;

  @ApiProperty({
    description: 'The active status of the user',
    example: true,
  })
  isActive!: boolean;
}
