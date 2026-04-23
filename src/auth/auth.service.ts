import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { Role } from 'src/common/enum/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(username: string, password: string): Promise<any> {
    const user = await this.userService.findOne({ username: username });

    const isMatch = user && (await bcrypt.compare(password, user.password));
    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu hoặc không chính xác');
    }

    const refreshToken = this.jwtService.sign(
      { username: user.username, id: user.id },
      { expiresIn: '7d' },
    );

    const hashedRefreshToken = await bcrypt.hash(
      refreshToken,
      await bcrypt.genSalt(),
    );

    await this.userService.update(user.id, {
      refreshToken: hashedRefreshToken,
    } as UpdateUserDto);

    const payload = {
      username: user.username,
      email: user.email,
      id: user.id,
      isActive: user.isActive,
    };

    return {
      message: 'Sign in successful',
      data: {
        accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
        refreshToken,
      },
    };
  }

  async signUp(
    username: string,
    password: string,
    email: string,
  ): Promise<any> {
    const existingUser = await this.userService.findOne({ username: username });

    if (existingUser) {
      throw new UnauthorizedException('Người dùng đã tồn tại');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpireAt = new Date();
    otpExpireAt.setHours(otpExpireAt.getHours() + 24);

    const userAfterHashing = {
      username,
      password: hashedPassword,
      email,
      isActive: false,
      role: Role.USER,
      otp,
      otpExpireAt,
    };

    await this.mailService.sendActivationEmail(email, otp, username);
    const newUser = await this.userService.create(userAfterHashing);

    return {
      message:
        'User created successfully, please check your email to activate your account.',
      data: newUser,
    };
  }

  async verifyOtp(email: string, otp: number): Promise<any> {
    const user = await this.userService.findOne({ email: email, otp: otp });

    if (!user) {
      throw new UnauthorizedException('Invalid OTP');
    }

    if (user.otpExpireAt && user.otpExpireAt < new Date()) {
      throw new UnauthorizedException('OTP has expired');
    }

    await this.userService.activateUser(user.id);

    await this.userService.update(user.id, {
      otp: null,
      otpExpireAt: null,
    } as unknown as UpdateUserDto);

    return {
      message: 'Account activated successfully',
    };
  }

  async signOut(id: string): Promise<any> {
    try {
      await this.userService.update(id, { refreshToken: '' } as UpdateUserDto);
    } catch (error) {
      console.error('Error signing out:', error);
      throw new UnauthorizedException('Sign out failed');
    }

    return {
      message: 'Sign out successful',
    };
  }
}
