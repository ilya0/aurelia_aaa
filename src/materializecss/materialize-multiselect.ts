import {customElement, bindable, inject} from 'aurelia-framework';

export class MaterializeMultiselectCustomElement {
    @bindable selectOptions;
    @bindable selectedArray: string[];
    @bindable optionText;
    @bindable changedCallback;
    @bindable selectList: any;

    selected: string[];
    
    // constructor() {
    //     // if (this.selectedArray) this.selected = this.selectedArray;
    //     // else this.selected = [];
    // }
    
    attached() {
        console.log(this.selectedArray);
        if (this.selectedArray) this.selected = this.selectedArray;
        else this.selected = [];

        if (this.selected.length) {
            this.selected.forEach(function(selId) {
                $('#sel' + selId).attr('selected', 'selected')
            });
        }
        
        var self = this;
        //var select: any = $('select.materialize');
        var select: any = $(this.selectList);
        select.material_select(function() {
            var selectedNew: string[] = select.val();
            var added = [], removed = [];
            if (selectedNew && !Array.isArray(selectedNew)) selectedNew = [String(selectedNew)];
            if (!selectedNew || selectedNew.length < self.selected.length) {
                if (selectedNew && selectedNew.length) {
                    removed = self.selected.filter(s => selectedNew.indexOf(s) == -1);
                }
                else {
                    removed = self.selected;
                    selectedNew = [];
                }
            }
            else{
                if (self.selected.length) {
                    added = selectedNew.filter(s => self.selected.indexOf(s) == -1);
                }
                else {
                    added = selectedNew;
                }
            }
            //self.$parent.test(selected[selected.length-1]);
            self.selected = selectedNew;
            if (self.selectedArray) self.selectedArray = selectedNew;
            self.changedCallback(added, removed);
        });
        //select.on('change', function(){ console.log('changed!', select.val()) });
    }

}