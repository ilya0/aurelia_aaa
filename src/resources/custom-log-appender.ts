// import {HttpClient} from 'aurelia-fetch-client';
import { Logger } from 'aurelia-logging';
//import * as _ from 'lodash';

export class LogAppender {

    // http: HttpClient;

    // constructor(http: HttpClient) {
    //     this.http = http;
    // }

    debug(logger: Logger, ...rest: any[]): void { }
    info(logger: Logger, ...rest: any[]): void { }
    warn(logger: Logger, ...rest: any[]): void { }

    error(logger: Logger, ...rest: any[]): void {
        var error = rest.find(x => x instanceof Error);
        // this.http.post('errors', {
        //     url: window.location.href,
        //     source: (<any>logger).id,
        //     message: rest.join('\r\n'),
        //     stackTrace: error ? error.stack || '' : ''
        // }).then();
        // Display a friendly message to the user.
    }
}