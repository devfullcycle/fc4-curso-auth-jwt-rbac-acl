import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Cart } from './Cart';
import { Product } from './Product';

@Entity()
export class CartProduct {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Cart, cart => cart.cartProducts)
    cart: Cart;

    @ManyToOne(() => Product, product => product.cartProducts)
    product: Product;

    @Column()
    quantity: number;
}
