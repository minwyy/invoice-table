import Route from '@ember/routing/route';
import { mockData } from '../components/data';

export default class ApplicationRoute extends Route {
    async model() {
        let rawData = [...mockData];
        let rowList = [];
        rawData.forEach((child) => {
            if (child.canSendToExternal) {
                let row = new Object();
                row.invoiceNumber = child.invoiceNumber;
                row.customerName = child.customerName;
                row.invoiceDate = child.invoiceDate.substring(0, 10);
                row.invoiceAmount = child.amountIncludingTax;
                if (child.externalStatus == 'RECONCILED') {
                    row.transferred = true;
                    row.reconciled = true;
                } else if (child.externalStatus == 'TRANSFERED') {
                    row.transferred = true;
                    row.reconciled = false;
                } else {
                    row.transferred = false;
                    row.reconciled = false;
                }
                row.accounts = row.reconciled;
                rowList.push(row);
            }
        }
        )
        return rowList;
    }
}