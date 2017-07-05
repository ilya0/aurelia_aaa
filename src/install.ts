import { autoinject } from 'aurelia-framework';
import { NetsuiteService } from './services/netsuite-service';
import { ApplicationState } from './application-state';
import { EventAggregator } from 'aurelia-event-aggregator';

@autoinject
export class Install {

    testInput: HTMLInputElement;

    constructor(public appState: ApplicationState, public netsuite: NetsuiteService, public eventAggregator: EventAggregator) {
        this.appState.pageHeader = 'Installation';
    }

}