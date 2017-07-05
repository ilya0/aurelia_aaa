// import { Finishing, FinishingOption, FinishingOptionValue, FinishingGroup, FinishingPreset } from './finishings';
// import { InventoryItem, MatrixItemDetail } from './inventory-item'
// import {FormElement, FormElementQuestion, FormElementResponse, FormElementResult} from './form-element';


export class Category {
    description: string;
    displayOrder: number;
    state: number;
    children: Map<string, Category>;
    itemid: string;
    level: number;
    parent: string;

    constructor(public id: number, public name: string, public module: string, public icon?: string) {
        this.state = 1;
        this.level = 1;
        this.children = new Map<string, Category>();
    }

    toJSON() {
        return this.id;
    }
}

