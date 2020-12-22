import Component from '@glimmer/component';


export default class AccountLinkComponent extends Component {

    get invoiceId() {
        return this.args.dict[this.args.invoiceNumber]
    }

    get quickbooks() {
        if (this.args.provider == 'xero') {
            return false;
        } else {
            return true;
        }
    }
} 