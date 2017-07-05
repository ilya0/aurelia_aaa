import { autoinject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { NetsuiteService } from './services/netsuite-service';
import { ApplicationState } from './application-state';
import { EventAggregator } from 'aurelia-event-aggregator';

@autoinject
export class Home {

    constructor(public appState: ApplicationState, public netsuite: NetsuiteService, public eventAggregator: EventAggregator, public router: Router) {
        this.appState.pageHeader = 'Menu';
    }

    activate(params, routeConfig) {
    }

}