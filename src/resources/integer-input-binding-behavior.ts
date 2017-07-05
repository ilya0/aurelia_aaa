import { Binding, Scope } from 'aurelia-binding';

const interceptMethods = ['updateTarget', 'updateSource'];

export class IntegerInputBindingBehavior {
    bind(binding: Binding, scope: Scope, interceptor, options) {
        // console.log('interceptor', interceptor, options);
        let i = interceptMethods.length;
        while (i--) {
            let method = interceptMethods[i];
            if (!binding[method]) {
                continue;
            }
            binding['intercepted-' + method] = binding[method];
        }
        let updateTarget = binding['updateTarget'].bind(binding);
        let updateSource = binding['updateSource'].bind(binding);
        binding['updateTarget'] = this.upTarget.bind(binding, updateTarget, updateSource, options);
        binding['updateSource'] = this.upSource.bind(binding, updateTarget, updateSource, options);
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

    upTarget(this: any, updateTarget, updateSource, options, value) {
        // console.log(`Intercepted the binding's [updateTarget] method!  The value is "${value}".`);
        // console.log(this, options);

        var strValue: string = (value || value == 0) ? value.toString(10) : '';
        // console.log('target.value', this.target.value);
        if (this.target.value != strValue) {
            // console.log('update target', strValue);
            updateTarget(strValue);
        }
    };

    upSource(this: any, updateTarget, updateSource, options, value) {
        // console.log(`Intercepted the binding's [updateSource] method!  The value is "${value}".`);
        // console.log(this, options);

        // let targetObserver = this.observerLocator.getObserver(this.target, this.targetProperty);
        // console.log('targetObserver', targetObserver);
        const intValue = parseInt(value, 10);
        // console.debug('intValue', intValue);
        if (isNaN(intValue)) {
            // console.log('update source "null"');
            // if (options != 'blur') update(null);
            // else this.updateTarget('');
            updateTarget('');
            updateSource(null);
            return;
        }
        let modelValue = this.sourceExpression.evaluate(this.source, this.lookupFunctions);
        // console.log('modelValue', modelValue);
        if (modelValue != intValue) updateSource(intValue);
        // if (options != 'blur12' || (intValue < 12 && intValue >= 0)) this.updateSource(intValue);
        var strValue: string = intValue.toString(10);
        // console.debug('int-to-string', intValue.toString(10));
        // console.log('target.value', this.target.value);
        // console.log('string value', strValue);
        if (value != strValue) {
            // console.log('update target from updateSource', strValue);
            updateTarget(strValue);
        }
    };

}