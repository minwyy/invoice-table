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
    @tracked errorReList = [];
    @tracked success = false;
    @tracked haveIssue = false;
    @tracked invoiceNumberId = new Object();
    @tracked connected = 'not connected to QB/Xero';
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

    set(key, value) {
        this.invoiceNumberId[key] = value;
        // Trigger a change
        this.invoiceNumberId = this.invoiceNumberId;
    }
    filterSelectedInvoices(invoiceNumber, filteredSelection) {
        for (let i = 0; i < filteredSelection.length; i++) {
            if (filteredSelection[i].invoiceNumber == invoiceNumber) {
                return true;
            }
        }
        return false;
    }

    updateImportedInvoicesTransferred(invoiceNumber, rowList) {
        for (let i = 0; i < rowList.length; i++) {
            if (rowList[i].invoiceNumber == invoiceNumber) {
                this.setTransferred(i);
                break;
            }
        }
    }

    updateImportedInvoicesReconciled(invoiceNumber, rowList) {
        for (let i = 0; i < rowList.length; i++) {
            if (rowList[i].invoiceNumber == invoiceNumber) {
                this.setReconciled(i);
                break;
            }
        }
    }
    
    setTransferred(i) {
        let newRow = {...this.rowList[i]};
        newRow.transferred = true;
        newRow.reconciled = false;
        this.rowList[i] = newRow;
    }

    setReconciled(i) {
        let newRow = {...this.rowList[i]};
        newRow.transferred = true;
        newRow.reconciled = true;
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
            this.haveIssue = false;
            this.errorList = [];
            this.errorReList = [];
            data.forEach((child) => {
                if (child.invoice) {
                    this.set(child.invoice.docNumber, child.invoice.id);
                }
                if (child.success == true) {
                    this.updateImportedInvoicesTransferred(child.invoiceVO.invoiceNumber, this.rowList);
                    console.log('Update relative invoiced status to "transferred"');
                    //TODO update invoices external status to "transfered" in polo database

                } else {
                    this.success = false;
                    this.haveIssue = true;
                    if (child.success == false) {
                        this.errorList.push(child)
                        this.method = 'not successfully transferred';
                    }
                }
            })
            this.changeAllIndicator();


        })
        .catch(error => {
            this.success = false;
            this.haveIssue = true;
            console.error('There has been a problem while posting invoices to QB/Xero: ', error);
            this.errorList = [];
            let invoiceFake = {
                invoiceVO: {
                    invoiceNumber: 'X'
                },
                errorMessage: 'Cannot connected to server.'
            };
            this.errorList.push(invoiceFake);
        });
    }

    @action
    reconcileHandler () {
        let readyToSendList = [...this.importedInvoices];
        readyToSendList = readyToSendList.filter(child => this.filterSelectedInvoices(child.invoiceNumber, this.selection));
        // Post data to backend server using helper
        this.postData('http://localhost:8080/pims-accounts/invoicesCompare', readyToSendList)
        .then(response => response.json())
        .then(data => {
            this.success = true;
            this.haveIssue = false;
            this.errorList = [];
            this.errorReList = [];
            
            data.forEach((child) => {
                if (child.invoice) {
                    this.set(child.invoice.docNumber, child.invoice.id);
                }
                if (child.success == true) {
                    this.updateImportedInvoicesReconciled(child.invoiceVO.invoiceNumber, this.rowList);
                    console.log('Update relative invoiced status to "reconciled"');
                    //TODO update invoices external status to "recounciled" in polo database if it was not recounciled

                } else {
                    this.success = false;
                    this.haveIssue = true;
                    if (child.success == false) {
                        this.method = 'not successfully reconciled';
                        this.errorList.push(child);
                        if (child.invoiceVO.externalStatus === 'RECONCILED') {
                            this.errorReList.push(child);
                            // this.updateImportedInvoicesTransferred(child.invoiceVO.invoiceNumber, this.rowList);
                            // console.log('Update relative invoiced status from "reconciled" to "transferred"');
                        } 
                    }
                }
            })
            this.changeAllIndicator();



        })
        .catch(error => {
            this.success = false;
            this.haveIssue = true;
            console.error('There has been a problem while posting invoices to QB/Xero: ', error);
            this.errorList = [];
            let invoiceFake = {
                invoiceVO: {
                    invoiceNumber: 'X'
                },
                errorMessage: 'Cannot connected to server.'
            };
            this.errorList.push(invoiceFake);
        });

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
                    if (child.externalStatus === 'RECONCILED') {
                        row.transferred = true;
                        row.reconciled = true;
                    } else if (child.externalStatus === 'TRANSFERED') {
                        row.transferred = true;
                        row.reconciled = false;
                    } else {
                        row.transferred = false;
                        row.reconciled = false;
                    }
                    row.accounts = row.transferred;
                    this.rowList.push(row);
                }
            }
        )}
        // filter transferred invoice
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
            // console.log(displayList);
            return displayList;
        }
    }
}