import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { EmailService } from '../email/email.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateStripeSessionDto } from './dto/create-stripe-session.dto';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {
    const secretKey = this.configService.get<string>('STRIPE_SECRET_KEY');

    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is missing');
    }

    this.stripe = new Stripe(secretKey);
  }

  async create(createPaymentDto: CreatePaymentDto) {
    const order = await this.ordersService.findOne(createPaymentDto.orderId);

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      message: 'Mock payment session created',
      orderId: order.id,
      paymentSessionId: `pay_${Date.now()}`,
      status: 'pending',
      paymentUrl: `http://localhost:3000/payments/mock-payment/${order.id}`,
    };
  }

 async confirm(orderId: string) {
  const existingOrder = await this.ordersService.findOne(orderId);

  // prevent duplicate emails
  if (existingOrder.status === 'paid') {
    return {
      message: 'Order already confirmed',
      orderId: existingOrder.id,
      status: existingOrder.status,
    };
  }

  const updatedOrder = await this.ordersService.markAsPaid(orderId);

  const lineTotals = await Promise.all(
    updatedOrder.items.map(async (item) => {
      const product = await this.productsService.findOne(item.productId);
      return product.price * item.quantity;
    }),
  );

  const total = lineTotals.reduce((sum, value) => sum + value, 0);

  await this.emailService.sendOrderConfirmationEmail({
    customerEmail: updatedOrder.customerEmail,
    customerName: updatedOrder.customerName,
    orderId: updatedOrder.id,
    total,
  });

  return {
    message: 'Payment confirmed successfully',
    orderId: updatedOrder.id,
    status: updatedOrder.status,
  };
}

  async createStripeCheckoutSession(
    createStripeSessionDto: CreateStripeSessionDto,
  ) {
    const order = await this.ordersService.findOne(
      createStripeSessionDto.orderId,
    );

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      await Promise.all(
        order.items.map(async (item) => {
          const product = await this.productsService.findOne(item.productId);

          return {
            quantity: item.quantity,
            price_data: {
              currency: 'usd',
              product_data: {
                name: product.name,
                description: product.description,
                images: product.imageUrl ? [product.imageUrl] : [],
              },
              unit_amount: product.price,
            },
          };
        }),
      );

    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') ||
      'http://localhost:5173';

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: order.customerEmail,
      success_url: `${frontendUrl}/order-success?orderId=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/checkout`,
      metadata: {
        orderId: order.id,
      },
    });

    return {
      url: session.url,
      sessionId: session.id,
    };
  }
}