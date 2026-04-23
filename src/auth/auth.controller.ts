import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(200)
  @Post('signin')
  async signIn(@Body() signInDto: SignInDto): Promise<any> {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto): Promise<any> {
    return this.authService.signUp(
      signUpDto.username,
      signUpDto.password,
      signUpDto.email,
    );
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<any> {
    return this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
  }

  @Post('signout')
  async signOut(@Body() id: string): Promise<any> {
    // Implement sign-out logic if needed, such as invalidating tokens or clearing cookies
    return this.authService.signOut(id);
  }
}
