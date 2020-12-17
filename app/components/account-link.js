import Component from '@glimmer/component';

export default class AccountLinkComponent extends Component {
    get invoiceId() {
        return this.args.dict[this.args.invoiceNumber]
    }
} 