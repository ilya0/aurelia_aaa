import { autoinject } from 'aurelia-framework';
import { NetsuiteService } from './services/netsuite-service';
import { ApplicationState } from './application-state';
import { EventAggregator } from 'aurelia-event-aggregator';
import { DialogService } from 'aurelia-dialog';

@autoinject
export class Estimating {
    loading: Boolean = true;
    estimates: any[];
    interval: number;
    lastUpdated: string;

    constructor(public appState: ApplicationState, public netsuite: NetsuiteService, public eventAggregator: EventAggregator, private dialogService: DialogService) {
        this.appState.pageHeader = 'Estimating';
    }

    attached(params, routeConfig) {
        this.getEstimates();
        this.interval = window.setInterval(() => { this.getEstimates() }, 60000);
    }

    unbind() {
        window.clearInterval(this.interval);
    }

    setEstimator(event, rec, value) {
        // console.log(event);
        event.srcElement.disabled = true;
        rec.estimated_by.name = '...';
        this.netsuite.setEstimator(rec.id, value).then((response) => {
            console.log('response', response);
            if (response.success) {
                if (value == 'clear') rec.estimated_by.name = '';
                else rec.estimated_by.name = '- Updated -';
            }
            else {
                alert(response.message);
            }
        });
    }

    getEstimates() {
        // this.loading = true;
        this.netsuite.getEstimates().then((response) => {
            this.loading = false;
            console.log('response', response);
            if (response.success) {
                this.estimates = response.records;

                var date = new Date();
                var lastUpdated = (date.getMonth() + 1).toString() + '/' + date.getDate().toString() + '/' + date.getFullYear().toString() + ' ';
                var minutes = date.getMinutes().toString();
                if (minutes.length === 1) minutes = '0' + minutes;
                if (date.getHours() > 12) lastUpdated += (date.getHours() - 12).toString() + ':' + minutes + ' PM';
                else lastUpdated += date.getHours().toString() + ':' + minutes + ' AM';
                this.lastUpdated = lastUpdated;
            }
            else {
                alert('Error updating record');
            }
        });
    }
}
