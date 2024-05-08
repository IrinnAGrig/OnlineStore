import { ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router, UrlTree } from '@angular/router';
import { Category, Subcategory } from '../shared/services/store/store.model';
import { HttpClient } from '@angular/common/http';
import { StoreService } from '../shared/services/store/store.service';
import { Product } from '../shared/services/product/product.model';
import { ProductService } from '../shared/services/product/product.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.css']
})
export class StoreComponent {
  @ViewChild('choose_template_section') chooseTemplateSectionRef!: ElementRef;
  @ViewChild('choose_template_button') chooseTemplateButtonRef!: ElementRef;
  @ViewChild('choose_template_rating_section') chooseTemplateRatingSectionRef!: ElementRef;
  @ViewChild('choose_template_rating_button') chooseTemplateRatingButtonRef!: ElementRef;
  @ViewChild('choose_template_date_section') chooseTemplateDateSectionRef!: ElementRef;
  @ViewChild('choose_template_date_button') chooseTemplateDateButtonRef!: ElementRef;

  categories: Category[] = [];
  category: string | null = "";
  subcategory: string | null = "";
  subcategories: Subcategory[] | undefined = [];
  products: Product[] = [];
  userRole: string = "";
  userId: number = 0;

  searchForm: FormGroup;
  showDropdownFlag = false;
  historySearch: string[] = [];
  showTemplatePrice = false;
  showTemplateRating = false;
  showTemplateDate = false;
  minVal?: number;
  maxVal?: number;

  constructor(private activatedRoute: ActivatedRoute,
    private router: Router,
    private storeService: StoreService,
    private productService: ProductService,
    private changeDetectorRef: ChangeDetectorRef,
    private renderer: Renderer2) {
    let userDetailsString = localStorage.getItem('userDetails');
    let userDetails: any;
    if (userDetailsString) {
      userDetails = JSON.parse(userDetailsString);
    }
    this.userId = userDetails?.id;
    this.userRole = userDetails?.role;
    this.activatedRoute.paramMap.subscribe((params) => {
      this.productService.getCategories().subscribe(res => {
        this.categories = res;
        this.category = params.get('category');
        if (this.category) {
          if (this.category == 'no-category') {
            this.productService.getProductsWithoutCategory().subscribe(res => { this.products = res; this.subcategories = [] })
          } else if (this.category == 'no-subcategory') {
            this.productService.getProductsWithoutSubcategory().subscribe(res => { this.products = res; this.subcategories = [] })
          } else {
            let newCat = this.categories.find(cat => cat.category == this.category);
            this.subcategories = newCat?.subcategories;
            this.category = this.category.charAt(0).toUpperCase() + this.category.slice(1);

            this.subcategory = params.get('subcategory');

            if (this.subcategory) {
              this.subcategory = this.subcategory.charAt(0).toUpperCase() + this.subcategory.slice(1);
            }

            if (this.category && this.subcategory) {
              this.storeService.getProducts(this.category.toLowerCase(), this.subcategory).subscribe(res => {
                this.products = res;
              });
            } else if (this.category) {
              this.storeService.getProductsByCategory(this.category.toLowerCase()).subscribe(res => {
                this.products = res;
              });
            }
          }
        }


      })
    });
    this.searchForm = new FormGroup({
      search: new FormControl(""),
    });
    this.renderer.listen('window', 'click', (e: Event) => {
      if (e.target != this.chooseTemplateButtonRef.nativeElement) {
        this.showTemplatePrice = false;
        this.changeDetectorRef.detectChanges();
      }
    });
    this.renderer.listen('window', 'click', (e: Event) => {
      if (e.target != this.chooseTemplateRatingButtonRef.nativeElement && !this.chooseTemplateRatingSectionRef.nativeElement.contains(e.target)) {
        this.showTemplateRating = false;
        this.changeDetectorRef.detectChanges();
      }
    });
    this.renderer.listen('window', 'click', (e: Event) => {
      if (e.target != this.chooseTemplateDateButtonRef.nativeElement && !this.chooseTemplateDateSectionRef.nativeElement.contains(e.target)) {
        this.showTemplateDate = false;
        this.changeDetectorRef.detectChanges();
      }
    });
  }

  goToHome() {
    this.router.navigate(['/home']);
  }
  goToCategory() {
    this.router.navigate([`/store/${this.category?.toLowerCase()}`]);
  }
  goToSubcategory(subcat: string) {
    this.router.navigate([`/store/${this.category?.toLowerCase()}/${subcat}`]);
  }
  goToProduct(productId: string) {
    this.router.navigate([`/product/${productId}`]);
  }
  getFirstColorUrl(imageColors: { [key: string]: string }): string {
    const keys = Object.keys(imageColors);
    return keys.length > 0 ? imageColors[keys[0]] : '';
  }
  getLessText(text: string) {
    return text.slice(0, 50) + "...";
  }

  searchProduct(search?: string) {
    let value;
    if (search) {
      value = search;

      this.searchForm.get('search')?.setValue(search);
      this.showDropdownFlag = false;
    } else {
      value = this.searchForm.get('search')?.value.toLowerCase(); console.log(value)
    }


    if (value) {
      this.storeService.getProductsSearch(value).subscribe(res => { this.products = res })
      this.historySearch.reverse();

      if (this.historySearch.includes(value)) {
        let index = this.historySearch.indexOf(value);
        if (index !== -1) {
          this.historySearch.splice(index, 1);
          this.historySearch.push(value);
        }
      } else {
        this.historySearch.push(this.searchForm.get('search')?.value);
      }
      this.historySearch.reverse();
      if (this.historySearch.length > 7) {
        this.historySearch.pop();
      }
      localStorage.setItem('historySearch', JSON.stringify(this.historySearch));
    }
  }

  showDropdown() {
    let storage = localStorage.getItem('historySearch');
    if (storage) {
      let history = JSON.parse(storage);
      if (history && history.length > 0) {
        this.historySearch = history;
      }
    }
    this.showDropdownFlag = true;
  }
  filterByPrice() {
    if (this.category) {
      let Categ = this.categories.find(el => el.category == this.category?.toLowerCase());

      if (Categ && (this.minVal || this.maxVal)) {
        this.storeService.getPrductsByPrice(Categ.id, this.minVal ? this.minVal : 0, this.maxVal).subscribe(res => this.products = res);
        const navigationExtras: NavigationExtras = {
          queryParams: {
            price_min: this.minVal ? this.minVal : 0,
            price_max: this.maxVal
          }
        };
        this.router.navigate([], navigationExtras);
        this.showTemplatePrice = false;
      }
    }
  }
  sortByRating(typeSorting: string) {
    if (typeSorting === 'asc') {
      this.products.sort((a, b) => a.rating - b.rating);
    } else if (typeSorting === 'desc') {
      this.products.sort((a, b) => b.rating - a.rating);
    }
    this.showTemplateRating = false;
  }
  sortByDate(typeSorting: string) {
    if (typeSorting === 'asc') {
      this.products.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
    } else if (typeSorting === 'desc') {
      this.products.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateB.getTime() - dateA.getTime();
      });
    }
    this.showTemplateDate = false;
  }
}
