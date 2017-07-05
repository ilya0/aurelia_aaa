import { Router } from 'aurelia-router';
import { autoinject, bindable } from 'aurelia-framework';
import { ApplicationState } from './application-state';

@autoinject()
export class MenuItem {
    @bindable category;

    constructor(private appState: ApplicationState, private router: Router) {
    }

    navMenuClick(routeName) {
        this.router.navigateToRoute(routeName);
    }

}
