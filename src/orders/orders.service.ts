import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
     private readonly emailService: EmailService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.ordersRepository.create({
      id: randomUUID(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...createOrderDto,
    });

    return this.ordersRepository.save(order);
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);
    Object.assign(order, updateOrderDto);
    return this.ordersRepository.save(order);
  }

  async markAsPaid(id: string): Promise<Order> {
    const order = await this.findOne(id);
    order.status = 'paid';
    return this.ordersRepository.save(order);
  }

  async updateStatus(
    id: string,
    status: 'pending' | 'paid' | 'shipped' | 'delivered',
  ): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    return this.ordersRepository.save(order);
  }

  async shipOrder(
  id: string,
  carrier: string,
  trackingNumber: string,
): Promise<Order> {
  const order = await this.findOne(id);

  const alreadySameShipment =
    order.status === 'shipped' &&
    order.carrier === carrier &&
    order.trackingNumber === trackingNumber;

  if (alreadySameShipment) {
    return order;
  }

  order.carrier = carrier;
  order.trackingNumber = trackingNumber;
  order.status = 'shipped';

  const savedOrder = await this.ordersRepository.save(order);

  await this.emailService.sendShippingConfirmationEmail({
    customerEmail: savedOrder.customerEmail,
    customerName: savedOrder.customerName,
    orderId: savedOrder.id,
    carrier: savedOrder.carrier ?? carrier,
    trackingNumber: savedOrder.trackingNumber ?? trackingNumber,
  });

  return savedOrder;
}
  async remove(id: string): Promise<{ message: string }> {
    const order = await this.findOne(id);
    await this.ordersRepository.remove(order);
    return { message: 'Deleted successfully' };
  }
}