import { autoinject } from 'aurelia-framework';
import { Category } from './models/lists';
import { NetsuiteService } from './services/netsuite-service';
import { User } from './models/user'
import { DialogService } from 'aurelia-dialog';
import { ModalAlert } from './modal-alert';

@autoinject
export class ApplicationState {
    version: string = '1.1.0';
    pageHeader: string;
    categories: Map<string, Category>;
    currentCategoryId: string;
    // resourceRootUrl;
    labelImagesRootUrl: string;
    user: Promise<User>;
    loadedUser: User;
    // lists: Lists;
    // listsPromise: Promise<Lists>;
    ADAL: adal.AuthenticationContext;

    constructor(private netsuite: NetsuiteService, private dialogService: DialogService) {
        console.info('Initializing AAA Production App - version:', this.version);
        // this.resourceRootUrl = ApplicationState.resourcesRootUrl;
        this.labelImagesRootUrl = 'https://aaaflag-labeling-images.s3-us-west-1.amazonaws.com/';
        // var user = (<any>window).userProfile;
        // this.user = new User(user.email, user.name, user.token, user.permissions, user.departmentId, user.departmentName);
        // this.lists = InitLists.build();
        // this.listsPromise = Promise.resolve(this.lists);
        // console.debug('Lists Loaded', this.lists);
        this.ADAL = new AuthenticationContext({
            // instance: 'https://login.microsoftonline.com/', // DEFAULT
            tenant: 'AAAFlagBanner.onmicrosoft.com',
            // tenant: 'common', //COMMON OR YOUR TENANT ID
            clientId: 'b8e9af52-a560-47f8-94e9-16f9b25c10dd',
            redirectUri: location.origin + '/frameRedirect.html',
            // redirectUri: 'http://production.aaaflag.com/frameRedirect.html',
            postLogoutRedirectUri: location.origin + '/',
            // postLogoutRedirectUri: 'http://production.aaaflag.com',
            // callback: this.userSignedIn.bind(this),
            popUp: false
        });
        // console.log('redirectUri:', location.origin + '/frameRedirect.html');
    }

    //if current local app does not match the incomming version of the object
    checkAppVersion(serverversion) {
        serverversion = serverversion.split(".");
        var localversion = this.version.split(".");

        if (localversion[0] < serverversion[0]) {
            location.reload();
        } else if (localversion[0] == serverversion[0] && localversion[1] < serverversion[1]) {
            location.reload();
        } else if (localversion[0] == serverversion[0] && localversion[1] == serverversion[1] && localversion[2] < serverversion[2]) {
            location.reload();
        } else {
            console.log("Version is up to date, version is " + this.version)
        }
    }

    static get RootUrl(): string {
        return location.origin;
        // return location.protocol + '//' + location.host;
        // if (location && location.hostname == 'localhost') {
        //     return 'https://localhost:444';
        // }
        // else {
        //     return 'http://production.aaaflag.com';
        // }
    }

    static get isEnvProd(): boolean {
        if (location.host.indexOf('sandbox') || location.host == 'localhost') {
            return false;
        }
        return true;
    }

    initApp(permissions?) {
        // if (typeof permissions == 'string') permissions = permissions.split(',');
        // console.log('permissions', permissions);
        this.categories = new Map<string, Category>();
        permissions.forEach((p) => {
            switch (p) {
                case 1:
                    this.categories.set('prepress', new Category(1, 'Prepress', 'prepress', '<i class="material-icons">photo_size_select_large</i>'));
                    break;
                case 2:
                    this.categories.set('pack', new Category(2, 'Packing', 'pack', '<i class="material-icons">label_outline</i>'));
                    this.categories.set('label', new Category(201, 'Print Labels', 'label', '<i class="material-icons">label_outline</i>'));
                    this.categories.set('ship', new Category(202, 'Shipping', 'ship', '<i class="material-icons">label_outline</i>'));
                    break;
                case 3:
                    this.categories.set('delivery', new Category(3, 'Delivery', 'delivery', '<i class="material-icons">local_shipping</i>'));
                    this.categories.set('pickup-list', new Category(3, 'Pickup List', 'pickup-list', '<i class="material-icons">local_shipping</i>'));
                    this.categories.set('delivery-schedule', new Category(301, 'Delivery Schedule', 'delivery-schedule', '<i class="material-icons">local_shipping</i>'));
                    this.categories.set('dashboard', new Category(300, 'Dashboard', 'dashboard', '<i class="material-icons">dashboard</i>'));
                    break;
                case 4:
                    this.categories.set('install', new Category(4, 'Installation', 'install', '<i class="material-icons">build</i>'));
                    this.categories.set('install-schedule', new Category(401, 'Installation Schedule', 'install-schedule', '<i class="material-icons">build</i>'));
                    break;
                case 5:
                    this.categories.set('estimating', new Category(5, 'Estimating', 'estimating', '<i class="material-icons">build</i>'));
                    break;
                default:
                    console.log('default', p);
            }
        })
    }

    showAlert(...options) {
        console.log(options);
        return this.dialogService.open({
            viewModel: ModalAlert,
            model: { options: options }
        })
    }

    lockOrientation(screenOrientation = 'landscape') {
        try {
            var screen: any = window.screen;
            var orientation = screen.orientation || screen.mozOrientation || screen.msOrientation;
            if (orientation) {
                orientation.lock(screenOrientation).catch(err => { console.log('Screen orientation lock failed'); });
            }
        } catch (e) {
            console.log('Screen orientation lock (' + screenOrientation + ') was NOT successful');
        }
    }

    unlockOrientation(rotateBack = true) {
        try {
            var screen: any = window.screen;
            var orientation = screen.orientation || screen.mozOrientation || screen.msOrientation;
            if (orientation) {
                var lockPromise = orientation.lock('natural').catch(err => { console.log('Screen orientation lock failed'); });
                if (lockPromise) lockPromise.then(() => orientation.unlock().catch(err => { console.log('Screen orientation unlock failed'); }));
                else orientation.unlock().catch(err => { console.log('Screen orientation unlock failed'); });
            }
        } catch (e) {
            console.log('Screen orientation unlock was NOT successful');
        }
    }

    getUser() {
        if (this.user) return this.user;

        return this.user = this.netsuite.validateToken().then((results) => {
            // console.log('getUser', results);
            if (results.success) {
                var user = new User(results.email, results.name, results.token, this.stringToNumArray(results.permissions), results.departmentId, results.departmentName);
                this.user = Promise.resolve(user);
                this.initApp(user.permissions);
                this.loadedUser = user;
                return this.user;
            }
            return Promise.reject('Invalid/Expired session');
        });
    }

    adalAuth(email, idToken) {
        return this.user = this.netsuite.adalAuth(email, idToken).then((results) => {
            // console.log('login', results);
            if (results.success) {
                localStorage.setItem("aaa_token", results.token);

                var user = new User(results.email, results.name, results.token, this.stringToNumArray(results.permissions), results.departmentId, results.departmentName);
                this.user = Promise.resolve(user);
                this.initApp(user.permissions);
                this.loadedUser = user;
                return this.user;
            }
            return Promise.reject('Invalid username and/or password');
        });
    }

    login(email, password) {
        return this.user = this.netsuite.authenticate(email, password).then((results) => {
            // console.log('login', results);
            if (results.success) {
                localStorage.setItem("aaa_token", results.token);

                var user = new User(results.email, results.name, results.token, this.stringToNumArray(results.permissions), results.departmentId, results.departmentName);
                this.user = Promise.resolve(user);
                this.initApp(user.permissions);
                this.loadedUser = user;
                return this.user;
            }
            return Promise.reject('Invalid username and/or password');
        });
    }

    stringToNumArray(value) {
        if (!value) return [];
        if (typeof value == 'string') value = value.split(',');
        if (Array.isArray(value)) return value.map((v) => Number(v));
        return [];
    }

}
