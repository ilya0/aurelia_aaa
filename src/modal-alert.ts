import { autoinject, bindable } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';

@autoinject
export class ModalAlert {

    dialogHeader: HTMLElement;
    dialogBody: HTMLElement;
    headerText: string;
    bodyHtml: string;
    showFooter: boolean = true;
    showOk: boolean = true;
    showCancel: boolean = false;

    constructor(private controller: DialogController) {
        this.controller = controller;
        controller.settings.lock = false;
    }

    activate(model) {
        if (model.options.length == 1 && typeof model.options[0] == 'string') {
            this.bodyHtml = model.options;
        }
        else if (model.options.length > 1 && typeof model.options[0] == 'string') {
            if (model.options.length >= 1) this.headerText = model.options[0];
            if (model.options.length >= 2) this.bodyHtml = model.options[1];
        }
        else if (model.options.length == 1 && typeof model.options[0] == 'object') {
            var options = model.options[0];
            if (options.title) this.headerText = options.title;
            if (options.message) this.bodyHtml = options.message;
            if ('showFooter' in options) this.showFooter = options.showFooter;
            if ('showOk' in options) {
                if (options.showOk) {
                    this.showFooter = true;
                    this.showOk = true;
                }
                else this.showOk = false;
            }
            if ('showCancel' in options) {
                if (options.showCancel) {
                    this.showFooter = true;
                    this.showCancel = true;
                }
                else this.showCancel = false;
            }
        }
    }

    closeOk() {
        this.controller.ok();
    }
}
