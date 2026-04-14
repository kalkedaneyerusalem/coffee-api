import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

type OrderItem = {
  productId: string;
  quantity: number;
};

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  customerName: string;

  @Column()
  customerEmail: string;

  @Column({ nullable: true })
  customerPhone?: string;

  @Column({ nullable: true })
  street?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ nullable: true })
  state?: string;

  @Column({ nullable: true })
  zipCode?: string;

  @Column({ nullable: true })
  carrier?: string;

  @Column({ nullable: true })
  trackingNumber?: string;

  @Column({ type: 'json' })
  items: OrderItem[];

  @Column({ default: 'pending' })
  status: 'pending' | 'paid' | 'shipped' | 'delivered';

  @Column()
  createdAt: string;
}