import { Injectable } from '@angular/core';
import { Item, ItemCart } from './cart.model';
import { ProductService } from '../product/product.service';
import { Observable, forkJoin, map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    cart: Item[] = [];

    constructor(private productService: ProductService) { }

    getCart(): Item[] {
        let storage = JSON.parse(localStorage.getItem('chart')!);
        if (storage) {
            this.cart = storage;
        } else {
            localStorage.setItem('chart', JSON.stringify([]));
            this.cart = [];
        }
        return this.cart;
    }

    setCart(data: Item): void {
        this.cart.push(data);
        localStorage.setItem('chart', JSON.stringify(this.cart));
    }
    changeCarts(): Observable<ItemCart[]> {
        let newCarts: ItemCart[] = [];
        const observables: Observable<void>[] = [];

        this.cart.forEach(cart => {
            let id = cart.idProduct;
            let newCart: ItemCart = {
                idProduct: id,
                image: '',
                price: 0,
                name: '',
                type: cart.type,
                size: cart.size,
                cuantity: cart.cuantity,
                checked: false
            };

            if (id) {
                observables.push(
                    this.productService.getProductById(id).pipe(
                        map(res => {
                            if (res) {
                                console.log(cart.type)
                                newCart.image = res.imageColors[cart.type];
                                newCart.name = res.nameProduct;
                                newCart.price = res.price;
                            }
                        })
                    )
                );
            }
            newCarts.push(newCart);
        });

        return forkJoin(observables).pipe(
            map(() => newCarts)
        );
    }
    removeItemFromStorage(item: ItemCart) {
        let found = this.cart.find(el => el.idProduct === item.idProduct && el.type === item.type);
        if (found) {
            let index = this.cart.indexOf(found);
            if (index !== -1) {
                this.cart.splice(index, 1);
            }
        }
        localStorage.setItem('chart', JSON.stringify(this.cart));
    }
    removeAll(items: ItemCart[]) {
        items.forEach(data => {
            let found = this.cart.find(el => el.idProduct === data.idProduct && el.type === data.type);
            if (found) {
                let index = this.cart.indexOf(found);
                if (index !== -1) {
                    this.cart.splice(index, 1);
                }
            }
        })
        localStorage.setItem('chart', JSON.stringify(this.cart));
    }
}