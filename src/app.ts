import { Aurelia, autoinject, bindable } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-pal';
import { Redirect, NavigationInstruction, Router, RouterConfiguration } from 'aurelia-router';
import { EventAggregator } from 'aurelia-event-aggregator';
import { ApplicationState } from './application-state';
import { User } from './models/user';

@autoinject()
export class App {
    router: Router;
    user: User;
    @bindable sidenavController;

    configureRouter(config: RouterConfiguration, router: Router) {
        // console.log('App - configureRouter');
        // config.title = 'AAA Flag Banner';
        // config.addPipelineStep('authorize', AuthorizeStep);
        config.map([
            { route: ['', 'home'], name: 'home', moduleId: PLATFORM.moduleName('home'), nav: false, title: 'Overview' },
            { route: ['pack'], name: 'pack', moduleId: PLATFORM.moduleName('pack'), nav: false, title: 'Packing' },
            { route: ['label'], name: 'label', moduleId: PLATFORM.moduleName('label'), nav: false, title: 'Print Labels' },
            { route: ['ship'], name: 'ship', moduleId: PLATFORM.moduleName('ship'), nav: false, title: 'Shipping' },
            { route: ['prepress'], name: 'prepress', moduleId: PLATFORM.moduleName('prepress'), nav: false, title: 'Prepress' },
            { route: ['delivery'], name: 'delivery', moduleId: PLATFORM.moduleName('delivery'), nav: false, title: 'Delivery' },
            { route: ['delivery-detail/:id'], name: 'delivery-detail', moduleId: PLATFORM.moduleName('delivery-detail'), nav: false, title: 'Delivery Detail' },
            { route: ['delivery-schedule'], name: 'delivery-schedule', moduleId: PLATFORM.moduleName('delivery-schedule'), nav: false, title: 'Delivery Schedule' },
            { route: ['install'], name: 'install', moduleId: PLATFORM.moduleName('install'), nav: false, title: 'Installation' },
            { route: ['estimating'], name: 'estimating', moduleId: PLATFORM.moduleName('estimating'), nav: false, title: 'Estimating' },
            { route: ['dashboard/:id?'], name: 'dashboard', moduleId: PLATFORM.moduleName('dashboard'), nav: false, title: 'Dashboard' },
            { route: ['pickup-list'], name: 'pickup-list', moduleId: PLATFORM.moduleName('pickup-list'), nav: false, title: 'Pickup List' },
            { route: ['pickup-detail/:id'], name: 'pickup-detail', moduleId: PLATFORM.moduleName('pickup-detail'), nav: false, title: 'Pickup Detail' }


            // { route: ['added/:groupid'], name: 'overview', moduleId: 'home', nav: false, title: 'Overview' },
            // { route: ['configure/:id/:itemid'], name: 'configure', moduleId: 'configure', nav: false, title: 'Configure' },
            // { route: ['edit/:groupid/:itemid'], name: 'edit', moduleId: 'configure', nav: false, title: 'Configure' },
            // { route: ['category/:id/:name'], name: 'category', moduleId: 'categories', nav: false, title: 'Categories' }
        ]);

        this.router = router;
    }

    constructor(private appState: ApplicationState, private eventAggregator: EventAggregator) {
        // console.log('App - constructor');
        this.eventAggregator.subscribe('router:navigation:complete', payload => window.scrollTo(0, 0));
    }

    navigateTo(routeName) {
        this.sidenavController.hide();
        this.router.navigateToRoute(routeName);
    }

    activate(params: ParameterDecorator, routeConfig: RouterConfiguration) {
        // console.log('App - activate');

        return this.appState.getUser().then((user) => {
            this.user = user;
        },
            (error) => {
                this.signOut();
            }
        );
    }

    signOut() {
        localStorage.removeItem('aaa_token');
        this.appState.ADAL.logOut();
        this.router.navigateToRoute('login');
    }
}

// class AuthorizeStep {
//     run(navigationInstruction: NavigationInstruction, next) {
//         console.log('AuthorizeStep');
//         if (navigationInstruction.getAllInstructions().some(i => i.config.settings.auth)) { //.some(i => i.config.settings.roles.indexOf('admin') !== -1)) {
//             var isLoggedIn = AuthorizeStep.isLoggedIn();
//             // console.log(navigationInstruction.getBaseUrl(), navigationInstruction.params.siteUrl, navigationInstruction);
//             // var siteUrl = navigationInstruction.params.siteUrl;
//             // if (!siteUrl) siteUrl = 'aaa';
//             if (!isLoggedIn) {
//                 return next.cancel(new Redirect('login'));
//             }
//             // var isAdmin = /* insert magic here */false;
//             // if (!isAdmin) {
//             //     return next.cancel(new Redirect('welcome'));
//             // }
//         }

//         return next();
//     }

//     static isLoggedIn(): boolean {
//         var auth_token = localStorage.getItem("aaa_token");
//         return (typeof auth_token !== "undefined" && auth_token !== null);
//     }
// }
