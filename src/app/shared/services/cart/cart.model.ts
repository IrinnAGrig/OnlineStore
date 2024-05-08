// export interface Purchase {
//     id: number;
//     personId: number;
//     listItems: Item[];
//     date: string;
// }
export interface Item {
    idProduct: string;
    type: string;
    size: string;
    cuantity: number;
}
export interface ItemCart {
    idProduct: string;
    image: string;
    price: number;
    name: string;
    type: string;
    size: string;
    cuantity: number;
    checked: boolean;
}