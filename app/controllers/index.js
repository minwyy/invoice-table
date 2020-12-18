import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class IndexController extends Controller {
    @action
    connectQB () {
        window.open("http://localhost:8090/pims-accounts/quickbooks/connect");
    };

    @action
    connectXero () {
        window.open("http://localhost:8090/pims-accounts/xero/connect");
    };
}
