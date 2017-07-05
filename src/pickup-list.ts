import { autoinject, bindable } from 'aurelia-framework';
import { NetsuiteService } from './services/netsuite-service';
import { ApplicationState } from './application-state';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Router } from 'aurelia-router';


@autoinject
export class PickupList {
    @bindable inputField: string;
    loading: boolean = true;
    transactions: any[];
    statusMessage: string;

    constructor(public appState: ApplicationState, public netsuite: NetsuiteService, public eventAggregator: EventAggregator, public router: Router) {
        this.appState.pageHeader = 'Pickups';
    }


    attached(params, routeConfig) {
        this.netsuite.getPickupOrders().then((response) => {
            this.appState.checkAppVersion(response.appversion); // check for app version
            this.loading = false;
            console.log('response', response);
            if (response.success) {
                this.transactions = response.transactions;
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
            this.transactions = null;
            this.netsuite.getPickupOrders(newValue).then(response => {

                this.loading = false;
                console.log('response', response);
                if (response.success) {
                    if (response.transactions.length)
                        this.transactions = response.transactions;
                    else {
                        this.statusMessage = "Delivery Not Found"
                    }
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
