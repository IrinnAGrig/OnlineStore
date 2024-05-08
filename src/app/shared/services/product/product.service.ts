import { Injectable } from "@angular/core";
import { HttpClient, } from "@angular/common/http";
import { catchError, concatMap, forkJoin, from, map, Observable, of, switchMap, take, tap, toArray } from "rxjs";
import { CommentModified, Product, Comment } from "../product/product.model";
import { UserDetails } from "../auth/auth.model";
import { Category, Subcategory } from "../store/store.model";

@Injectable({
    providedIn: 'root',
})
export class ProductService {
    productsUrl = '../../assets/data/products.json';
    categories: Category[] = [];
    constructor(private http: HttpClient) {
        this.getCategories().subscribe(res => this.categories = res);
    }
    getProductById(id: number | string): Observable<Product | null> {
        return this.http.get<Product>(`http://localhost:3000/products/${id.toString()}`).pipe(
            map(product => product ? product : null),
        );
    }
    getModifiedComments(com: Comment[]): Observable<CommentModified[]> {
        return from(com).pipe(
            concatMap(element =>
                this.http.get<UserDetails>(`http://localhost:3000/users/${element.personId}`).pipe(
                    map(res => ({
                        id: element.id,
                        personId: element.personId,
                        personImage: res ? res.image : '',
                        personName: res ? res.fullName : '',
                        rating: element.rating,
                        size: element.size,
                        date: element.date,
                        comment: element.comment
                    })),
                    take(1) // Take only one emitted value from the observable
                )
            ),
            toArray()
        );
    }
    addComment(product: Product): Observable<boolean> {
        return this.http.put<boolean>(`http://localhost:3000/products/${product.id}`, product);
    }
    getComments(idProduct: number): Observable<Comment[]> {
        return this.http.get<Comment[]>(`http://localhost:3000/products/${idProduct}`).pipe(map((response: any) => response.comments));
    }
    getCategories(): Observable<Category[]> {
        return this.http.get<Category[]>(`http://localhost:3000/categories`);
    }
    addProduct(prod: Product): Observable<boolean> {
        return this.http.post<boolean>(`http://localhost:3000/products`, prod);
    }
    editProduct(prod: Product): Observable<boolean> {
        return this.http.put<boolean>(`http://localhost:3000/products/${prod.id}`, prod);
    }
    deleteProduct(prodId: string): Observable<boolean> {
        return this.http.delete<boolean>(`http://localhost:3000/products/${prodId}`,);
    }
    addCategory(cat: Category): Observable<boolean> {
        return this.http.post<boolean>(`http://localhost:3000/categories`, cat);
    }
    editCategory(cat: Category): Observable<boolean> {
        return this.http.put<boolean>(`http://localhost:3000/categories/${cat.id}`, cat);
    }
    deleteCategory(cat: Category): Observable<boolean> {

        return this.http.delete<boolean>(`http://localhost:3000/categories/${cat.id}`).pipe(
            switchMap((deleteResult) => {
                return this.http.get<Product[]>(`http://localhost:3000/products?idCategory=${cat.id}`).pipe(
                    switchMap(products => {
                        const editProductRequests = products.map(product => {
                            product.idCategory = 0;
                            return this.editProduct(product);
                        });
                        return forkJoin(editProductRequests);
                    }),
                    map(() => true),
                    catchError(error => {
                        console.error("Error fetching products:", error);
                        return of(false);
                    })
                );
            }),
            catchError(error => {
                console.error("Error deleting category:", error);
                return of(false);
            })
        );
    }
    deleteSubcategory(cat: Category, subcat: Subcategory): Observable<boolean> {
        return this.editCategory(cat).pipe(
            switchMap(() => {
                return this.http.get<Product[]>(`http://localhost:3000/products?idSubCategory=${subcat.id}`).pipe(
                    switchMap(products => {
                        const editProductRequests = products.map(product => {
                            product.idSubCategory = 0;
                            return this.editProduct(product);
                        });
                        return forkJoin(editProductRequests);
                    }),
                    map(() => true),
                    catchError(error => {
                        console.error("Error fetching products:", error);
                        return of(false);
                    })
                );
            }),
            catchError(error => {
                console.error("Error editing category:", error);
                return of(false);
            })
        );
    }
    getProductsWithoutCategory(): Observable<Product[]> {
        return this.http.get<Product[]>(`http://localhost:3000/products?idCategory=0`);
    }
    getProductsWithoutSubcategory(): Observable<Product[]> {
        return this.http.get<Product[]>(`http://localhost:3000/products?idSubCategory=0`);
    }
}