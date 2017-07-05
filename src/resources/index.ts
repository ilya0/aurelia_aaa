import { PLATFORM } from 'aurelia-pal';

export async function configure(aurelia) {
    aurelia.globalResources(
        PLATFORM.moduleName('resources/filter'),
        PLATFORM.moduleName('resources/add-line-breaks-value-converter'),
        // 'resources/number-format',
        PLATFORM.moduleName('resources/intercept-binding-behavior'),
        PLATFORM.moduleName('resources/integer-input-binding-behavior'),
        PLATFORM.moduleName('resources/currency-input-binding-behavior')
    );
}
