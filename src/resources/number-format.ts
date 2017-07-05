import { Binding, Scope } from 'aurelia-binding';
// import * as Numeral from 'numeral';
// import numeral = require('numeral');

export class NumberFormatValueConverter {
    toView(value, format?) {
        return (value) ? value.toString(10) : '';//Numeral(value).format(format);
    }

    fromView(string) {
        var value = parseInt(string);
        console.log(this, value);
        this.toView(value);
        return value;
    }
}

// const interceptMethods = ['updateTarget', 'updateSource', 'callSource'];
// const interceptMethods = ['updateSource'];

// export class NumberFormatBindingBehavior {
//     bind(binding: Binding, scope: Scope, options) {
//         // console.debug('this', this);
//         // console.debug('binding', binding);
//         // console.debug('scope', scope);
//         // console.debug('options', options);
//         let i = interceptMethods.length;
//         while (i--) {
//             let method = interceptMethods[i];
//             if (!binding[method]) {
//                 continue;
//             }
//             binding[`intercepted-${method}`] = binding[method];
//             //   let update = binding[method].bind(binding);
//             //   binding[method] = interceptor.bind(binding, method, update);
//             binding[method] = function (value) {
//                 console.debug('binding value', value)
//                 const intValue = parseInt(value, 10);
//                 // console.debug('intValue', intValue);
//                 if (isNaN(intValue)) {
//                     this.standardUpdateSource(null);
//                     return;
//                 }
//                 this.standardUpdateSource(intValue);
//                 // console.debug('int-to-string', intValue.toString(10));
//                 if (intValue.toString(10) !== value) {
//                     this.updateTarget(intValue.toString(10));
//                 }
//             }
//         }
//     }

//     unbind(binding, scope) {
//         let i = interceptMethods.length;
//         while (i--) {
//             let method = interceptMethods[i];
//             if (!binding[method]) {
//                 continue;
//             }
//             binding[method] = binding[`intercepted-${method}`];
//             binding[`intercepted-${method}`] = null;
//         }
//     }
// }