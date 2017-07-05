import { Aurelia, autoinject } from 'aurelia-framework';
import { PLATFORM } from 'aurelia-pal';
import { Redirect, NavigationInstruction, Router, RouterConfiguration } from 'aurelia-router';
import { ApplicationState } from './application-state';
import { EventAggregator } from 'aurelia-event-aggregator';

@autoinject()
export class Entry {
    router: Router;

    configureRouter(config: RouterConfiguration, router: Router) {
        // console.log('configureRouter');
        config.title = 'AAA Flag Banner';
        config.addPipelineStep('authorize', AuthorizeStep);
        config.map([
            { route: ['', 'login'], name: 'login', moduleId: PLATFORM.moduleName('login'), nav: false, title: 'Login', settings: { auth: false } },
            { route: ['a'], name: 'app', moduleId: PLATFORM.moduleName('app'), nav: false, title: '', settings: { auth: true } },
            { route: ['dashboard'], name: 'dashboard', moduleId: PLATFORM.moduleName('dashboard'), nav: false, title: 'Dashboard', settings: { auth: false } },
        ]);

        this.router = router;
    }

    // constructor(private appState: ApplicationState, private eventAggregator: EventAggregator) {
    //     // console.log('Entry - constructor');
    //     // this.eventAggregator.subscribe('router:navigation:complete', payload => window.scrollTo(0, 0));
    // }
}

class AuthorizeStep {
    run(navigationInstruction: NavigationInstruction, next) {
        // console.log('AuthorizeStep');
        if (navigationInstruction.getAllInstructions().some(i => i.config.settings.auth)) { //.some(i => i.config.settings.roles.indexOf('admin') !== -1)) {
            var isLoggedIn = AuthorizeStep.isLoggedIn();
            // console.log(navigationInstruction.getBaseUrl(), navigationInstruction.params.siteUrl, navigationInstruction);
            // var siteUrl = navigationInstruction.params.siteUrl;
            // if (!siteUrl) siteUrl = 'aaa';
            if (!isLoggedIn) {
                return next.cancel(new Redirect('login'));
            }
            // var isAdmin = /* insert magic here */false;
            // if (!isAdmin) {
            //     return next.cancel(new Redirect('welcome'));
            // }
        }

        return next();
    }

    static isLoggedIn(): boolean {
        var auth_token = localStorage.getItem("aaa_token");
        return (typeof auth_token !== "undefined" && auth_token !== null);
    }
}
