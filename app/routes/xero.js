import Route from '@ember/routing/route';
// import { mockData } from '../components/data';

export default class ApplicationRoute extends Route {
    async model() {
        const response = await fetch("http://localhost:8090/pims-accounts/fetchInvoices", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin',
        });
        const invoices = await response.json();
        return invoices;
    }
}