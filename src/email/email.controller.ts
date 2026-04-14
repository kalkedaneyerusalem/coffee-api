import { Controller, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('test')
  async sendTestEmail(
    @Body('email') email: string,
  ) {
    await this.emailService.sendOrderConfirmationEmail({
      customerEmail: email,
      customerName: 'Test User',
      orderId: 'test-order-123',
      total: 1999,
    });

    return { message: 'Test email sent' };
  }
}