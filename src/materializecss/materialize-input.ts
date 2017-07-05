import {customElement, bindable, inject} from 'aurelia-framework';

export class MaterializeInputCustomElement {
    @bindable valueText;
    @bindable label;
    @bindable required;

    elementId;

    constructor(){
        this.elementId = Math.floor(Math.random() * 99999999);
    }

}