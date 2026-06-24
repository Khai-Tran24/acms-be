import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { User } from 'src/user/entity/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { Public } from 'src/common/decorators/public.decorator';
import { ResponseMessage } from 'src/common/decorators/response-message.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @Public()
  @ResponseMessage('Đăng nhập thành công.')
  async signIn(@Body() signInDto: SignInDto): Promise<any> {
    return this.authService.signIn(signInDto.loginIdentify, signInDto.password);
  }

  @Post('signup')
  @Public()
  @ResponseMessage(
    'Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản của bạn.',
  )
  async signUp(@Body() signUpDto: SignUpDto): Promise<any> {
    return this.authService.signUp(signUpDto);
  }

  @Post('verify-otp')
  @Public()
  @ResponseMessage('Xác minh OTP thành công.')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto): Promise<any> {
    return this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.otp);
  }

  @Post('signout')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ResponseMessage('Đăng xuất thành công.')
  async signOut(@Req() req: { user: Partial<User> }): Promise<any> {
    const id = req.user.id as string;
    return this.authService.signOut(id);
  }

  @Post('forgot-password')
  @Public()
  @ApiBody({
    schema: { type: 'object', properties: { email: { type: 'string' } } },
  })
  @ResponseMessage(
    'Yêu cầu đặt lại mật khẩu thành công. Vui lòng kiểm tra email của bạn.',
  )
  async forgotPassword(@Body('email') email: string): Promise<any> {
    return this.authService.forgotPassword(email);
  }

  @Post('reset-password')
  @Public()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string' },
        token: { type: 'number' },
        newPassword: { type: 'string' },
      },
    },
  })
  @ResponseMessage('Đặt lại mật khẩu thành công.')
  async resetPassword(
    @Body('email') email: string,
    @Body('token') token: number,
    @Body('newPassword') newPassword: string,
  ): Promise<any> {
    return this.authService.resetPassword(email, token, newPassword);
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ResponseMessage('Lấy thông tin người dùng thành công.')
  async getProfile(@Req() req: { user: Partial<User> }): Promise<any> {
    const id = req.user.id as string;
    return this.authService.getProfile(id);
  }
}
