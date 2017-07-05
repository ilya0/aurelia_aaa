
import 'materialize-css';
import { Aurelia } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-pal';

// import 'materialize-css/bin/materialize.css';
import '../static/materialize.scss';

// we want font-awesome to load as soon as possible to show the fa-spinner
// import 'font-awesome/css/font-awesome.css';
// import 'bootstrap/dist/css/bootstrap.css';
import '../static/app.css';
// import 'bootstrap';

// comment out if you don't want a Promise polyfill (remove also from webpack.config.js)
import * as Bluebird from 'bluebird';
Bluebird.config({ warnings: false });

export async function configure(aurelia: Aurelia) {
    aurelia.use
        .standardConfiguration()
        .developmentLogging()
        .plugin(PLATFORM.moduleName('resources/index'))
        .plugin(PLATFORM.moduleName('aurelia-dialog'), config => {
            config.useDefaults();
            config.settings.lock = false;
            // config.settings.centerHorizontalOnly = false;
            config.settings.startingZIndex = 1005;
        })
        .plugin(PLATFORM.moduleName('aurelia-materialize-bridge'), bridge => {
            bridge.useAll()
            // bridge
            //     // .useRange()
            //     .useInput()
            //     .useSidenav()
            //     .useNavbar()
            //     .useCollapsible()
            //     .useTooltip()
            //     .useModal()
            //     .useTransitions()
            //     .useProgress()
            //     .useCollection()
            //     .useWaves()
            //     .useDropdown()
            //     .useWell();

        });

    // Uncomment the line below to enable animation.
    // aurelia.use.plugin('aurelia-animator-css');
    // if the css animator is enabled, add swap-order="after" to all router-view elements

    // Anyone wanting to use HTMLImports to load views, will need to install the following plugin.
    // aurelia.use.plugin('aurelia-html-import-template-loader')

    await aurelia.start();
    aurelia.setRoot(PLATFORM.moduleName('entry'));

    // aurelia.start().then(() => aurelia.setRoot('app'));

    // if you would like your website to work offline (Service Worker),
    // install and enable the @easy-webpack/config-offline package in webpack.config.js and uncomment the following code:
    /*
    const offline = await System.import('offline-plugin/runtime');
    offline.install();
    */
}
