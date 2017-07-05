import { autoinject, bindable } from 'aurelia-framework';
import { DialogController } from 'aurelia-dialog';
import { ApplicationState } from './application-state';

@autoinject
export class ModalSelectGraphic {

    item;
    package;
    versions;
    maxQuantity;
    capture;
    selectedVersion;
    selectedPrevious;

    constructor(public appState: ApplicationState, private controller: DialogController) {
        // this.controller.settings.lock = false;
    }

    activate(model) {
        console.log('model', model);
        this.capture = model.capture;
        this.capture.input = this.input.bind(this);
        this.item = model.item;
        this.package = model.package;
        this.versions = model.versions;
        this.maxQuantity = model.maxQuantity;
        this.selectedVersion = {};
        this.selectedVersion = this.versions[0];
    }

    detached() {
        this.capture.input = null;
    }

    selectGraphicVersion(version) {
        if (!version.isInPkg) version.isInPkg = true;
        else if (this.selectedVersion == version) version.isInPkg = false;
        this.selectedVersion = version;
        this.selectedPrevious = null;
    }

    setVersionQty() {
        this.selectedVersion = {};
        this.selectedPrevious = null;

        var qty = 0;
        var hasVersionOverMax = false;
        var hasVersionSelected = false;
        this.versions.forEach(v => {
            if (v.isInPkg) {
                if (v.packed) {
                    hasVersionSelected = true;
                    qty += +v.packed;
                    if (v.packed > v.remaining) {
                        hasVersionOverMax = true;
                        (<HTMLElement>v.element).style.color = 'red';
                    }
                }
                // else v.isInPkg = false;
            }
        });
        if (qty > this.maxQuantity) {
            alert('Quantity entered is greater than available (' + this.maxQuantity + ')');
        }
        else if (hasVersionOverMax) {
            alert('Version quantity over max available');
        }
        else if (!hasVersionSelected) {
            alert('Select graphic to pack or X to cancel');
        }
        else {
            this.controller.ok({ versions: this.versions });
        }
    }

    input(key: number) {
        if (this.selectedVersion.id) {
            // console.log('key', key);
            if ((key >= 48 && key <= 57) || (key >= 96 && key <= 105)) {
                if (this.selectedPrevious === null || this.selectedPrevious === undefined) {
                    this.selectedPrevious = this.selectedVersion.packed;
                    this.selectedVersion.packed = +String.fromCharCode(key);
                }
                else {
                    // this.selectedVersion.packed = +(`$(this.selectedVersion.packed)$(String.fromCharCode(key))`);
                    this.selectedVersion.packed = +(this.selectedVersion.packed.toString() + String.fromCharCode(key));
                }
                if (this.selectedVersion.packed == 0) this.selectedVersion.isInPkg = false;
                else if (!this.selectedVersion.isInPkg) this.selectedVersion.isInPkg = true;
            }
            else if (key == 13) {
                var index = this.versions.indexOf(this.selectedVersion);
                if (!this.selectedVersion.isInPkg && this.selectedVersion.packed) this.selectedVersion.isInPkg = true;
                if (index !== -1 && this.versions.length === index + 1) {
                    this.setVersionQty();
                    return;
                }
                else {
                    this.selectedVersion = this.versions[index + 1];
                    this.selectedPrevious = null;
                    return;
                }
            }
            else if (key == 8) {
                if (this.selectedVersion.packed !== '' && this.selectedVersion.packed !== null && this.selectedVersion.packed !== undefined) {
                    var packedStr = this.selectedVersion.packed.toString();
                    packedStr = packedStr.substr(0, packedStr.length - 1);
                    this.selectedVersion.packed = (packedStr.length) ? +packedStr : 0;
                }
            }
            else if (key == 46) {
                this.selectedVersion.packed = 0;
            }

            if (this.selectedVersion.packed && this.selectedVersion.packed > this.selectedVersion.remaining) {
                (<HTMLElement>this.selectedVersion.element).style.color = 'red';
            }
            else {
                (<HTMLElement>this.selectedVersion.element).style.color = 'black';
            }
        }
    }
}