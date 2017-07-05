import { autoinject, bindable } from 'aurelia-framework';
import { NetsuiteService } from './services/netsuite-service';
import { ApplicationState } from './application-state';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Router } from 'aurelia-router';

@autoinject
export class Delivery {
    @bindable inputField: string;
    loading: boolean = true;
    deliveries: any[];
    statusMessage: string;

    constructor(public appState: ApplicationState, public netsuite: NetsuiteService, public eventAggregator: EventAggregator, public router: Router) {
        this.appState.pageHeader = 'Delivery';
    }

    attached(params, routeConfig) {
        this.netsuite.getDeliveries().then((response) => {
            console.log('response', response);
            this.appState.checkAppVersion(response.appversion);
            this.loading = false;
            if (response.success) {
                this.deliveries = response.deliveries;
            }
        }).catch(error => {
            this.statusMessage = "System Error"
            this.loading = false;
        });
    }

    inputFieldChanged(newValue: string) {
        console.log(newValue);
        var includesPrefix = ((newValue[0] == 'S' || newValue[0] == 's') && (newValue[1] == 'O' || newValue[1] == 'o'));
        if ((!includesPrefix && newValue.length == 6) || (includesPrefix && newValue.length == 8)) {
            this.loading = true;
            this.statusMessage = "";
            this.deliveries = null;
            this.netsuite.getDeliveries(newValue).then(response => {
                this.loading = false;
                console.log('response', response);
                if (response.success) {
                    if (response.deliveries.length == 1) this.router.navigateToRoute('delivery-detail', { id: response.deliveries[0].id });
                    else if (response.deliveries.length) this.deliveries = response.deliveries;
                    else this.statusMessage = "Delivery Not Found";
                }
                else {
                    this.statusMessage = "Delivery Not Found"
                }
            }).catch(error => {
                this.statusMessage = "Network Error"
                this.loading = false;
            });

        }
    }

}
