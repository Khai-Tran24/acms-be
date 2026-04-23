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
              <h1>Welcome!</h1>
            </div>
            <div class="content">
              <p class="greeting">Hi <strong>${username}</strong>,</p>
              <p class="message">
                Thank you for signing up! We're excited to have you on board. To get started, please verify your email address by clicking the button below.
              </p>
              <center>
                <p class="message">Your One-Time Password (OTP) is:</p>
                <h2>${otp}</h2>
              </center>
              <p class="message">
                This OTP will expire in 24 hours. If you didn't create this account, you can safely ignore this email.
              </p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Auction Contract Management. All rights reserved.</p>
              <p>If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
