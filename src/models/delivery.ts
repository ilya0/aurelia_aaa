
// this is the class for individual items in the whole order
export class DeliveryItem {
    currentQuantityDelivered: number;
    checked: boolean;
    disabled: boolean;
    _showpullDown: boolean = false;
    private _quantityDelivered;
    private _currentQuantityDelivered_temp;
    quantityErrorMessage;

    constructor(
        public id,
        public itemDetail,
        public lineDetail,
        public tranid,
        public quantity: number,
        public item,
        public description,
        public dimensions
    ) {
    }


    get showpullDown() {
        return this._showpullDown;
    }
    set showpullDown(value) {
        this._showpullDown = value;
        // when pulldown is closed, reset _currentQuantityDelivered_temp
        // if (!value) {
        //     this._currentQuantityDelivered_temp = this.currentQuantityDelivered;
        //     this.quantityErrorMessage = ""
        // }
    }


    //need for the NaN issue showing up on the modal
    get quantityDelivered() {
        return this._quantityDelivered;
    }
    set quantityDelivered(value) {
        if (value == "" || value == null || value == undefined || isNaN(value)) {
            value = 0;
        }
        else {
            value = Number(value);
        }
        if (value > this.quantity) this.currentQuantityDelivered = 0;
        else this.currentQuantityDelivered = this.quantity - value;

        this._currentQuantityDelivered_temp = this.currentQuantityDelivered;
        this._quantityDelivered = value;

    }


    get currentQuantityDelivered_temp() {
        return this._currentQuantityDelivered_temp;
    }
    set currentQuantityDelivered_temp(value) {
        this._currentQuantityDelivered_temp = value;
        console.log(value);
        //if value is less than or qual to ( quanityordered-quanity delivered)
        if (value == "" || value == null) {
            this.currentQuantityDelivered = 0;
            this.quantityErrorMessage = ""
        } else if (value <= (this.quantity - this.quantityDelivered) && value >= 0) {
            this.currentQuantityDelivered = value;
            this.quantityErrorMessage = ""
        } else {
            if (value < 0)
                this.quantityErrorMessage = "Error"
            else
                this.quantityErrorMessage = "Quantity Exceeded"
        }
    }

}




export class ItemGroup {
    items: DeliveryItem[];
    constructor(
        public id,
    ) {
        this.items = [];
    }
}


//this is the class for the whole order
export class Delivery {
    //
    itemGroups: ItemGroup[];
    signature: string;
    address: string;
    recipient;
    confirmEmail;

    constructor(
        public id,
        public tranId: string,
        public company: string,
        public due,
        public dueDate,
        public dueTime,
        public instructions,
        public location,
        public requestedBy,
        public status,
        public statusId,
        public type,
        public typeId,
        public salesteam,
        public itemLocation,
        public description

    ) {
        //concatinating address for the nagviate method
        this.address = this.location.addr1;
        if (this.location.addr2) this.address += " " + this.location.addr2;
        if (this.location.addr3) this.address += " " + this.location.addr3;
        this.address += " " + this.location.city + " " + this.location.state + " " + this.location.zip;

        this.itemGroups = [];
    }
}


