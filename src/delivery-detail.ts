import { autoinject, bindable } from 'aurelia-framework';
import { NetsuiteService } from './services/netsuite-service';
import { ApplicationState } from './application-state';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Router } from 'aurelia-router';
import { Delivery, DeliveryItem, ItemGroup } from './models/delivery';
import "../resources/jSignature.min"
import "../resources/jSignature.SignHere"

@autoinject
export class DeliveryDetail {
    //modals
    @bindable itemDetailsModal;
    signFormModal;
    confirmationModal;
    messageModal; // Reusable modal
    modalStatusMessage: string; // status mesage for Reusable modal

    itemDetailsStatusMessage: HTMLDivElement;

    //value of input
    // @bindable quantityDelivered: number;
    saveparams;
    delivery: Delivery;
    // itemDetail: DeliveryItem;

    //status messages
    showStatus: boolean;
    loading: boolean = true;
    deliveryPageMessage: string;

    constructor(public appState: ApplicationState, public netsuite: NetsuiteService, public eventAggregator: EventAggregator, public router: Router) {
        this.appState.pageHeader = 'Delivery Details';
    }

    activate(params, routeConfig) {
        this.saveparams = params;
        this.deliveryPageMessage = "";
        this.showStatus = false;
        this.loading = true;

        this.netsuite.getDelivery(params.id).then(result => {
            // console.log('result from netsuite', result);

            if (result.success) {

                this.delivery = new Delivery(
                    result.delivery.id,
                    result.delivery.tranId,
                    result.delivery.companyname,
                    result.delivery.due,
                    result.delivery.dueDate,
                    result.delivery.dueTime,
                    result.delivery.instructions,
                    result.delivery.location,
                    result.delivery.requestedBy,
                    result.delivery.status,
                    result.delivery.statusId,
                    result.delivery.type,
                    result.delivery.typeId,
                    result.delivery.salesteam,
                    result.delivery.itemLocation,
                    result.delivery.description
                );

                this.appState.pageHeader = 'Delivery Details - ' + this.delivery.tranId;

                result.delivery.itemGroups.forEach(_itemGroup => {

                    var itemGroup = new ItemGroup(
                        _itemGroup.id,
                    );

                    _itemGroup.items.forEach(item => {
                        var deliveryItem = new DeliveryItem(
                            item.id,
                            item.itemDetail,
                            item.lineDetail,
                            item.custfield_tranid,
                            Number(item.custfield_quantity),
                            item.custfield_item,
                            item.custfield_description,
                            item.custfield_dimensions
                        );
                        deliveryItem.quantityDelivered = item.custfield_delivered

                        if (deliveryItem.currentQuantityDelivered == 0) {
                            deliveryItem.checked = false;
                            deliveryItem.disabled = true;
                        } else {
                            deliveryItem.checked = true;
                        }

                        itemGroup.items.push(deliveryItem);
                    });

                    this.delivery.itemGroups.push(itemGroup)
                });
                console.log(this.delivery);
                this.loading = false;
            }
            else {
                this.delivery = null;
                this.loading = false;
                this.showStatus = true;
                //shows error on page that record is not loading
                this.deliveryPageMessage = "Error Loading Record"
            }

        }).catch(error => {
            //shows error on page that there is a connection error
            this.deliveryPageMessage = "Network Error"
            this.showStatus = true;
            this.loading = false;
        });
    }

    // quantityDeliveredChanged(newValue) {
    //     if (newValue && Number(newValue) > this.itemDetail.quantity) {
    //         this.itemDetailsStatusMessage.innerHTML = "Quantity is greater than available quantity"
    //     } else {
    //         this.itemDetailsStatusMessage.innerHTML = ""
    //     }
    // }

    signFormOpen() {
        this.appState.lockOrientation();
        this.signFormModal.open();
        var jsig: any = $("#signature");
        jsig.jSignature({
            'UndoButton': true,
            // 'height': '125',
            // 'width': '500'
        });
    }

    updateDelivery(action) {
        var jsig: any = $("#signature");

        if (action == 'sign') {
            if (!jsig.jSignature("isModified")) {
                this.messageModalOpen('Please sign before submitting');
                return;
            }
            var sigdata = jsig.jSignature("getData", "base30")[1];
            this.delivery.signature = sigdata;

            this.netsuite.updateDelivery(this.delivery).then(result => {
                if (result.success) {
                    // console.log('updateDelivery result', result);
                    this.appState.unlockOrientation();
                    this.signFormModal.close();
                    this.confirmationModal.open();
                    jsig.empty();
                } else {
                    // alert("Error: Delivery not submitted");
                    this.messageModalOpen("Error: Delivery not submitted")
                }
            }).catch(error => {
                console.log(error);
                // alert("Error: Delivery not submitted");
                this.messageModalOpen("Error: Delivery not submitted")

            });
        } else {
            this.appState.unlockOrientation();
            this.signFormModal.close();
            jsig.empty();
        }
    }


    // showItemDetails(item: DeliveryItem) {
    //     console.log(item.quantityDelivered);
    //     this.quantityDelivered = item.currentQuantityDelivered;
    //     this.itemDetail = item;
    //     this.itemDetailsModal.open();
    // }

    //close item details modal (this is the hamburger menu)
    // updateItemDetails() {
    //     if (!this.quantityDelivered) {
    //         this.quantityDelivered = 0;
    //     }
    //     else if (this.quantityDelivered > this.itemDetail.quantity) {
    //         alert("quantity is greater than available quantity");
    //         return;
    //     }
    //     this.itemDetail.currentQuantityDelivered = this.quantityDelivered;
    //     this.itemDetailsModal.close();
    //     console.log(this.quantityDelivered);
    //     // this.quantityDelivered.value = "";
    // }


    //redirect to main page
    redirectToMainlist() {
        this.confirmationModal.close();
        this.router.navigate("delivery");
    }

    messageModalOpen(message) {
        this.modalStatusMessage = message;
        this.messageModal.open()
    }

    //open google maps
    navigate(address, lat, lng) {
        // If it's an iPhone..
        if ((navigator.platform.indexOf("iPhone") !== -1) || (navigator.platform.indexOf("iPod") !== -1)) {
            var iOSversion = function () {
                if (/iP(hone|od|ad)/.test(navigator.platform)) {
                    // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
                    var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
                    return [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || "0", 10)];
                }
            }
            var ver = iOSversion() || [0];

            if (ver[0] >= 6) {
                var protocol = 'maps://';
            } else {
                var protocol = 'http://';

            }
            window.location.href = protocol + 'maps.apple.com/maps?q=' + address;
            //window.location = protocol + 'maps.apple.com/maps?daddr=' + lat + ',' + lng + '&amp;ll=';
        } else {
            window.open('http://maps.google.com?q=' + address);
            //window.open('http://maps.google.com?daddr=' + lat + ',' + lng + '&amp;ll=');
        }
    }

    //show pull down
    expandDetails(item: DeliveryItem) {
        console.log(item);
        item.showpullDown = !item.showpullDown;
    }
    //close pull down
    collapseDetails(item: DeliveryItem) {
        item.showpullDown = false;
    }
}
