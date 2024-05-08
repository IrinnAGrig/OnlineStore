import { Injectable } from '@angular/core';
import { ItemCart } from './cart.model';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { borderBottomStyle } from 'html2canvas/dist/types/css/property-descriptors/border-style';

@Injectable({
    providedIn: 'root'
})
export class CreatePDFService {

    constructor() { }

    createAndDownloadPDF(items: ItemCart[]) {
        const pdf = new jsPDF();

        const columns = ['Nr', 'Image', 'Name', 'Type', 'Quantity', 'Price'];

        const rows = items.map((item, index) => {
            const img = new Image();
            img.src = item.image;

            return [
                index + 1,
                { image: img, width: 20 },
                item.name,
                item.type,
                item.cuantity,
                Math.floor(item.price * item.cuantity) + ' MDL'
            ];
        });

        const text = "Your purchase";
        const textWidth = pdf.getTextWidth(text);
        const textX = (pdf.internal.pageSize.getWidth() - textWidth) / 2;
        const textY = 20;
        pdf.text(text, textX, textY);

        const tableY = textY + 10;

        (pdf as any).autoTable({
            head: [columns],
            body: rows,
            startY: tableY,
            theme: 'plain',
            styles: {
                cellPadding: 7,
                borderBottomStyle: 'solid',
                valign: 'middle',
            },
            didDrawCell: (data: any) => {
                if (data.column.index === 1 && typeof data.cell.raw === 'object') {
                    const imgData = data.cell.raw.image.src;
                    pdf.addImage(imgData, data.cell.x, data.cell.y + 3, 20, 20);
                }
            }
        });

        const totalSum = items.reduce((acc, item) => acc + (item.price * item.cuantity), 0);
        const footerY = (pdf as any).lastAutoTable.finalY + 10;
        let text1 = 'Total:   ' + totalSum.toFixed(2) + ' MDL';
        pdf.text(text1, pdf.internal.pageSize.getWidth() / 2 + text1.length + 15, footerY, { align: 'left' });

        pdf.save('cart.pdf');
    }

}