import { IsNotEmpty, IsString } from 'class-validator';

export class CreateStripeSessionDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;
}