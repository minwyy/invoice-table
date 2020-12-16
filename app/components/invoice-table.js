import Component from '@glimmer/component';
import { action, computed } from '@ember/object';
import { tracked } from '@glimmer/tracking';



export default class InvoiceTableComponent extends Component {
    // triggers for displaying selected items
    @tracked showTransferIndicator = false;
    @tracked showNotTransferIndicator = false;
    @tracked showNotReconcileIndicator = false;
    @tracked rowList = [];
    @tracked errorList = [];
    @tracked success = false;
    @tracked haveIssue = false;
    sorts = [];
    selection = [];
    importedInvoices = [];
    method = '';
    errorMSG = '';

    
    // Helper to post selected invoices to QB/Xero servers
    async postData(url, data) {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
            body: JSON.stringify(data)
        });
        return response;
    }

    filterSelectedInvoices(invoiceNumber, filteredSelection) {
        for (let i = 0; i < filteredSelection.length; i++) {
            if (filteredSelection[i].invoiceNumber == invoiceNumber) {
                return true;
            }
        }
        return false;
    }

    updateImportedInvoices(invoiceNumber, rowList) {
        for (let i = 0; i < rowList.length; i++) {
            if (rowList[i].invoiceNumber == invoiceNumber) {
                this.setTransferred(i);
                break;
            }
        }
    }

    setTransferred(i) {
        let newRow = {...this.rowList[i]};
        newRow.transferred = true;
        this.rowList[i] = newRow;
    }

    @action 
    transferHandler () {
        let filteredSelection = this.selection.filter(child => child.transferred == false);
        let readyToSendList = [...this.importedInvoices];
        readyToSendList = readyToSendList.filter(child => this.filterSelectedInvoices(child.invoiceNumber, filteredSelection));
        // Post data to backend server using helper
        this.postData('http://localhost:8080/pims-accounts/invoicesCreate', readyToSendList)
        .then(response => response.json())
        .then(data => {
            this.success = true;
            this.errorList = [];
            data.forEach((child) => {
                if (child.success == true) {
                    this.updateImportedInvoices(child.invoiceVO.invoiceNumber, this.rowList);
                    console.log('Update relative invoiced status to "transfered"');
                } else {
                    this.errorList.push(child)
                    this.success = false;
                    this.haveIssue = true;
                }
            })
            this.selection = [];
            this.method = 'failed to transfer';
            this.changeAllIndicator();
            

            //TODO update invoices in polo database

        })
        .catch(error => {
            console.error('There has been a problem while posting invoices to QB/Xero: ', error);
        });
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
        window.open("http://localhost:8080/pims-accounts/quickbooks/connect");
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
        this.importedInvoices = this.args.rawInvoices;
        if (this.args.rawInvoices.length != this.rowList.length) {
            this.rowList = [];
            this.importedInvoices.forEach((child) => {
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
                    this.rowList.push(row);
                }
            }
        )}
        // filter transfered invoice
        let displayList = [];
        displayList = [...this.rowList];
        if (this.showTransferIndicator) {
            displayList = this.rowList.filter( i => i.transferred == true);
            return displayList;
        } else if (this.showNotTransferIndicator) {
            displayList = this.rowList.filter( i => i.transferred != true);
            return displayList;
        } else if (this.showNotReconcileIndicator) {
            displayList= this.rowList.filter( i => i.reconciled != true);
            return displayList;
        } else {
            console.log(displayList);
            return displayList;
        }
    }
}