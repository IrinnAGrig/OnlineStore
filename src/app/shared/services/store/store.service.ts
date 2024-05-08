import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { BehaviorSubject, catchError, filter, map, Observable, switchMap, tap, throwError } from "rxjs";

import { Product } from "../product/product.model";
import { ProductService } from "../product/product.service";
import { Category } from "./store.model";

@Injectable({
    providedIn: 'root',
})
export class StoreService {
    productsUrl = '../../assets/data/products.json';
    categories: Category[] = [];
    constructor(private http: HttpClient, private productService: ProductService) {
        this.getCategories();
    }
    getCategories() {
        this.productService.getCategories().subscribe(res => this.categories = res);
    }
    getProducts(cat: string, subcat: string): Observable<Product[]> {

        let category = this.categories.find(data => data.category == cat);
        let idSubCat = category?.subcategories.find(data => data.name.toLowerCase() == subcat.toLowerCase())?.id;
        return this.http.get<Product[]>(`http://localhost:3000/products?idCategory=${category?.id}&idSubCategory=${idSubCat}`);
    }
    getProductsByCategory(cat: string): Observable<Product[]> {

        let category = this.categories.find(data => data.category == cat);
        return this.http.get<Product[]>(`http://localhost:3000/products?idCategory=${category?.id}`);
    }
    getProductsSearch(search: string): Observable<Product[]> {
        return this.http.get<Product[]>(`http://localhost:3000/products`).pipe(
            map(products => {
                return products.filter(product => product.nameProduct.toLocaleLowerCase().includes(search));
            }));
    }
    getPrductsByPrice(category: string, minVal?: number, maxVal?: number): Observable<Product[]> {
        let route = "";
        if (maxVal) {
            route = `price_gte=${minVal}&price_lte=${maxVal}`;
        } else {
            route = `price_gte=${minVal}`;
        }
        return this.http.get<Product[]>(`http://localhost:3000/products?idCategory=${category}&${route}`);
    }
}