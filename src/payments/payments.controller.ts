import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateStripeSessionDto } from './dto/create-stripe-session.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-session')
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Post('create-checkout-session')
  createStripeCheckoutSession(@Body() createStripeSessionDto: CreateStripeSessionDto) {
    return this.paymentsService.createStripeCheckoutSession(createStripeSessionDto);
  }

  @Get('mock-payment/:orderId')
  mockPaymentPage(@Param('orderId') orderId: string) {
    return {
      message: 'Mock payment page reached successfully',
      orderId,
      status: 'ready-for-mock-payment',
    };
  }

  @Post('confirm/:orderId')
  confirm(@Param('orderId') orderId: string) {
    return this.paymentsService.confirm(orderId);
  }
}