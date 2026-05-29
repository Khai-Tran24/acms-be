import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { User } from 'src/user/entity/user.entity';
import { JwtPayload } from './types/jwt-payload.type';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(username: string, password: string): Promise<any> {
    let user: User | null = null;

    if (username.includes('@')) {
      user = await this.userService.findOneWithPassword({ email: username });
    } else {
      user = await this.userService.findOneWithPassword({
        username: username,
      });
    }

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tài khoản chưa được kích hoạt');
    }

    const isMatch = user && (await bcrypt.compare(password, user.password));
    if (!isMatch) {
      throw new UnauthorizedException(
        'Tên người dùng hoặc mật khẩu không chính xác',
      );
    }

    const refreshToken = this.jwtService.sign(
      {
        username: user.username,
        id: user.id,
        email: user.email,
        isActive: user.isActive,
        role: user.role,
      },
      { expiresIn: '7d' },
    );

    const hashedRefreshToken = await bcrypt.hash(
      refreshToken,
      await bcrypt.genSalt(),
    );

    await this.userService.update(user.id, {
      refreshToken: hashedRefreshToken,
    } as UpdateUserDto);

    const payload: JwtPayload = {
      username: user.username,
      email: user.email,
      role: user.role,
      id: user.id,
      isActive: user.isActive,
    };

    return {
      message: 'Đăng nhập thành công',
      data: {
        accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
        refreshToken,
      },
    };
  }

  async signUp(signUpDto: SignUpDto): Promise<any> {
    const existingUser = await this.userService.findOne({
      username: signUpDto.username,
      isActive: true,
    });

    if (existingUser) {
      throw new UnauthorizedException('Người dùng đã tồn tại');
    }
    // Đã check tài khoản có tồn tại và đang active hay chưa, nếu có tồn tại nhưng chưa active thì vẫn cho phép đăng ký và gửi lại email kích hoạt

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(signUpDto.password, salt);

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpireAt = new Date();
    otpExpireAt.setHours(otpExpireAt.getHours() + 24);

    const userAfterHashing = {
      username: signUpDto.username,
      password: hashedPassword,
      email: signUpDto.email,
      isActive: false,
      role: signUpDto.role,
      otp,
      otpExpireAt,
    };

    const newUser = await this.userService.create(userAfterHashing);

    await this.mailService.sendActivationEmail(
      signUpDto.email,
      otp,
      signUpDto.username,
    );

    return {
      message:
        'Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản của bạn.',
      data: newUser,
    };
  }

  async verifyOtp(email: string, otp: number): Promise<any> {
    if (!email || !otp) {
      throw new UnauthorizedException('Email và OTP là bắt buộc');
    }

    const user = await this.userService.findOne({ email });
    console.log('User found for OTP verification:', user);
    if (!user) {
      throw new UnauthorizedException('Email không tồn tại');
    }

    if (user.isActive) {
      throw new UnauthorizedException('Tài khoản đã được kích hoạt');
    }

    if (!user.otpExpireAt || user.otpExpireAt < new Date()) {
      throw new UnauthorizedException('OTP đã hết hạn');
    }

    if (user.otp !== otp) {
      throw new UnauthorizedException('OTP không hợp lệ');
    }

    await this.userService.update(user.id, {
      isActive: true,
      otp: null,
      otpExpireAt: null,
    } as unknown as UpdateUserDto);

    return {
      message: 'Kích hoạt tài khoản thành công',
      data: {},
    };
  }

  async signOut(id: string): Promise<any> {
    try {
      await this.userService.update(id, { refreshToken: '' } as UpdateUserDto);
    } catch (error) {
      console.error('Error signing out:', error);
      throw new UnauthorizedException('Đăng xuất thất bại');
    }

    return {
      message: 'Đăng xuất thành công',
      data: {},
    };
  }

  async getProfile(id: string): Promise<any> {
    const user = await this.userService.findOne({ id });
    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    console.log('User profile:', user);

    const formatUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      role: user.role,
    };

    return formatUser;
  }
}
