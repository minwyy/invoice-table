import Component from '@glimmer/component';
import { action, computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';



export default class InvoiceTableComponent extends Component {
    // triggers for displaying selected items
    @tracked showTransferIndicator = false;
    @tracked showNotTransferIndicator = false;
    @tracked showNotReconcileIndicator = false;
    sorts = [];
    selection = [];

    @action
    transferHandler () {
    	let data = this.selection;
    		// "[ {\"id\": null, \"invoiceNumber\": \"66666\", \"invoiceDate\": \"2020-03-12\", \"customerName\" : \"Benjamin Yeung\", \"invoiceAmount\": 1200.00,	 \"lines\": [	   { \"id\": null,	   \"itemDescription\": \"Water bottles\",	    \"taxCode\": null,	    \"qty\": 100.00,	    \"unitPrice\" : 12.00,	    \"amount\" : 1200.00	    }	  ]  } ]";
        // Update status of transferred via REST calls
        console.log(data);


        
        // Post data to backend server
    	let xhr = new XMLHttpRequest();
    	xhr.open("POST", "http://localhost:8080/pims-account/invoicesCreate");
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
        let rowList = this.args.rowlist;
        console.log(rowList);
        // filter transfered invoice
        if (this.showTransferIndicator) {
            rowList = rowList.filter( i => i.transferred == true);
            return rowList;
        } else if (this.showNotTransferIndicator) {
            rowList = rowList.filter( i => i.transferred != true);
            return rowList;
        } else if (this.showNotReconcileIndicator) {
            rowList= rowList.filter( i => i.reconciled != true);
            return rowList;
        } else {
            return rowList;
        }
    }
}