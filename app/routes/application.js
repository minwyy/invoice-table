import Route from '@ember/routing/route';
import { mockData } from '../components/data';

export default class ApplicationRoute extends Route {
    async model() {
        let rawInvoices = [...mockData];
        return rawInvoices;
    }
}