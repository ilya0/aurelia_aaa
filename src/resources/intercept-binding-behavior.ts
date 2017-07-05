import { Binding, Scope } from 'aurelia-binding';

const interceptMethods = ['updateTarget', 'updateSource', 'callSource'];

export class InterceptBindingBehavior {
    bind(binding: Binding, scope: Scope, interceptor, options) {
        // console.log('interceptor', interceptor, options);
        let i = interceptMethods.length;
        while (i--) {
            let method = interceptMethods[i];
            if (!binding[method]) {
                continue;
            }
            binding['intercepted-' + method] = binding[method];
            // binding['intercepted-options'] = options;
            let update = binding[method].bind(binding);
            // let updateTarget = binding['updateTarget'].bind(binding);
            // let updateSource = binding['updateSource'].bind(binding);
            binding[method] = interceptor.bind(binding, method, update, options);
        }
    }

    unbind(binding, scope) {
        let i = interceptMethods.length;
        while (i--) {
            let method = interceptMethods[i];
            if (!binding[method]) {
                continue;
            }
            binding[method] = binding['intercepted-' + method];
            binding['intercepted-' + method] = null;
            // binding['intercepted-options'] = null;
        }
    }
}