import { Component } from '@angular/core';
import { ProductService } from '../shared/services/product/product.service';
import { Comment, CommentModified, Product } from '../shared/services/product/product.model';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Category, Subcategory } from '../shared/services/store/store.model';
import { CartService } from '../shared/services/cart/localStorage.service';
import { Item } from '../shared/services/cart/cart.model';

interface ImageColor {
  color: string;
  url: string;
}

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent {
  product: Product | null = null;
  currentSelection: ImageColor = { color: "", url: "" };

  comments: CommentModified[] = [];
  images: ImageColor[] = [];
  categories: Category[] = [];
  displayedComments: CommentModified[] = [];

  commentForm: FormGroup;
  productForm: FormGroup;

  displayedImage = 0;
  currentPositionPage = 0;
  itemsPerPage = 3;
  showAddingComment = false;
  userRole: string = "";
  userId: number = 0;
  error = true;
  editMode = false;


  constructor(private productService: ProductService, private route: ActivatedRoute, private location: Location, private router: Router, private cartService: CartService) {
    let userDetailsString = localStorage.getItem('userDetails');
    let userDetails: any;
    if (userDetailsString) {
      userDetails = JSON.parse(userDetailsString);
    }
    this.userId = userDetails?.id;
    this.userRole = userDetails?.role;
    this.route.params.subscribe(params => {
      const id = params['idProd'];
      if (id) {
        this.productService.getProductById(id).subscribe(res => {
          this.product = res;
          if (this.product) {
            this.productService.getModifiedComments(this.product.comments)
              .subscribe(comments => {
                if (comments) {
                  this.comments = comments;
                  this.displayedComments = Object.values(this.comments.slice(this.currentPositionPage, this.itemsPerPage));
                } else {
                  console.error('Failed to fetch modified comments.');
                }
              });
          }
        })
      } else {
        this.product = {
          id: '',
          idCategory: 0,
          idSubCategory: 0,
          nameProduct: "",
          imageColors: {},
          rating: 0,
          description: "",
          price: 0,
          date: "",
          numberRaters: 0,
          buyers: 0,
          comments: []
        }

      }

    });
    this.productService.getCategories().subscribe(res => this.categories = res);
    this.commentForm = new FormGroup({
      rating: new FormControl(1, Validators.required),
      comment: new FormControl("", Validators.required),
    });
    this.productForm = new FormGroup({
      name: new FormControl("", Validators.required),
      price: new FormControl(0, Validators.required),
      description: new FormControl("", Validators.required),
      category: new FormControl(0, Validators.required),
      subcategory: new FormControl(0, Validators.required),
    });

  }
  getFirstColorUrl(imageColors: { [key: string]: string }): string {
    const keys = Object.keys(imageColors);
    return keys.length > 0 ? imageColors[keys[this.displayedImage]] : '';
  }
  getColorImage(imageColors: { [key: string]: string }): string {
    const keys = Object.values(imageColors);
    return keys.length > 0 ? imageColors[keys[this.displayedImage]] : '';
  }

  selectTypeProduct(imageColors: ImageColor) {
    this.currentSelection = imageColors;
    this.error = true;
  }
  getImages(): ImageColor[] {
    if (this.product) {
      return Object.keys(this.product.imageColors).map((key: string) => {
        if (this.product)
          return {
            color: key,
            url: this.product.imageColors[key]
          };
        else {
          return { url: "", color: "" }
        }
      });
    } else {
      return [];
    }
  }

  goBack() {
    this.location.back();
  }
  goNext() {
    this.currentPositionPage += this.itemsPerPage;
    this.displayedComments = Object.values(this.comments.slice(this.currentPositionPage, this.currentPositionPage + this.itemsPerPage));
  }
  goPreviuos() {
    this.currentPositionPage -= this.itemsPerPage;
    this.displayedComments = Object.values(this.comments.slice(this.currentPositionPage, this.currentPositionPage + this.itemsPerPage));
  }
  setRating(rate: number) {
    (this.commentForm.get('rating') as FormControl).patchValue(rate);
    console.log(this.commentForm.get('rating')?.value)
  }
  showAddComment() {
    this.commentForm.reset();
    this.showAddingComment = !this.showAddingComment;
  }
  submitComment() {
    if (this.commentForm.valid) {
      let comment: Comment = {
        id: 0,
        personId: this.userId,
        comment: this.commentForm.get('comment')?.value,
        date: new Date().getDate().toString(),
        size: "",
        rating: this.commentForm.get('rating')?.value,
      }
      this.product?.comments.push(comment);
      let rating = 0;
      let index = 0;
      this.product?.comments.forEach(com => {
        rating += com.rating;
        index++;
      })

      if (this.product) {
        this.product.rating = parseFloat((rating / index).toFixed(1));
        this.product.numberRaters = index;
        this.productService.addComment(this.product).subscribe(() => {
          if (this.product)
            this.productService.getComments(Number(this.product?.id)).subscribe(res => {
              this.productService.getModifiedComments(res)
                .subscribe(comments => {
                  if (comments) {
                    this.comments = comments;
                    this.displayedComments = Object.values(this.comments.slice(this.currentPositionPage, this.itemsPerPage));
                  }
                  this.showAddComment();
                });
            })
        })
      }
    }
  }


  convertToBase64(event: any): void {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const base64String: string = reader.result as string;
      let data: ImageColor = {
        url: base64String,
        color: ""
      }
      this.images.push(data);
    };
    if (file)
      reader.readAsDataURL(file);
  }

  changeColor(index: number, event: any) {
    this.images[index].color = event.target.value;
  }
  onCategoryChange(): Subcategory[] {
    let value = this.productForm.get('category')?.value;
    let cat = this.categories.find(el => el.id == value)?.subcategories;
    return cat ? cat : [];
  }

  submitProduct() {

    if (this.product) {
      this.product.idCategory = Number(this.productForm.get('category')?.value);
      this.product.idSubCategory = Number(this.productForm.get('subcategory')?.value);
      this.product.price = this.productForm.get('price')?.value;
      this.product.nameProduct = this.productForm.get('name')?.value;
      this.product.description = this.productForm.get('description')?.value;
      const imageColors: { [color: string]: string } = this.images.reduce((acc, imageColor) => {
        acc[imageColor.color] = imageColor.url;
        return acc;
      }, {} as { [color: string]: string });
      this.product.imageColors = imageColors;
      if (this.editMode) {
        this.product.date = this.product.date;
        this.productService.editProduct(this.product).subscribe(() => {
          window.location.reload();
        })
      } else {
        let id = Math.floor(Math.random() * (1000 - 22 + 1)) + 22;
        this.product.id = id.toString();
        this.product.date = new Date().getDate().toString();
        this.productService.addProduct(this.product).subscribe(() => {
          this.router.navigate(['/product', id]);
        })
      }

    }
  }

  addToChart() {
    if (this.currentSelection.color) {
      if (this.product) {
        let data: Item = {
          idProduct: this.product.id.toString(),
          size: '',
          type: this.currentSelection.color,
          cuantity: 1

        }
        this.cartService.setCart(data);
      }
    } else {
      this.error = false;
    }
  }
  deleteImage(image: ImageColor) {
    const index = this.images.findIndex(img => img === image);
    if (index !== -1) {
      this.images.splice(index, 1); // Removes one element at the found index
    }
  }

  deleteProduct() {
    let data = confirm('Are you sure you want to delete this product?');
    if (data && this.product) {
      this.productService.deleteProduct(this.product.id).subscribe(() => {
        this.location.back();
      });
    }
  }
  enterEditMode() {
    this.editMode = true;
    this.images = this.getImages();
    this.productForm.setValue({
      name: this.product?.nameProduct,
      price: this.product?.price,
      description: this.product?.description,
      category: this.product?.idCategory,
      subcategory: this.product?.idSubCategory
    });
    console.log(this.categories)
  }
}
