//
// Warning: This code uses a lot reference objects and nested reference objects with similiar/same names!
//          Be careful when editing...it's a mess!
//

import { autoinject, bindable, TaskQueue } from 'aurelia-framework';
import { NetsuiteService } from './services/netsuite-service';
import { ApplicationState } from './application-state';
import { EventAggregator } from 'aurelia-event-aggregator';
import { DialogService } from 'aurelia-dialog';
import { ModalSetQuantity } from './modal-set-quantity';
import { ModalSelectGraphic } from './modal-select-graphic';

@autoinject
export class Pack {
    @bindable textInput: string;
    @bindable textInputElem: HTMLInputElement;
    @bindable newBoxBtn: HTMLButtonElement;
    @bindable submitBtn: HTMLButtonElement;
    @bindable resetBtn: HTMLButtonElement;
    @bindable remainingBtn: HTMLButtonElement;
    @bindable remainingItemsModal;
    inputStarted: boolean;
    inputChars: string[];
    keyEvent;
    loading: boolean;
    submitting: boolean;
    transaction;
    fulfillments;
    fulfillmentItems: Object;
    packages: any[];
    remainingItems: any[];
    currentPackage;
    statusMessage: string;
    scanQueue: string[];
    // @bindable mdPixelSize;
    // @bindable mdSize;

    // Passes keyboard events to modal
    capture;

    testInput: HTMLInputElement;

    constructor(public appState: ApplicationState, public netsuite: NetsuiteService, public eventAggregator: EventAggregator, private dialogService: DialogService, private taskQueue: TaskQueue) {
        this.appState.pageHeader = 'Packing';
        this.inputStarted = false;
        this.inputChars = [];
        this.packages = [];
        this.textInput = '';
        this.capture = {};
        this.scanQueue = [];
        // this.loading = true;
        // this.submitting = true;
        // this.mdPixelSize = 25;
        // this.mdSize = 'small';
    }

    attached(params, routeConfig) {
        // this.scannerInput.focus();
        var _this = this;
        this.keyEvent = _this.keyEventHandler.bind(_this);
        document.addEventListener('keydown', this.keyEvent);
    }

    // toggleSize() {
    //     if (!this.mdSize) this.mdSize = 'small'
    //     else if (this.mdSize == 'small') this.mdSize = 'big'
    //     else this.mdSize = '';
    // }

    detached() {
        document.removeEventListener('keydown', this.keyEvent);
    }

    textInputSubmit() {
        this.inputSubmitHandler(this.textInput);
        this.textInput = '';
    }

    resetForm() {
        this.packages = [];
        this.transaction = null;
        this.currentPackage = null;
        this.fulfillments = null;
        this.statusMessage = '';
    }

    inputSubmitHandler(value: string) {
        if (this.loading) {
            // This queue is not processed, just prevents scanning while loading
            this.scanQueue.push(value);
            return;
        }
        if (value.length == 5) value = 'LN' + value;
        else if (value.length == 6) {
            if (Number(value) < 300000) value = 'LN' + value;
            else value = 'SO' + value;
        }
        else value = value.toUpperCase();
        // this.testInput.innerHTML += value + '<br>';
        if (!this.transaction) {
            this.loading = true;
            this.netsuite.getOrderFulfillments(value).then(result => {
                console.debug('transaction', result.record);
                console.debug('fulfillments', result.fulfillments);
                if (result.success) {
                    this.transaction = result.record;
                    this.fulfillments = result.fulfillments.records;
                    this.fulfillmentItems = result.fulfillments.items;
                    // Object.keys(this.fulfillmentItems).forEach((lineId) => {
                    //     if (this.transaction.lines.hasOwnProperty('LN' + lineId)) {
                    //         this.transaction.lines['LN' + lineId].quantityfulfilled = this.fulfillmentItems[lineId].quantity;
                    //     }
                    // });
                    Object.keys(this.transaction.lines).forEach((lineId) => {
                        var line = this.transaction.lines[lineId];
                        if (this.fulfillmentItems.hasOwnProperty(line.id)) {
                            line.quantityfulfilled = this.fulfillmentItems[line.id].quantity;
                        }
                        else {
                            line.quantityfulfilled = 0;
                        }
                    });
                    if (this.fulfillments.records && this.fulfillments.records.length) this.fulfillments.records.forEach((fulfillment) => {
                        if (fulfillment.detail && fulfillment.detail.pkgs) fulfillment.detail.pkgs.forEach((pkg) => {
                            pkg.forEach((item) => {
                                var line = this.transaction.lines['LN' + item.id];
                                if (line) {
                                    var versions = (line.lineType && line.lineType.v == 'g' && Array.isArray(line.versions)) ? line.versions : [];
                                    if (item.v && versions.length) item.v.forEach((v) => {
                                        var version = versions.find((ver) => ver.id == v.id);
                                        if (version) {
                                            if (version.hasOwnProperty('quantityfulfilled') && version.quantityfulfilled) version.quantityfulfilled += v.q;
                                            else version.quantityfulfilled = v.q;
                                        }
                                    });
                                    console.log('versions', versions);
                                }
                            });
                        });
                    });
                    if (value[0] == 'L') this.addItem(value);
                }
                else {
                    this.transaction = null;
                    this.statusMessage = 'Error Loading Order';
                }
                this.loading = false;
            });
        }
        else {
            this.addItem(value);
        }
    }

    getRemainingItems() {
        var r = [];
        Object.keys(this.transaction.lines).forEach((lineId) => {
            var l = this.transaction.lines[lineId];
            var remaining = l.quantity.v - +(l.quantityfulfilled || 0) - +(l.packed || 0);
            if (remaining) r.push({ id: lineId, line: l, remaining: remaining });
        });
        this.remainingItems = r;
        console.log('remainingItems', r);
        this.remainingItemsModal.open();
        return r;
    }

    addFromRemainingItemsModal(item) {
        this.remainingItemsModal.close();
        this.addItem(item.id);
    }

    submitFulfillment() {
        // console.log(this.transaction.record);
        this.submitBtn.disabled = true;
        this.newBoxBtn.disabled = true;
        this.resetBtn.disabled = true;
        this.remainingBtn.disabled = true;
        this.statusMessage = '';
        this.submitting = true;
        var fulfillment = {
            so: this.transaction.record.id,
            lines: {},
            pkgs: []
        };
        Object.keys(this.transaction.lines).forEach((lineKey) => {
            var line = this.transaction.lines[lineKey];
            fulfillment.lines[line.lineNum] = {
                q: line.packed || 0
            }
        });
        this.packages.forEach((pkg) => {
            var p = [];
            pkg.items.forEach((item) => {
                console.log('item', item);
                if (item.packed) {
                    var i: any = {
                        id: item.line.id,
                        q: item.packed
                    }
                    if (item.versionsPacked && item.versionsPacked.length) {
                        var versions = [];
                        item.versionsPacked.forEach((version) => {
                            versions.push({
                                id: version.version.id,
                                q: version.packed
                            })
                        })
                        i.v = versions;
                    }
                    p.push(i);
                }
            })
            if (p.length) fulfillment.pkgs.push(p);
        });
        console.log('fulfillment', fulfillment);
        if (fulfillment.pkgs.length) {
            try {
                this.netsuite.saveFulfillment(fulfillment)
                    .then((result) => {
                        this.submitting = false;
                        if (result.success) {
                            this.statusMessage = 'Fulfillment Submitted Successfully for ' + this.transaction.record.tranid;
                            // this.statusMessage = 'Fulfillment ID: ' + result.id;
                            this.packages = [];
                            this.transaction = null;
                        }
                        else {
                            this.statusMessage = 'Error creating fulfillment';
                        }
                        this.submitBtn.disabled = false;
                        this.newBoxBtn.disabled = false;
                        this.resetBtn.disabled = false;
                        this.remainingBtn.disabled = false;
                    }).catch((httpResponse) => {
                        console.log('Error httpResponse', httpResponse);
                        this.submitting = false;
                        if (httpResponse.response && httpResponse.response.indexOf('Fulfillments can be shipped from only one location') != -1) {
                            this.statusMessage = 'Error creating fulfillment: Contains items to be shipped from another location';
                        } else {
                            this.statusMessage = 'Error creating fulfillment';
                        }
                        this.submitBtn.disabled = false;
                        this.newBoxBtn.disabled = false;
                        this.resetBtn.disabled = false;
                        this.remainingBtn.disabled = false;
                    });
            }
            catch (err) {
                this.submitting = false;
                this.statusMessage = 'Error creating fulfillment';
                console.log('Error', err);
                this.submitBtn.disabled = false;
                this.newBoxBtn.disabled = false;
                this.resetBtn.disabled = false;
                this.remainingBtn.disabled = false;
            }
        }
        else {
            this.submitting = false;
            this.statusMessage = 'Error: no items in fulfillment';
            this.submitBtn.disabled = false;
            this.newBoxBtn.disabled = false;
            this.resetBtn.disabled = false;
            this.remainingBtn.disabled = false;
        }
    }

    addPackage() {
        var pkg = {
            items: []
        };
        this.packages.push(pkg);
        this.currentPackage = pkg;
        this.newBoxBtn.blur();
        return pkg;
    }

    selectPackage(index) {
        this.currentPackage = this.packages[index];
    }

    addItem(lineId) {
        this.statusMessage = '';
        var line = this.transaction.lines[lineId];
        if (!line) {
            // alert('Item not found in current order');
            this.appState.showAlert('Alert', 'Item not found in current order');
        }
        else {
            if (!this.packages.length) this.addPackage();
            if (this.currentPackage) {
                if (!line.hasOwnProperty('packed')) line.packed = 0;
                var remaining = line.quantity.v - line.quantityfulfilled - line.packed;
                if (remaining < 1) {
                    // alert('No items remaining to pack');
                    this.appState.showAlert('Alert', 'No items remaining to pack');
                    return;
                }
                console.log('remaining', remaining);
                var itemFound = this.currentPackage.items.find(i => i.line.label == lineId);
                if (itemFound) {
                    if (itemFound.versions.length) {
                        this.selectGraphicVersion(itemFound, false);
                    }
                    else {
                        this.setItemQuantity(this.currentPackage, itemFound);
                        // setTimeout(() => { try { (<HTMLElement>item.element).scrollIntoView(); } catch (err) { } }, 1);
                        this.taskQueue.queueMicroTask(() => {
                            var dist = this.getDistanceFromTop(<HTMLElement>item.element);
                            // console.log(dist);
                            window.scrollTo(0, dist);
                            // (<HTMLElement>item.element).scrollIntoView();
                        });
                    }
                }
                else {
                    var item = {
                        line: line,
                        versions: (line.lineType.v == 'g' && Array.isArray(line.versions)) ? line.versions : [],
                        packed: 0,
                        versionsPacked: [],
                        element: null
                    }

                    if (item.versions.length) {
                        this.selectGraphicVersion(item, true);
                    }
                    else {
                        this.currentPackage.items.push(item);
                        // setTimeout(() => { try { (<HTMLElement>item.element).scrollIntoView(); } catch (err) { } }, 1);
                        this.taskQueue.queueMicroTask(() => {
                            var dist = this.getDistanceFromTop(<HTMLElement>item.element);
                            // console.log(dist);
                            window.scrollTo(0, dist);
                            // (<HTMLElement>item.element).scrollIntoView();
                        });
                        this.setItemQuantity(this.currentPackage, item);
                    }
                }
            }
            console.log('packages', this.packages);
        }
    }

    getDistanceFromTop(elem: HTMLElement) {
        //get the distance scrolled on body (by default can be changed)
        var distanceScrolled = document.body.scrollTop;
        //create viewport offset object
        var elemRect = elem.getBoundingClientRect();
        //get the offset from the element to the viewport
        var elemViewportOffset = elemRect.top;
        //add them together
        return distanceScrolled + elemViewportOffset - 56;
    }

    setItemQuantity(pkg, item) {
        var capture = this.capture;
        if (!item.line.hasOwnProperty('packed')) item.line.packed = 0;
        var remaining = item.line.quantity.v - item.line.quantityfulfilled - item.line.packed + item.packed;

        this.textInputElem.blur();
        return this.dialogService.open({
            viewModel: ModalSetQuantity,
            model: { capture: capture, max: remaining, current: item.packed }
        }).whenClosed((result: any) => {
            console.log('setItemQuantity dialogResult', result);
            if (result.wasCancelled) {
                if (item.packed == 0) this.removeItem(pkg, item);
            }
            else {
                if (result.output.removeItem) {
                    this.removeItem(pkg, item);
                    return;
                }
                if (result.output.quantity === '' || result.output.quantity === undefined || result.output.quantity === null) return;
                var qty = +result.output.quantity;
                if (qty < 0) {
                    // alert('Quantity cannot be negative!');
                    this.appState.showAlert('Alert', 'Quantity cannot be negative!');
                    return;
                }
                if (qty > remaining) {
                    // alert('Exceeds quantity remaining to pack');
                    this.appState.showAlert('Alert', 'Exceeds quantity remaining to pack');
                    return;
                }
                item.packed = qty;

                this.recalcItemQty(item)
            }
        });
    }

    setVersionQuantity(pkg, item, version) {
        var capture = this.capture;
        if (!item.line.hasOwnProperty('packed')) item.line.packed = 0;
        if (!version.version.hasOwnProperty('packed')) version.version.packed = 0;
        var itemQtyRemaining = item.line.quantity.v - item.line.quantityfulfilled - item.line.packed + version.version.packed;
        var versionQtyRemaining = +version.version.quantity.v - version.version.packed + version.packed;
        if (versionQtyRemaining > itemQtyRemaining) versionQtyRemaining = itemQtyRemaining;

        this.textInputElem.blur();
        return this.dialogService.open({
            viewModel: ModalSetQuantity,
            // model: { capture: capture, max: versionQtyRemaining + version.packed, isVersion: true }
            model: { capture: capture, max: versionQtyRemaining, current: version.packed, isVersion: true }
        }).whenClosed((result: any) => {
            console.log('setVersionQuantity dialogResult', result);
            if (!result.wasCancelled) {
                if (result.output.removeItem) {
                    this.removeItem(pkg, item);
                    return;
                }
                if (result.output.removeVersion) {
                    this.removeVersion(pkg, item, version);
                    return;
                }
                if (result.output.quantity === '' || result.output.quantity === undefined || result.output.quantity === null) return;
                var qty = +result.output.quantity;
                if (qty < 0) {
                    // alert('Quantity cannot be negative!');
                    this.appState.showAlert('Alert', 'Quantity cannot be negative!');
                    return;
                }
                if (qty > versionQtyRemaining) {
                    // alert('Exceeds quantity remaining to pack');
                    this.appState.showAlert('Alert', 'Exceeds quantity remaining to pack');
                    return;
                }
                version.packed = qty;

                this.recalcItemVersionQty(item)
            }
        });
    }

    recalcItemQty(item) {
        var totalItemQty = 0;
        this.packages.forEach((p) => {
            p.items.forEach((i) => {
                if (item.line.id == i.line.id) {
                    totalItemQty += i.packed;
                }
            })
        })
        item.line.packed = totalItemQty;
    }

    recalcItemVersionQty(item) {
        var totalItemQty = 0;
        var eachVerQty = {};
        this.packages.forEach((p) => {
            p.items.forEach((i) => {
                if (item.line.id == i.line.id) {
                    var q = 0;
                    i.versionsPacked.forEach((v) => {
                        q += v.packed;
                        if (eachVerQty.hasOwnProperty(v.version.id)) eachVerQty[v.version.id] += v.packed;
                        else eachVerQty[v.version.id] = v.packed;
                    })
                    i.packed = q;
                    totalItemQty += q;
                }
            })
        })
        item.line.packed = totalItemQty;
        item.versions.forEach((v) => {
            if (eachVerQty.hasOwnProperty(v.id)) v.packed = eachVerQty[v.id];
            else v.packed = 0;
        });
    }

    removeItem(pkg, item) {
        var index = pkg.items.indexOf(item);
        if (index !== -1) {
            item.versionsPacked.forEach((ver) => {
                ver.version.packed -= ver.packed;
            })
            item.line.packed -= item.packed;
            pkg.items.splice(index, 1);
        }
        else {
            console.log('Error removing item', pkg, item);
        }
        if (!pkg.items.length) {
            let index = this.packages.indexOf(pkg);
            if (index > -1 && index < (this.packages.length - 1)) {
                this.packages.splice(index, 1);
                if (this.currentPackage == pkg) {
                    this.currentPackage = null;
                    if (this.packages.length) this.currentPackage = this.packages[this.packages.length - 1];
                }
            }
        }
    }

    removeVersion(pkg, item, version) {
        var index = item.versionsPacked.indexOf(version);
        if (index !== -1) {
            version.version.packed -= version.packed;
            item.line.packed -= version.packed;
            item.packed -= version.packed;
            item.versionsPacked.splice(index, 1);
        }
        else {
            console.log('Error removing version', pkg, item, version);
        }
        if (!item.versionsPacked.length && pkg) {
            this.removeItem(pkg, item);
        }
    }

    selectGraphicVersion(item, isNewItem: boolean, pkg?) {
        if (!pkg) pkg = this.currentPackage;
        var availableVersions = [];
        var itemQtyRemaining = item.line.quantity.v - item.line.quantityfulfilled - item.line.packed;
        var maxQty = itemQtyRemaining;
        item.versions.forEach((version) => {
            var v = {
                id: version.id,
                version: version,
                filename: version.filename.v,
                labelImage: version.labelImage,
                remaining: +version.quantity.v - (version.quantityfulfilled || 0),
                quantity: +version.quantity.v,
                packed: 0,
                versionPacked: null,
                alreadyPacked: false,
                isInPkg: false
            }

            if (version.packed) v.remaining -= version.packed;
            else version.packed = 0;

            var packedThisPkg = 0;
            if (!isNewItem) {
                var foundVer = item.versionsPacked.find(ver => ver.id == v.id);
                if (foundVer) { // && foundVer.packed
                    v.packed = +foundVer.packed;
                    v.remaining += v.packed;
                    v.versionPacked = foundVer;
                    v.alreadyPacked = true;
                    v.isInPkg = true;
                    itemQtyRemaining += v.packed;
                    maxQty += v.packed;
                }
                else {
                    console.log('Version not found', v.id, item.versionsPacked);
                }
            }

            if (!v.isInPkg && v.packed == 0 && v.remaining) {
                v.packed = v.remaining;
            }

            if (!v.isInPkg && itemQtyRemaining < v.packed) {
                v.packed = itemQtyRemaining;
                itemQtyRemaining = 0;
            }
            else {
                itemQtyRemaining -= v.packed;
            }

            if (v.remaining || v.versionPacked) availableVersions.push(v);
        });
        // console.log('availableVersions', availableVersions);

        this.textInputElem.blur();
        var capture = this.capture;
        this.dialogService.open({
            viewModel: ModalSelectGraphic,
            model: {
                capture: capture,
                item: item,
                package: pkg,
                versions: availableVersions,
                maxQuantity: maxQty
            }
        }).whenClosed((result) => {
            console.log('modal result', result, item);
            if (!result.wasCancelled) {
                availableVersions.forEach((v) => {
                    if (v.alreadyPacked) {
                        if (v.isInPkg && v.packed) v.versionPacked.packed = +v.packed;
                        else this.removeVersion(pkg, item, v.versionPacked);
                    }
                    else {
                        if (v.isInPkg) {
                            var ver = {
                                id: v.version.id,
                                version: v.version,
                                packed: +v.packed
                            }
                            if (ver.packed) {
                                item.versionsPacked.push(ver);
                                if (isNewItem) {
                                    isNewItem = false;
                                    pkg.items.push(item);
                                }
                            }
                        }
                    }
                })

                this.recalcItemVersionQty(item);
                this.taskQueue.queueMicroTask(() => {
                    if (item && item.element) {
                        var dist = this.getDistanceFromTop(<HTMLElement>item.element);
                        // console.log(dist);
                        window.scrollTo(0, dist);
                        // (<HTMLElement>item.element).scrollIntoView();
                    }
                });

                console.log('packages', this.packages);
            }
        })
    }

    keyEventHandler(e: KeyboardEvent) {
        var keyCode = +e.code || e.which;
        // console.log(e.which + ": " + e.key);
        // console.log(keyCode + ": " + e.key);
        if (keyCode >= 96 && keyCode <= 105) keyCode -= 48;
        if ((keyCode >= 48 && keyCode <= 57) || (keyCode >= 65 && keyCode <= 90) || keyCode == 189 || keyCode == 190) {
            this.inputChars.push(String.fromCharCode(keyCode));
            if (this.inputStarted == false) {
                this.inputStarted = true;
                setTimeout(() => {
                    // console.log("Testing Barcode Input");
                    var barcode = this.inputChars.join('');
                    if (this.inputChars.length >= 5) {
                        // console.log("Barcode Scanned: " + barcode);
                        this.inputSubmitHandler(barcode);
                        this.textInput = '';
                    }
                    // else {
                    //     console.log('Clearing barcode input: ' + barcode);
                    // }
                    this.inputChars = [];
                    this.inputStarted = false;
                }, 200);
            }
        }
        else if (keyCode == 13) {
            if (this.inputChars.length < 5 && this.textInput.length) this.textInputSubmit();
        }

        if (this.capture.input) {
            this.capture.input(keyCode);
        }
        // console.log(e);
        // if (this.scannerInput !== document.activeElement) {
        //     if (e.keyCode > 47) this.testInput.innerHTML += e.key;
        //     else if (e.keyCode === 13) this.testInput.innerHTML += '<br>';
        //     else this.testInput.innerHTML += e.keyCode + ': ' + e.key + '<br>';
        // }

        // var keyEvent = document.createEvent("KeyboardEvent");
        // keyEvent.initKeyboardEvent("keypress", true, true, window, e.key, null, null, false, e.locale);
        // e.preventDefault();
        // e.stopPropagation();
        // this.scannerInput.dispatchEvent(keyEvent);

    }
}
