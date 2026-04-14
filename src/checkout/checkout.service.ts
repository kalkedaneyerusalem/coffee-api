import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { ProductsService } from '../products/products.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
  ) {}

  async create(createCheckoutDto: CreateCheckoutDto) {
    const detailedItems = await Promise.all(
      createCheckoutDto.items.map(async (item) => {
        const product = await this.productsService.findOne(item.productId);

        if (!product.inStock) {
          throw new BadRequestException(`${product.name} is out of stock`);
        }

        return {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: item.quantity,
          lineTotal: product.price * item.quantity,
        };
      }),
    );

    const subtotal = detailedItems.reduce(
      (sum, item) => sum + item.lineTotal,
      0,
    );

    const order = await this.ordersService.create({
      customerName: createCheckoutDto.customerName,
      customerEmail: createCheckoutDto.customerEmail,
      customerPhone: createCheckoutDto.customerPhone,
      street: createCheckoutDto.street,
      city: createCheckoutDto.city,
      state: createCheckoutDto.state,
      zipCode: createCheckoutDto.zipCode,
      items: createCheckoutDto.items,
    });

    return {
      message: 'Checkout completed',
      orderId: order.id,
      items: detailedItems,
      subtotal,
      total: subtotal,
      status: order.status,
      createdAt: order.createdAt,
    };
  }
}