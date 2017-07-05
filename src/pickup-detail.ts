import { autoinject, bindable } from 'aurelia-framework';
import { NetsuiteService } from './services/netsuite-service';
import { ApplicationState } from './application-state';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Router } from 'aurelia-router';
import { Transaction, Item, ItemGroup } from './models/transaction';
import "../resources/jSignature.min"
import "../resources/jSignature.SignHere"

@autoinject
export class PickupDetail {
    //modals
    @bindable itemDetailsModal;
    signFormModal; // sign form modal
    confirmationModal; //confirm *********** remove
    messageModal; // Reusable modal
    modalStatusMessage: string; // status mesage for Reusable modal
    isPhone: boolean = false; // variable for opening the signature in mobile
    itemDetailsStatusMessage: HTMLDivElement;

    //value of input
    @bindable quantityDelivered: number;
    saveparams;
    pickup: Transaction; //pickup object
    itemDetail: Item; //item object

    //status messages
    showStatus: boolean;
    loading: boolean = true;
    deliveryPageMessage: string;

    constructor(public appState: ApplicationState, public netsuite: NetsuiteService, public eventAggregator: EventAggregator, public router: Router) {
        this.appState.pageHeader = 'Pickup Details';
    }

    activate(params, routeConfig) {
        this.saveparams = params;
        this.deliveryPageMessage = "";
        this.showStatus = false;
        this.loading = true;


        this.netsuite.getTransaction(params.id).then(result => {
            //52008
            console.log('result from netsuite', result);
            console.log("params id is", params.id);
            if (result.success) {
                this.pickup = new Transaction(
                    result.record.id,
                    result.record.tranid,
                    result.record.customer,
                    result.record.dueDate.v,
                    result.record.salesTeam.v,
                    result.record.title.v,
                    result.record.location.v,
                    result.record.contName.v,
                    result.record.contPhone.v
                );
                console.log('pickup object is ', this.pickup);

                this.appState.pageHeader = 'Pickup Details - ' + this.pickup.tranId;

                //create an new object with alll the items in it
                result.itemGroups.forEach(_itemGroup => {

                    //create an itemGroup object to push all the items in the pickup loop
                    var itemGroup = new ItemGroup(
                        _itemGroup.id,
                    );

                    //loop to push indivual items in to the itemGroup object
                    _itemGroup.items.forEach(item => {
                        //pickupItem object
                        var pickupItem = new Item(

                            item.id, //no v
                            item.itemDetail, //no v
                            item.item.v,
                            item.name.v,
                            Number(item.quantity.v)
                        );

                        pickupItem.quantityPickedup = item.custfield_delivered

                        itemGroup.items.push(pickupItem);
                        //add item to the group that we have created *********
                        // this.delivery.items.push(deliveryItem);
                    });

                    //add group to delivery *******
                    this.pickup.itemGroups.push(itemGroup)
                });
                console.log(this.pickup);
                this.loading = false;

            }
            else {
                this.pickup = null;
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

    attached() {
        if (window.innerWidth < 786) this.isPhone = true;

        console.log("window width is" + window.innerWidth)

        setTimeout(() => {
            //activate the signature in the page
            var jsig: any = $("#inlineSignature");
            jsig.jSignature({
                'UndoButton': true,
                height: 125,
                width: 625
            })
        }, 2000)







    }



    // this is a function that is being run when the quantityPickedup var is chnaged
    quantityPickedupChanged(newValue) {
        if (newValue && Number(newValue) > this.itemDetail.quantity) {
            this.itemDetailsStatusMessage.innerHTML = "Quantity is greater than available quantity"
        } else {
            this.itemDetailsStatusMessage.innerHTML = ""
        }
    }

    //open sign form modal
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


    updatePickup(action) {
        console.log(action);
        var jsig: any = $("#signature");

        if (action == 'sign') {
            if (!jsig.jSignature("isModified")) {
                this.messageModalOpen('Please sign before submitting');
                return;
            }
            var sigdata = jsig.jSignature("getData", "base30")[1];
            this.pickup.signature = sigdata;


            //send the object to netsuite
            this.netsuite.updatePickup(this.pickup).then(result => {
                if (result.success) {
                    console.log("this is the result from confirm submit")
                    console.log(result);
                    console.log(this.pickup)
                    this.appState.unlockOrientation();
                    this.signFormModal.close();
                    this.confirmationModal.open();
                    jsig.empty();
                } else {
                    // alert("Error: pickup not submitted");
                    this.messageModalOpen("Error: Pickup not submitted")
                }
            }).catch(error => {
                console.log(error);
                // alert("Error: Delivery not submitted");
                this.messageModalOpen("Error: Pickup not submitted")

            });
        } else {

            this.appState.unlockOrientation();
            this.signFormModal.close();
            jsig.empty();
        }
    }


    //navagation google maps
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

    //redirect to main page
    redirectToMainlist() {
        this.confirmationModal.close();
        this.router.navigate("delivery");
    }

    messageModalOpen(message) {
        this.modalStatusMessage = message;
        this.messageModal.open()
    }

    // pull down menu items
    expandDetails(item: Item) {
        console.log(item);
        item.showpullDown = !item.showpullDown;
    }
    //close pull down
    collapseDetails(item: Item) {
        item.showpullDown = false;
    }







}
