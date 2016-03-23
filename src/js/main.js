/*
 * Copyright (c) 2013-2016 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*global MashupPlatform, NGSI */

(function () {

    "use strict";

    /******************************************************************************/
    /********************************* PUBLIC *************************************/
    /******************************************************************************/

    var NGSISource = function NGSISource() {
        this.connection = null; // The connection to NGSI.
        this.refresh_interval = null;
    };

    NGSISource.prototype.init = function init() {
        // Set preference callbacks:
        MashupPlatform.prefs.registerCallback(handlerPreferences.bind(this));

        // Create NGSI conection:
        doInitialSubscription.call(this);
    };

    /******************************************************************************/
    /********************************* PRIVATE ************************************/
    /******************************************************************************/

    var doInitialSubscription = function doInitialSubscription() {

        this.subscriptionId = null;

        this.ngsi_server = MashupPlatform.prefs.get('ngsi_server');
        this.ngsi_proxy = MashupPlatform.prefs.get('ngsi_proxy');

        var request_headers = {};

        if (MashupPlatform.prefs.get('use_owner_credentials')) {
            request_headers['X-FI-WARE-OAuth-Token'] = 'true';
            request_headers['X-FI-WARE-OAuth-Header-Name'] = 'X-Auth-Token';
            request_headers['x-FI-WARE-OAuth-Source'] = 'workspaceowner';
        }

        var tenant = MashupPlatform.prefs.get('ngsi_tenant').trim().toLowerCase();
        if (tenant !== '') {
            request_headers['FIWARE-Service'] = tenant;
        }

        var path = MashupPlatform.prefs.get('ngsi_service_path').trim().toLowerCase();
        if (path !== '' && path !== '/') {
            request_headers['FIWARE-ServicePath'] = path;
        }

        this.connection = new NGSI.Connection(this.ngsi_server, {
            use_user_fiware_token: MashupPlatform.prefs.get('use_user_fiware_token'),
            request_headers: request_headers,
            ngsi_proxy_url: this.ngsi_proxy
        });

        var types = MashupPlatform.prefs.get('ngsi_entities').split(new RegExp(',\\s*'));
        var entityIdList = [];
        var entityId;
        var id_pattern = MashupPlatform.prefs.get('ngsi_id_filter');
        if (id_pattern === '') {
            id_pattern = '.*';
        }
        for (var i = 0; i < types.length; i++) {
            entityId = {
                id: id_pattern,
                type: types[i],
                isPattern: true
            };
            entityIdList.push(entityId);
        }
        var attributeList = null;
        var duration = 'PT3H';
        var throttling = null;
        var notifyConditions = [{
            'type': 'ONCHANGE',
            'condValues': MashupPlatform.prefs.get('ngsi_update_attributes').split(new RegExp(',\\s*'))
        }];
        var options = {
            flat: true,
            onNotify: function (data) {
                handlerReceiveEntities.call(this, data.elements);
            }.bind(this),
            onSuccess: function (data) {
                MashupPlatform.operator.log("Subscription created successfully (id: " + data.subscriptionId + ")", MashupPlatform.log.INFO);
                this.subscriptionId = data.subscriptionId;
                this.refresh_interval = setInterval(refreshNGSISubscription.bind(this), 1000 * 60 * 60 * 2);  // each 2 hours
                doInitialQueries.call(this, entityIdList);
                window.addEventListener("beforeunload", function () {
                    this.connection.cancelSubscription(this.subscriptionId, {
                        onSuccess: function () {
                            MashupPlatform.operator.log("Subscription cancelled sucessfully", MashupPlatform.log.INFO);
                        },
                        onFailure: function () {
                            MashupPlatform.operator.log("Error cancelling current context broker subscription");
                        }
                    });
                }.bind(this));
            }.bind(this),
            onFailure: function (e) {
                if (e instanceof NGSI.ProxyConnectionError) {
                    MashupPlatform.operator.log("Error connecting with the NGSI Proxy: " + e.cause.message);
                } else {
                    MashupPlatform.operator.log("Error creating subscription in the context broker server: " + e.message);
                }
            }
        };
        this.connection.createSubscription(entityIdList, attributeList, duration, throttling, notifyConditions, options);
    };

    var refreshNGSISubscription = function refreshNGSISubscription() {
        if (this.subscriptionId) {
            var duration = 'PT3H';
            var throttling = null;
            var notifyConditions = [{
                'type': 'ONCHANGE',
                'condValues': MashupPlatform.prefs.get('ngsi_update_attributes').split(new RegExp(',\\s*'))
            }];
            var options = {
                onSuccess: function () {
                    MashupPlatform.operator.log("Subscription refreshed sucessfully", MashupPlatform.log.INFO);
                },
                onFailure: function () {
                    MashupPlatform.operator.log("Error refreshing current context broker subscription");
                }
            };
            this.connection.updateSubscription(this.subscriptionId, duration, throttling, notifyConditions, options);
        }
    };

    var requestInitialData = function requestInitialData(entities, page) {
        this.connection.query(
            entities,
            null, // request all the attributes
            {
                details: true,
                flat: true,
                limit: 100,
                offset: page * 100,
                onSuccess: function (data, details) {
                    handlerReceiveEntities.call(this, data);
                    if (page < 100 && (page + 1) * 100 < details.count) {
                        requestInitialData.call(this, entities, page + 1);
                    }
                },
                onFailure: function () {
                    MashupPlatform.operator.log("Error retrieving initial values");
                }
            });
    };

    var doInitialQueries = function doInitialQueries(entities) {
        requestInitialData.call(this, entities, 0);
    };

    var handlerReceiveEntities = function handlerReceiveEntities(data) {
        for (var entityId in data.elements) {
            MashupPlatform.wiring.pushEvent("entityOutput", JSON.stringify(data.elements[entityId]));
        }
    };

    /**************************** Preference Handler *****************************/

    var handlerPreferences = function handlerPreferences(new_values) {

        if (this.refresh_interval) {
            clearInterval(this.refresh_interval);
            this.refresh_interval = null;
        }

        if (this.subscriptionId != null) {
            this.connection.cancelSubscription(this.subscriptionId, {
                onSuccess: function () {
                    MashupPlatform.operator.log("Old subscription has been cancelled sucessfully", MashupPlatform.log.INFO);
                },
                onFailure: function () {
                    MashupPlatform.operator.log("Error cancelling old subscription", MashupPlatform.log.WARN);
                },
                onComplete: doInitialSubscription.bind(this)
            });
        } else {
            doInitialSubscription.call(this);
        }
    };

    var ngsiSource = new NGSISource();
    window.addEventListener("DOMContentLoaded", ngsiSource.init.bind(ngsiSource), false);

})();
