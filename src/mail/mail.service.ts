import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailService: MailerService) {}

  async sendMail(to: string, subject: string, text: string, html?: string) {
    await this.mailService.sendMail({
      to,
      subject,
      text,
      html: html || text,
    });
  }

  async sendActivationEmail(to: string, otp: number, username: string) {
    const html = this.generateActivationEmailHtml(otp, username);
    await this.sendMail(
      to,
      'Account Activation',
      `Thank you for signing up, ${username}! Please use the following OTP to activate your account: ${otp}`,
      html,
    );
  }

  async sendPasswordResetEmail(to: string, link: string, username: string) {
    const html = this.generatePasswordResetEmailHtml(link, username);
    await this.sendMail(
      to,
      'Yêu cầu đặt lại mật khẩu',
      `Xin chào ${username}, chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn.`,
      html,
    );
  }

  private generatePasswordResetEmailHtml(
    link: string,
    username: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #ffffff;
              padding: 40px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              font-weight: 500;
              margin-bottom: 20px;
              color: #333;
            }
            .message {
              font-size: 14px;
              color: #666;
              margin-bottom: 30px;
              line-height: 1.8;
            }
            .cta-button {
              display: inline-block;
              padding: 14px 40px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              font-size: 16px;
              transition: transform 0.2s;
              margin: 20px 0;
            }
            .cta-button:hover {
              transform: scale(1.05);
            }
            .link-fallback {
              margin-top: 20px;
              padding: 15px;
              background-color: #f9f9f9;
              border-left: 4px solid #667eea;
              font-size: 12px;
              color: #666;
              word-break: break-all;
            }
            .footer {
              background-color: #f4f4f4;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #999;
              border-top: 1px solid #eee;
            }
            .footer p {
              margin: 8px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Đặt lại mật khẩu</h1>
            </div>
            <div class="content">
              <p class="greeting">Xin chào <strong>${username}</strong>,</p>
              <p class="message">
                Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn. Vui lòng sử dụng liên kết sau để đặt lại mật khẩu của bạn:
              </p>
              <center>
                <a href="${link}" class="cta-button">Đặt lại mật khẩu</a>
                <p class="message">Nếu nút trên không hoạt động, vui lòng sao chép và dán liên kết sau vào trình duyệt của bạn:</p>
                <div class="link-fallback">${link}</div>
              </center>
            </div>
            <div class="footer">
              <p>&copy; 2026 Auction Contract Management. All rights reserved.</p>
              <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateActivationEmailHtml(otp: number, username: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
            }
            .container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #ffffff;
              padding: 40px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 600;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              font-weight: 500;
              margin-bottom: 20px;
              color: #333;
            }
            .message {
              font-size: 14px;
              color: #666;
              margin-bottom: 30px;
              line-height: 1.8;
            }
            .cta-button {
              display: inline-block;
              padding: 14px 40px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              font-size: 16px;
              transition: transform 0.2s;
              margin: 20px 0;
            }
            .cta-button:hover {
              transform: scale(1.05);
            }
            .link-fallback {
              margin-top: 20px;
              padding: 15px;
              background-color: #f9f9f9;
              border-left: 4px solid #667eea;
              font-size: 12px;
              color: #666;
              word-break: break-all;
            }
            .footer {
              background-color: #f4f4f4;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #999;
              border-top: 1px solid #eee;
            }
            .footer p {
              margin: 8px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Xin chào!</h1>
            </div>
            <div class="content">
              <p class="greeting">Xin chào <strong>${username}</strong>,</p>
              <p class="message">
                Cảm ơn bạn đã đăng ký! Chúng tôi rất vui khi có bạn trên board. Để bắt đầu, vui lòng xác minh địa chỉ email của bạn bằng cách nhấn vào nút dưới đây.
              </p>
              <center>
                <p class="message">Mã xác minh (OTP) của bạn là:</p>
                <h2>${otp}</h2>
              </center>
              <p class="message">
                Mã OTP này sẽ hết hạn sau 24 giờ. Nếu bạn không tạo tài khoản này, vui lòng bỏ qua email này.
              </p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Auction Contract Management. All rights reserved.</p>
              <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
