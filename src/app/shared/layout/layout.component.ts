import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Category, Subcategory } from '../services/store/store.model';
import { Route, Router } from '@angular/router';
import { UserDetails } from '../services/auth/auth.model';
import { AuthService } from '../services/auth/auth.service';
import { ProductService } from '../services/product/product.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CartService } from '../services/cart/localStorage.service';
import { Item } from '../services/cart/cart.model';


@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {

  categories: Category[] = [];
  showDropdown = false;
  user: UserDetails | null = null;
  showCategoryForm = false;
  selectedCategory = "";
  form: FormGroup;
  subcategoryForm: FormGroup;
  editMode = false;
  cart: Item[] = [];

  constructor(private router: Router, private authService: AuthService, private productService: ProductService, private storageService: CartService) {
    this.authService.userDetails.subscribe(res => {
      this.user = res;
    });
    this.getCategories();
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      path: new FormControl('', Validators.required)
    });
    this.subcategoryForm = new FormGroup({
      name: new FormControl('', Validators.required)
    });
    this.cart = this.storageService.getCart();
  }

  getCategories() {
    this.productService.getCategories().subscribe(res => this.categories = res);
  }

  navigateTo(category: string, subcat: string) {
    this.router.navigate([`/store/${category}/${subcat.toLowerCase()}/`]);
    this.showDropdown = false;
  }
  deleteCategory(cat: Category) {
    let conf = confirm('Are you sure you want to delete category:' + cat.name);
    if (conf)
      this.productService.deleteCategory(cat).subscribe(() => this.getCategories());
  }
  deleteSubcategory(cat: Category, subcat: Subcategory) {
    let conf = confirm('Are you sure you want to delete subcategory: ' + subcat.name);
    if (conf) {
      const index = cat.subcategories.indexOf(subcat);
      if (index !== -1) {
        cat.subcategories.splice(index, 1);
        this.productService.deleteSubcategory(cat, subcat).subscribe(() => this.getCategories())
      }
    }

  }
  navigateToStore(category: string) {
    this.router.navigate([`/store/${category}`]);
    this.showDropdown = false;
  }
  createProduct() {
    this.router.navigate([`/product/add-new-product`]);
  }
  showFormCategory() {
    this.showCategoryForm = !this.showCategoryForm;
  }
  submitForm() {
    let category: Category = {
      id: (Math.floor(Math.random() * (1000 - 22 + 1)) + 22).toString(),
      name: this.form.get('name')?.value,
      category: this.form.get('path')?.value,
      subcategories: []
    }
    this.productService.addCategory(category).subscribe(() => this.getCategories());
    this.showCategoryForm = false;
    this.form.reset();
  }
  submitSubcategoryForm(cat: Category) {
    let category: Subcategory = {
      id: (Math.floor(Math.random() * (1000 - 22 + 1)) + 22).toString(),
      name: this.subcategoryForm.get('name')?.value
    }
    cat.subcategories.push(category);
    console.log(cat);
    this.productService.editCategory(cat).subscribe(() => this.getCategories());
    this.selectedCategory = "";
    this.subcategoryForm.reset();
  }
  enterEditMode() {
    this.editMode = !this.editMode;
  }
  getProductsWthoutCategory() {
    this.router.navigate([`/store/${'no-category'}`]);
    this.showDropdown = false;
  }
  getProductsWthoutSubcategory() {
    this.router.navigate([`/store/${'no-subcategory'}`]);
    this.showDropdown = false;
  }
}

