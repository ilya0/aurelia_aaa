import { autoinject, bindable } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';

@autoinject
export class ModalIframe {

    iframe: HTMLIFrameElement;
    iframeUrl: string;
    // autoClose: string;
    dialogContainer: HTMLElement;
    dialogBody: HTMLElement;

    constructor(private controller: DialogController) {
        this.controller = controller;
        controller.settings.lock = false;
    }

    activate(model) {
        this.iframeUrl = model.iframeUrl;
        // this.autoClose = model.autoClose;
    }

    attached(model) {
        this.dialogBody.style.height = (this.dialogContainer.clientHeight - 35) + 'px';
    }

    locationChanged() {
        // if (this.autoClose) {
        //     var query = this.iframe.contentDocument.URL.split('?')[1].split('&');
        //     query.forEach(q => {
        //         if (q.substr(0, this.autoClose.length + 1) == this.autoClose + '=') {
        //             var autoCloseValue = q.substr(this.autoClose.length + 1);
        //             if (autoCloseValue) {
        //                 this.controller.ok(autoCloseValue);
        //             }
        //         }
        //     });
        // }
    }
}