import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { User } from 'src/user/entity/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @Public()
  async signIn(@Body() signInDto: SignInDto): Promise<any> {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Post('signup')
  @Public()
  async signUp(@Body() signUpDto: SignUpDto): Promise<any> {
    return this.authService.signUp(signUpDto);
  }

  @Post('verify-otp')
  @Public()
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<any> {
    return this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
  }

  @Post('signout')
  @ApiBearerAuth()
  async signOut(@Req() req: { user: Partial<User> }): Promise<any> {
    const id = req.user.id as string;
    return this.authService.signOut(id);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  async getProfile(@Req() req: { user: Partial<User> }): Promise<any> {
    const id = req.user.id as string;
    return this.authService.getProfile(id);
  }
}
