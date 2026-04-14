import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;
  private senderEmail: string;
  private frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    if (!apiKey) {
      throw new Error('RESEND_API_KEY is missing');
    }

    this.resend = new Resend(apiKey);
    this.senderEmail =
      this.configService.get<string>('SENDER_EMAIL') || 'onboarding@resend.dev';
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
  }

  async sendOrderConfirmationEmail(params: {
    customerEmail: string;
    customerName: string;
    orderId: string;
    total: number;
  }) {
    const trackUrl = `${this.frontendUrl}/track-order?orderId=${params.orderId}`;

    return this.resend.emails.send({
      from: this.senderEmail,
      to: params.customerEmail,
      subject: 'Your Betsy Coffee order is confirmed',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #2d2218;">
          <h2>Thank you for your order, ${params.customerName} ☕</h2>
          <p>Your payment was successful and your order is now confirmed.</p>
          <p><strong>Order ID:</strong> ${params.orderId}</p>
          <p><strong>Total:</strong> $${(params.total / 100).toFixed(2)}</p>
          <p>
            Track your order here:
            <a href="${trackUrl}">${trackUrl}</a>
          </p>
          <p>We’ll notify you again when your order ships.</p>
        </div>
      `,
    });
  }
  async sendShippingConfirmationEmail(params: {
  customerEmail: string;
  customerName: string;
  orderId: string;
  carrier: string;
  trackingNumber: string;
}) {
  const trackUrl = `${this.frontendUrl}/track-order?orderId=${params.orderId}`;

  return this.resend.emails.send({
    from: this.senderEmail,
    to: params.customerEmail,
    subject: 'Your Betsy Coffee order has shipped',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #2d2218;">
        <h2>Your order is on the way, ${params.customerName} 🚚</h2>
        <p>Your Betsy Coffee order has shipped.</p>
        <p><strong>Order ID:</strong> ${params.orderId}</p>
        <p><strong>Carrier:</strong> ${params.carrier}</p>
        <p><strong>Tracking Number:</strong> ${params.trackingNumber}</p>
        <p>
          Track your order here:
          <a href="${trackUrl}">${trackUrl}</a>
        </p>
        <p>Thanks again for supporting Betsy Coffee ☕</p>
      </div>
    `,
  });
}
}