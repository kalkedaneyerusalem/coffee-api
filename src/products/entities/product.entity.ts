import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ default: true })
  inStock: boolean;

  @Column({ nullable: true })
  category?: string;
}