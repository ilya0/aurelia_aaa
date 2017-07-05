import { Router } from 'aurelia-router';
import { inject, bindable } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { DialogService } from 'aurelia-dialog';
import { ApplicationState } from './application-state';
import { NetsuiteService } from './services/netsuite-service';

@inject(NetsuiteService, ApplicationState, Router, EventAggregator, DialogService)
export class Login {
    @bindable emailInput: HTMLInputElement;
    //@bindable submitButton: HTMLButtonElement;
    netsuite: NetsuiteService;
    appState: ApplicationState;
    router: Router;
    eventAggregator;
    dialogService;
    assetsRootUrl;
    homeImage1: string;
    email: string = '';
    password: string = '';
    processing: boolean;
    errorMsg: string = '';

    constructor(netsuite, appState, router, eventAggregator, dialogService) {
        // console.log('login constructor');
        this.netsuite = netsuite;
        this.router = router;
        this.eventAggregator = eventAggregator;
        this.dialogService = dialogService;
        this.appState = appState;
        this.netsuite = netsuite;
        this.appState.ADAL.config.callback = this.userSignedIn.bind(this);
    }

    signIn() {
        this.appState.ADAL.callback = this.userSignedIn.bind(this);
        this.appState.ADAL.login();
    }

    userSignedIn(err, token) {
        console.log('userSignedIn');
        try {
            if (!err) {
                // console.log("token: " + token);
                var adUser = this.appState.ADAL.getCachedUser();
                // console.log("user", adUser);
                return this.appState.adalAuth(adUser.userName, token).then((nsUser) => {
                    this.router.navigateToRoute('app');
                },
                    (error) => {
                        this.errorMsg = 'Error Logging In, Contact IT Dept to enable access';
                        localStorage.removeItem('aaa_token');
                        // this.router.navigateToRoute('login');
                    }
                );
            }
            else {
                console.error("error: " + err);
                this.errorMsg = 'Error Logging In, Please try again';
            }
        }
        catch (err) {
            console.log('Error', err);
        }
    }

    activate() {
        // console.log('Login - activate');
        var user = this.appState.ADAL.getCachedUser();
        // console.log("user", user);

        // ByPass login for testing
        // var token = "f57d1643-0399-4c96-ab10-ea944fde47bc"
        // localStorage.setItem("aaa_token", token);

        var token = localStorage.getItem("aaa_token");
        if (typeof token !== "undefined" && token !== null) {
            return this.appState.getUser().then((user) => {
                this.router.navigateToRoute('app');
            },
                (error) => {
                    localStorage.removeItem('aaa_token');
                    // this.router.navigateToRoute('login');
                }
            );
        }
        // else {
        //     this.router.navigateToRoute('login');
        // }
    }

    // activate(params) {
    //     var token = localStorage.getItem("aaa_token");
    //     if (typeof token !== "undefined" && token !== null) {
    //     }
    // }

    attached() {
        // this.emailInput.focus();
    }

    login() {
        this.errorMsg = '';
        this.processing = true;
        this.appState.login(this.email, this.password).then((user) => {
            this.router.navigateToRoute('app');
        }).catch(() => {
            this.processing = false;
            this.errorMsg = 'Invalid username and/or password';
        });
    };

}
