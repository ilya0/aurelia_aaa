
// this is the class for individual items in the whole order
export class Item {
    currentQuantityPickedup: number;
    checked: boolean;
    disabled: boolean;
    showpullDown: boolean = false;
    private _quantityPickedup;
    private _currentQuantityPickedup_temp;
    quantityErrorMessage;

    constructor(
        public id,
        public itemDetail,
        public item,
        public description,
        public quantity: number
    ) { }


    //need for the NaN issue showing up on the modal
    get quantityPickedup() {
        return this._quantityPickedup;
    }
    set quantityPickedup(value) {
        if (value == "" || value == null || value == undefined || isNaN(value)) {
            value = 0;
        }
        else {
            value = Number(value);
        }
        this.currentQuantityPickedup = this.quantity - value;
        this._currentQuantityPickedup_temp = this.currentQuantityPickedup;
        this._quantityPickedup = value;
    }


    get currentQuantityPickedup_temp() {
        return this._currentQuantityPickedup_temp;
    }

    set currentQuantityPickedup_temp(value) {
        this._currentQuantityPickedup_temp = value;
        console.log(value);
        //if value is less than or qual to ( quanityordered-quanity Pickedup)
        if (value == "" || value == null) {
            this.currentQuantityPickedup = 0;
            this.quantityErrorMessage = ""
        } else if (value <= (this.quantity - this.quantityPickedup) && value >= 0) {
            this.currentQuantityPickedup = value;
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
    items: Item[];
    constructor(
        public id,
    ) {
        this.items = [];
    }
}


//this is the class for the whole order
export class Transaction {
    //
    itemGroups: ItemGroup[];
    signature: string;
    address: string;
    recipient;
    confirmEmail;

    constructor(
        public id,
        public tranId: string,
        public customer: string,
        public dueDate,
        public salesteam,
        public projectTitle,
        public location,
        public contName,
        public contPhone
    ) {
        this.itemGroups = [];
    }
}


