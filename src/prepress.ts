import { autoinject, bindable } from 'aurelia-framework';
import { NetsuiteService } from './services/netsuite-service';
import { ApplicationState } from './application-state';
import { EventAggregator } from 'aurelia-event-aggregator';
import { ImageEditor } from './resources/image-editor';

@autoinject
export class Prepress {
    @bindable inputField: string;
    @bindable transaction;
    inputFieldRef: HTMLInputElement;
    selectedDepartment;
    @bindable canvasElement: HTMLCanvasElement;
    @bindable selectedVersion;
    pasteImageEvent;
    loading: boolean;

    // statuses: object[] = [
    //     { id: 1, name: "In Progress" },
    //     { id: 2, name: "On Hold" },
    //     { id: 3, name: "Pending Customer" },
    //     { id: 4, name: "Printing" },
    // ]

    // updateallstatus(status) {
    //     this.selectedDepartment.items.forEach((item) => {
    //         console.log(item);
    //         item.status = status;
    //     });
    // }

    constructor(public appState: ApplicationState, public netsuite: NetsuiteService, public eventAggregator: EventAggregator) {
        this.appState.pageHeader = 'Prepress';
        this.selectedVersion = { id: 0, dropzone: null };
        // this.selectedDepartment = this.appState.user.departmentId;
    }

    attached(params, routeConfig) {
        this.inputFieldRef.focus();

        this.pasteImageEvent = this.pasteImageHandler.bind(this);
        window.addEventListener("paste", this.pasteImageEvent); //chrome only?
        // this.mdPixelSize = 25;

        // Automatically load order when testing
        // this.inputFieldChanged("309543");
    }

    detached() {
        window.removeEventListener("paste", this.pasteImageEvent);
    }

    pasteImageHandler(e) {
        var clipboardData = (e.clipboardData || e.originalEvent.clipboardData);
        if (!clipboardData) return false; //empty
        var items = clipboardData.items;
        if (items == undefined) return false;
        for (var i = 0; i < items.length; i++) {
            console.log('pasted item type:', items[i].type);
            if (items[i].type.indexOf("image") === -1) continue; //not image
            if (!this.selectedVersion.dropzone) {
                alert('Select item before pasting image');
                return false;
            }
            var blob = items[i].getAsFile();
            // try {
            //     blob.name = 'screenshot.' + items[i].type.split('/')[1];
            // } catch (err) { }
            var dropzone = <Dropzone>this.selectedVersion.dropzone;
            ImageEditor.resize(blob).then((result: any) => {
                result.file.name = 'screenshot.jpg'
                dropzone.addFile(result.file);
            });
            this.selectedVersion = { id: 0, dropzone: null };
        }
    }

    // populates the data with the used id
    inputFieldChanged(newValue: string) {
        var includesPrefix = ((newValue[0] == 'S' || newValue[0] == 's') && (newValue[1] == 'O' || newValue[1] == 'o'));
        if ((!includesPrefix && newValue.length == 6) || (includesPrefix && newValue.length == 8)) {
            this.loading = true;
            this.netsuite.getOrder(newValue).then(result => {
                console.log('transaction', result);
                if (result.success) {
                    this.transaction = result.record;
                    this.inputField = '';

                    // this.transaction.departments.forEach((dept) => {
                    //     dept.items.forEach((item) => {
                    //         console.log(item);
                    //         item.status = this.statuses[0];
                    //     });
                    // });

                    if (this.appState.loadedUser.departmentId) {
                        setTimeout(() => {
                            this.transaction.departments.forEach((dept) => {
                                if (dept.id == this.appState.loadedUser.departmentId) {
                                    this.selectedDepartment = dept;
                                }

                            });
                        }, 1);
                    }
                }
                else {
                    this.transaction = null;
                }
                this.loading = false;
            });
        }
    }
}
