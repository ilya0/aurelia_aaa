import { autoinject } from 'aurelia-framework';
import { HttpClient } from "aurelia-http-client";
// import 'isomorphic-fetch';
// import { HttpClient } from "aurelia-fetch-client";
import { ApplicationState } from "../application-state"

export class NetsuiteService {

    authkey: '81546585-ae5d-4eac-bf8c-20717f2b7662';
    account: "4095715";
    endpoints;
    // endpoints: {
    //     productionApi: "https://forms.na1.netsuite.com/app/site/hosting/scriptlet.nl?script=101&deploy=1&compid=4095715&h=fe68833c133738a9c61b",
    //     authApi: "https://forms.na1.netsuite.com/app/site/hosting/scriptlet.nl?script=102&deploy=1&compid=4095715&h=b56cd41067382fcc6980",
    //     searchApi: "https://forms.na1.netsuite.com/app/site/hosting/scriptlet.nl?script=2&deploy=1&compid=4095715&h=6e6dd90d342df3b28df9",
    //     recordApi: "https://forms.na1.netsuite.com/app/site/hosting/scriptlet.nl?script=6&deploy=1&compid=4095715&h=800a576b354c33f5a25d",
    //     getFile: "https://forms.na1.netsuite.com/app/site/hosting/scriptlet.nl?script=8&deploy=1&compid=4095715&h=d9192a3c41ff463e4bcd"
    // };

    constructor() {
        this.endpoints = {
            productionApi: "https://forms.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=101&deploy=1&compid=4095715&h=fe68833c133738a9c61b",
            dashboardApi: "https://forms.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=106&deploy=1&compid=4095715&h=7dec860294280cc3e769",
            authApi: "https://forms.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=102&deploy=1&compid=4095715&h=b56cd41067382fcc6980",
            label: "https://forms.sandbox.netsuite.com/app/site/hosting/scriptlet.nl?script=105&deploy=1&compid=4095715&h=9282a6f94e11499ea7ac",

            // productionApi: "https://forms.na1.netsuite.com/app/site/hosting/scriptlet.nl?script=101&deploy=1&compid=4095715&h=fe68833c133738a9c61b",
            // dashboardApi: "https://forms.na1.netsuite.com/app/site/hosting/scriptlet.nl?script=106&deploy=1&compid=4095715&h=7dec860294280cc3e769",
            // authApi: "https://forms.na1.netsuite.com/app/site/hosting/scriptlet.nl?script=102&deploy=1&compid=4095715&h=b56cd41067382fcc6980",
            // label: "https://forms.na1.netsuite.com/app/site/hosting/scriptlet.nl?script=105&deploy=1&compid=4095715&h=9282a6f94e11499ea7ac",

            // searchApi: "https://forms.na1.netsuite.com/app/site/hosting/scriptlet.nl?script=2&deploy=1&compid=4095715&h=6e6dd90d342df3b28df9",
            // recordApi: "https://forms.na1.netsuite.com/app/site/hosting/scriptlet.nl?script=6&deploy=1&compid=4095715&h=800a576b354c33f5a25d",
            // getFile: "https://forms.na1.netsuite.com/app/site/hosting/scriptlet.nl?script=8&deploy=1&compid=4095715&h=d9192a3c41ff463e4bcd"
        };
        // this.urls = this.netsuite.externalUrls;
        // if (ApplicationState.isEnvInternal) {
        //     this.urls = this.netsuite.internalUrls;
        // }
        // else {
        //     if (ApplicationState.isEnvProd)
        //         this.urls = this.netsuite.externalUrls;
        //     else
        //         this.urls = this.netsuite.externalSandboxUrls;
        // }
    }

    authenticate(email, password) {
        return this.sendJsonp({
            endpoint: this.endpoints.authApi,
            parameters: {
                aaa_action: 'auth',
                aaa_email: email,
                aaa_pass: password
            }
        });
    }

    adalAuth(email, idToken) {
        return this.sendJsonp({
            endpoint: this.endpoints.authApi,
            parameters: {
                aaa_action: 'adal-auth',
                aaa_email: email,
                aaa_idtoken: idToken
            }
        });
    }

    validateToken() {
        return this.sendJsonp({
            endpoint: this.endpoints.authApi,
            parameters: {
                aaa_action: 'validate',
                // aaa_token: token
            }
        });
    }

    getOrder(id) {
        return this.send({
            parameters: {
                aaa_action: 'get-order',
                aaa_id: id
            }
        });
    }

    getTransaction(id) {
        return this.send({
            parameters: {
                aaa_action: 'get-transaction',
                aaa_id: id
            }
        });
    }

    getDeliveries(ordernumber = "") {
        return this.send({
            parameters: {
                aaa_action: 'get-deliveries',
                aaa_value: ordernumber
            }
        });
    }

    getPickupOrders(id?) {
        return this.send({
            parameters: {
                aaa_action: 'get-pickup-orders',
                aaa_value: id
            }
        });
    }


    getDelivery(id) {
        return this.sendJsonp({
            parameters: {
                aaa_action: 'get-delivery',
                aaa_id: id
            }
        });
    }

    updateDelivery(delivery) {
        return this.send({
            parameters: {
                aaa_action: 'update-delivery',
                aaa_value: delivery
            }
        });
    }



    getEstimates() {
        return this.sendJsonp({
            parameters: {
                aaa_action: 'get-estimates',
            }
        });
    }

    setEstimator(recId, value) {
        return this.sendJsonp({
            parameters: {
                aaa_action: 'set-estimator',
                aaa_id: recId,
                aaa_value: value
            }
        });
    }

    getOrderFulfillments(id) {
        return this.send({
            parameters: {
                aaa_action: 'get-order-fulfillments',
                aaa_id: id
            }
        });
    }

    getOpenFulfillments(id?) {
        return this.send({
            parameters: {
                aaa_action: 'get-open-fulfillments',
                aaa_id: id
            }
        });
    }

    getPackedFulfillments() {
        return this.send({
            parameters: {
                aaa_action: 'get-packed-fulfillments',
            }
        });
    }

    saveFulfillment(data) {
        return this.send({
            parameters: {
                aaa_action: 'save-fulfillment',
                aaa_value: data
            }
        });
    }

    getDashboardItems() {
        return this.sendGet({
            endpoint: this.endpoints.dashboardApi,
            parameters: {
                aaa_action: '',
            }
        });
    }

    setLabelImage(id, path, width, height, size) {
        return this.send({
            parameters: {
                aaa_action: 'set-label-image',
                aaa_id: id,
                aaa_value: path,
                aaa_width: width,
                aaa_height: height,
                aaa_size: size
            }
        });
    }

    send(request) {
        var endpoint = request.endpoint || this.endpoints.productionApi;
        request.parameters.aaa_token = localStorage.getItem("aaa_token");

        var client: HttpClient = new HttpClient();
        return client.put(endpoint, request.parameters)
            .then(response => {
                // console.log('success', response);
                if (response.isSuccess && response.statusCode == 200) {
                    return response.content;
                } else {
                    return Promise.reject(response);
                }
            },
            response => {
                // console.log('failure', response);
                return Promise.reject(response);
            });
    }

    sendGet(request) {
        var endpoint = request.endpoint || this.endpoints.productionApi;
        request.parameters.aaa_token = localStorage.getItem("aaa_token");

        var client: HttpClient = new HttpClient();
        return client.get(endpoint)
            .then(response => {
                // console.log('success', response);
                if (response.isSuccess && response.statusCode == 200) {
                    return response.content;
                } else {
                    return Promise.reject(response);
                }
            },
            response => {
                // console.log('failure', response);
                return Promise.reject(response);
            });
    }

    sendJsonp(request) {
        var serialize = function (obj, prefix?) {
            var str = [];
            for (var p in obj) {
                if (obj.hasOwnProperty(p)) {
                    var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                    str.push(typeof v == "object" ?
                        serialize(v, k) :
                        encodeURIComponent(k) + "=" + encodeURIComponent(v));
                }
            }
            return str.join("&");
        }

        var endpoint = request.endpoint || this.endpoints.productionApi;
        var querystring = serialize(request.parameters);

        var client: HttpClient = new HttpClient();
        return client.jsonp(endpoint + '&aaa_token=' + localStorage.getItem("aaa_token") + '&' + querystring)
            .then(response => {
                // console.log(response);
                if (response.isSuccess) {
                    return response.content;
                } else {
                    throw response.statusText;
                }
            });
    }

}
