import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Patch('status/:id')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'pending' | 'paid' | 'shipped' | 'delivered',
  ) {
    return this.ordersService.updateStatus(id, status);
  }

  @Patch('ship/:id')
  ship(
    @Param('id') id: string,
    @Body('carrier') carrier: string,
    @Body('trackingNumber') trackingNumber: string,
  ) {
    return this.ordersService.shipOrder(id, carrier, trackingNumber);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}