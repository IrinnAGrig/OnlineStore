export interface Product {
    id: string;
    idCategory: number;
    idSubCategory: number;
    nameProduct: string;
    imageColors: { [color: string]: string };
    rating: number;
    description: string;
    date: string;
    price: number;
    numberRaters: number;
    buyers: number;
    comments: Comment[];
}
export interface Comment {
    id: number;
    personId: number;
    comment: string;
    date: string;
    size: string;
    rating: number;
}
export interface CommentModified {
    id: number;
    personId: number;
    personName: string;
    personImage: string;
    comment: string;
    date: string;
    size: string;
    rating: number;
}

