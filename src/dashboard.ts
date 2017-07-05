import { autoinject, bindable } from 'aurelia-framework';
import { NetsuiteService } from './services/netsuite-service';
import { ApplicationState } from './application-state';
// import moment = require('moment');

@autoinject()
export class Home {
    // appState: AppState;
    //private netsuite: Netsuite;
    //appState: ApplicationState;
    //records;
    dashboardName: string;
    lastUpdated: string;
    records: any[];
    interval: number;
    @bindable dashboardElem: HTMLElement;
    fullscreenBtn: HTMLButtonElement;

    constructor(private appState: ApplicationState, private netsuite: NetsuiteService) {
        this.records = [];
    }

    activate(params, routeConfig) {
        console.log('params', params);
        this.dashboardName = 'Work Orders Received';
        this.interval = window.setInterval(() => { this.getRecords() }, 60000);
        return this.getRecords();
        // if (params.dashboardName && params.searchTerm) {
        //     if (params.dashboardName) this.dashboardName = 'Sales Order Status';
        //     // self.appState.searchTerm = params.searchTerm;
        //     // setInterval(function () { self.appState.getRecords() }, 120000);
        //     return this.getRecords();
        // }
        // else {
        //     alert('Missing Dashboard ID');
        // }
    }

    detached() {
        if (this.interval) window.clearInterval(this.interval);
    }

    enterFullscreen() {
        var fullscreenDiv = this.dashboardElem;
        console.log(fullscreenDiv);
        var fullscreenFunc = fullscreenDiv.requestFullscreen;
        if (!fullscreenFunc) {
            ['mozRequestFullScreen',
                'msRequestFullscreen',
                'webkitRequestFullScreen'].forEach(function (req) {
                    fullscreenFunc = fullscreenFunc || fullscreenDiv[req];
                });
        }
        fullscreenFunc.call(fullscreenDiv);
        // function enterFullscreen() {
        //     fullscreenFunc.call(fullscreenDiv);
        // }
    }

    getRecords() {
        return this.netsuite.getDashboardItems()
            .then((results) => {
                // var orders = {};
                // results.items.forEach(function (row) {
                //     if (orders.hasOwnProperty(row.soId)) orders[row.soId].items.push(row);
                //     else orders[row.soId] = {
                //         transaction: row.transaction.substr(row.transaction.indexOf('#') + 1),
                //         duedate: row.duedate,
                //         company: row.company.substr(row.company.indexOf(' ') + 1),
                //         salesteam: row.salesteam,
                //         updated: row.updated,
                //         items: [row]
                //     };
                // });
                // this.records = [];
                // Object.keys(orders).forEach((record) => this.records.push(orders[record]));

                results.items.forEach(function (row) {
                    row.transaction = row.transaction.substr(row.transaction.indexOf('#') + 1);
                    row.company = row.company.substr(row.company.indexOf(' ') + 1);
                    // if (row.updated) {
                    //     var updated = moment(row.updated, 'M/D/YYYY h-m-s a');
                    //     //row.updated = date.format('ddd MMM Mo h:m a');
                    //     row.updated = updated.fromNow();
                    //     row.updatedMoment = updated;
                    // }
                    // row.duedateMoment = moment(row.duedate, 'M/D/YYYY');
                });
                this.records = results.items;

                var date = new Date();
                var lastUpdated = (date.getMonth() + 1).toString() + '/' + date.getDate().toString() + '/' + date.getFullYear().toString() + ' ';
                var minutes = date.getMinutes().toString();
                if (minutes.length === 1) minutes = '0' + minutes;
                if (date.getHours() > 12) lastUpdated += (date.getHours() - 12).toString() + ':' + minutes + ' PM';
                else lastUpdated += date.getHours().toString() + ':' + minutes + ' AM';
                this.lastUpdated = lastUpdated;

                // self.lastUpdated = moment().format("dddd, MMMM Do YYYY, h:mm a");
            });
    }
}
