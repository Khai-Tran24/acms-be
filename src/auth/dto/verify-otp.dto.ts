import { ApiProperty } from '@nestjs/swagger';

export class VerifyOtpDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'The OTP code sent to the user',
    example: 123456,
  })
  otp!: number;
}
