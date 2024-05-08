import { Component, ElementRef, ViewChild } from '@angular/core';
import { CartService } from '../shared/services/cart/localStorage.service';
import { ItemCart } from '../shared/services/cart/cart.model';

import { CreatePDFService } from '../shared/services/cart/createPDF.service';


@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent {
  cartProducts: ItemCart[] = [];
  selectedProducts: ItemCart[] = [];
  typeSelection = false;

  constructor(private cartService: CartService, private createPdfService: CreatePDFService) {
    this.cartService.changeCarts().subscribe(res => { this.cartProducts = res; });
  }
  getTotalSum(): string {
    let sum = 0;
    this.selectedProducts.forEach(res => {
      let newPrice = res.price * res.cuantity;
      sum += newPrice;
    })
    return sum.toFixed(2);
  }
  selectProduct(item: ItemCart) {
    if (this.typeSelection) {
      this.typeSelection = false;
    }
    if (item.checked) {
      this.selectedProducts.push(item);
    } else {
      let index = this.selectedProducts.indexOf(item);
      if (index != -1) {
        this.selectedProducts.splice(index, 1);
      }
    }
    console.log(this.selectedProducts)
  }
  selectAll() {
    if (this.typeSelection) {
      this.typeSelection = false;
      this.cartProducts.forEach(item => {
        item.checked = false;
      });
      this.selectedProducts = [];
    } else {
      this.typeSelection = true;
      this.cartProducts.forEach(item => {
        item.checked = true;
      });
      this.selectedProducts = this.cartProducts.slice();
    }

  }
  setQuantity(type: string, item: ItemCart) {
    if (type == 'm' && item.cuantity > 1) {
      item.cuantity--;
    } else if (type == 'p') {
      item.cuantity++;
    }
  }
  areAllSelected(): boolean {
    let itIs = true;
    this.cartProducts.forEach(item => {
      if (!item.checked)
        itIs = false;
    });
    return itIs;
  }

  SavePDF() {
    this.createPdfService.createAndDownloadPDF(this.selectedProducts);
  }
  removeItem(item: ItemCart) {
    this.cartService.removeItemFromStorage(item);
    this.cartService.changeCarts().subscribe(res => { this.cartProducts = res; });
    if (this.cartProducts.length == 1) {
      this.cartProducts = [];
    }
  }
  removeAll() {
    this.cartService.removeAll(this.selectedProducts);
    this.cartService.changeCarts().subscribe(res => { this.cartProducts = res; });
  }
}
