import { autoinject, bindable } from 'aurelia-framework';
import { DialogService } from 'aurelia-dialog';
import { NetsuiteService } from './services/netsuite-service';
import { ApplicationState } from './application-state';
import { EventAggregator } from 'aurelia-event-aggregator';
import { ModalIframe } from './modal-iframe'

@autoinject
export class Ship {

    @bindable textInput: string;
    @bindable textInputElem: HTMLInputElement;
    openFulfillments;
    loading;
    loadingTextInput;

    constructor(public appState: ApplicationState, public netsuite: NetsuiteService, public eventAggregator: EventAggregator, private dialogService: DialogService) {
        this.appState.pageHeader = 'Shipping';
        this.openFulfillments = [];
    }

    attached(params, routeConfig) {
        this.loadFulfillments();
    }

    textInputChanged(newValue: string) {
        var includesPrefix = ((newValue[0] == 'S' || newValue[0] == 's') && (newValue[1] == 'O' || newValue[1] == 'o'));
        if ((!includesPrefix && newValue.length == 6) || (includesPrefix && newValue.length == 8)) {
            this.loadingTextInput = true;
            this.netsuite.getOpenFulfillments(newValue).then(response => {
                this.loadingTextInput = false;
                if (response.success) {
                    this.openFulfillments = response.fulfillments;
                }
                else {
                    this.openFulfillments = [];
                }
            });
        }
    }

    loadFulfillments() {
        this.loading = true;
        this.netsuite.getOpenFulfillments().then((response) => {
            this.loading = false;
            console.log('response', response);
            if (response.success) {
                this.openFulfillments = response.fulfillments;
            }
        });
    }

    printLabel(fulfillmentId) {
        this.dialogService.open({
            viewModel: ModalIframe,
            model: {
                iframeUrl: this.netsuite.endpoints.label + '&cust_id=' + fulfillmentId
            }
        })
    }
}
