export class AddLineBreaksValueConverter {
    toView(value) {
        return value.replace(/\n/g, '<br />');
    }
}
