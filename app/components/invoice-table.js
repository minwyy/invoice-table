import Component from '@glimmer/component';
import { action, computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { mockData } from '../components/data';


export default class InvoiceTableComponent extends Component {
    // triggers for displaying selected items
    @tracked showTransferIndicator = false;
    @tracked showNotTransferIndicator = false;
    @tracked showNotReconcileIndicator = false;
    sorts = [];
    selection = [];

    @action
    transferHandler () {
    	let data = selection;
    		// "[ {\"id\": null, \"invoiceNumber\": \"66666\", \"invoiceDate\": \"2020-03-12\", \"customerName\" : \"Benjamin Yeung\", \"invoiceAmount\": 1200.00,	 \"lines\": [	   { \"id\": null,	   \"itemDescription\": \"Water bottles\",	    \"taxCode\": null,	    \"qty\": 100.00,	    \"unitPrice\" : 12.00,	    \"amount\" : 1200.00	    }	  ]  } ]";
        // Update status of transferred via REST calls



        
        // Post data to backend server
    	let xhr = new XMLHttpRequest();
    	xhr.open("POST", "http://localhost:5001/invoicesCreate");
        xhr.setRequestHeader("Content-Type", "application/json");
    	//xhr.setRequestHeader("Content-Type", "text/plain");

        xhr.send(data);

    }

    @action
    reconcileHandler () {
        

    }

    @action
    searchHandler () {

    }

    @action
    changeTransferIndicator () {
        this.showTransferIndicator = true;
        this.showNotTransferIndicator = false;
        this.showNotReconcileIndicator = false;
    };

    @action
    changeNotTransferIndicator () {
        this.showNotTransferIndicator = true;
        this.showTransferIndicator = false;
        this.showNotReconcileIndicator = false;
    };

    @action
    changeNotReconcileIndicator () {
        this.showNotReconcileIndicator = true;
        this.showTransferIndicator = false;
        this.showNotTransferIndicator = false;
    };

    @action
    changeAllIndicator () {
        this.showTransferIndicator = false;
        this.showNotTransferIndicator = false;
        this.showNotReconcileIndicator = false;
    };

    @action
    connectQB () {
        window.open("http://localhost:5001/quickbooks/connect");
    };

    @action
    connectXero () {
        window.open("http://localhost:5001/xero/connect");
    };

    @computed
    get columns() {
        return [
            { name: 'Invoice No.', valuePath: 'invoiceNumber', isFixed: 'left'},
            { name: 'Client', valuePath: 'customerName', width: 200 },
            { name: 'Invoice Date', valuePath: 'invoiceDate', width: 150 },
            { name: 'Total Inc. Tax', valuePath: 'invoiceAmount'},
            { name: 'Transferred', valuePath: 'transferred', cellComponent: 'icon'},
            { name: 'Reconciled', valuePath: 'reconciled', cellComponent: 'icon'},
            { name: 'Accounts', valuePath: 'accounts', cellComponent: 'account-link'}
        ];
      };
    
    @computed('showTransferIndicator', 'showNotTransferIndicator', 'showNotReconcileIndicator')
    get rows() {
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
        // filter transfered invoice
        if (this.showTransferIndicator) {
            data.rows = data.rows.filter( i => t.includes( i.transferred ))
            return data.rows
        } else if (this.showNotTransferIndicator) {
            data.rows = data.rows.filter( i => f.includes( i.transferred ))
            return data.rows
        } else if (this.showNotReconcileIndicator) {
            data.rows = data.rows.filter( i => f.includes( i.reconciled ))
            return data.rows
        } else {
            return rowList
        }
    }
}