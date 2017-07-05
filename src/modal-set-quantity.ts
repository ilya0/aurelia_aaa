import { autoinject, bindable } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';
import { ApplicationState } from './application-state';

@autoinject
export class ModalSetQuantity {

    inputElem: HTMLInputElement;
    value;
    capture;
    max: number;
    current: number;
    isVersion: boolean;

    constructor(public appState: ApplicationState, private controller: DialogController) {
        // this.controller.settings.lock = false;
        this.value = '';
    }

    // attached(params, routeConfig) {
    //     // this.inputElem.focus();
    // }

    activate(model) {
        this.max = model.max;
        this.current = model.current;
        this.capture = model.capture;
        this.capture.input = this.input.bind(this);
        this.isVersion = model.isVersion;
    }

    detached() {
        this.capture.input = null;
    }

    input(key: number) {
        // console.log('key', key);
        if ((key >= 48 && key <= 57) || (key >= 96 && key <= 105)) {
            this.value += String.fromCharCode(key);
            if (this.max && this.value > this.max) this.inputElem.style.color = 'red';
            else this.inputElem.style.color = 'black';
        }
        else if (key == 13) {
            this.updateQuantity();
        }
        else if (key == 8) {
            this.value = this.value.substr(0, this.value.length - 1);
        }
        else if (key == 46) {
            this.value = '';
        }
    }

    updateQuantity() {
        if (this.value) this.controller.ok({ quantity: this.value });
        else alert('Enter quantity');
    }

    removeItem() {
        this.controller.ok({ removeItem: true });
    }

    removeVersion() {
        this.controller.ok({ removeVersion: true });
    }

}
