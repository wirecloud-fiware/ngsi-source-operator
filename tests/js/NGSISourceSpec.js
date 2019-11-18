/* globals MashupPlatform, MockMP, beforeAll, afterAll, beforeEach, NGSISource */

(function () {

    "use strict";

    describe("NGSI Source operator should", function () {

        var operator, abort_mock, entity_pages, entity_page_i;

        beforeAll(function () {
            window.MashupPlatform = new MockMP({
                type: 'operator',
                prefs: {
                    'query': '',
                    'ngsi_entities': '',
                    'ngsi_id_filter': '',
                    'ngsi_proxy': 'https://ngsiproxy.example.com',
                    'ngsi_server': 'https://orion.example.com',
                    'ngsi_tenant': 'Tenant',
                    'ngsi_service_path': '/Spain/Madrid',
                    'ngsi_update_attributes': '',
                    'use_owner_credentials': false,
                    'use_user_fiware_token': false,
                    'attrs_format': "keyValues"
                },
                outputs: ['entityOutput', 'ngsimetadata']
            });
        });

        beforeEach(function () {
            MashupPlatform.reset();
            MashupPlatform.resetData();
            operator = new NGSISource();
            abort_mock = jasmine.createSpy('abort');
            entity_pages = [{results: [], cout: 0}];
            entity_page_i = 0;
            window.NGSI = {
                Connection: jasmine.createSpy('NGSI').and.callFake(function () {
                    this.v2 = {
                        createSubscription: jasmine.createSpy('createSubscription').and.callFake(function () {
                            return Promise.resolve({subscription: {id: '5a291bb652c2f6bef3e02fd9'}});
                        }),
                        deleteSubscription: jasmine.createSpy('deleteSubscription').and.callFake(function () {
                            return Promise.resolve();
                        }),
                        listEntities: jasmine.createSpy('listEntities').and.callFake(function () {
                            var i = entity_page_i++;
                            if (entity_page_i == entity_pages.length) {
                                entity_page_i = 0;
                            }
                            var p = Promise.resolve(entity_pages[i]);
                            return {
                                then: function () {
                                    var result = p.then(arguments[0], arguments[1]);
                                    result.abort = abort_mock;
                                    return result;
                                }
                            };
                        })
                    };
                })
            };
            window.moment = jasmine.createSpy('moment').and.callFake(function () {
                return {
                    add: function () {return this;},
                    toISOString: function () {}
                };
            });

            spyOn(window, 'addEventListener');
        });

        it("wait until the init method is called", function () {
            expect(operator.connection).toBe(null);
            expect(operator.refresh_interval).toBe(null);
            expect(operator.query_task).toBe(null);
        });

        it("does not try to connect on init if the output endpoint is not connected", () => {
            operator.init();

            expect(operator.connection).toEqual(null);
            expect(NGSI.Connection).not.toHaveBeenCalled();
        });

        it("connects on wiring change", () => {
            operator.init();

            expect(operator.connection).toEqual(null);
            MashupPlatform.operator.outputs.entityOutput.connect(true);
            MashupPlatform.wiring.registerStatusCallback.calls.mostRecent().args[0]();

            expect(operator.connection).not.toEqual(null);
        });

        it("connect on init", (done) => {
            MashupPlatform.operator.outputs.entityOutput.connect(true);

            entity_pages = [
                {
                    count: 3,
                    results: [
                        {id: "1", attr1: 5},
                        {id: "2", attr2: false},
                        {id: "3", attr1: []},
                    ]
                }
            ];
            operator.init();

            expect(operator.connection).not.toEqual(null);
            expect(NGSI.Connection).toHaveBeenCalledWith('https://orion.example.com', {
                ngsi_proxy_url: 'https://ngsiproxy.example.com',
                request_headers: {
                    'FIWARE-Service': 'Tenant',
                    'FIWARE-ServicePath': '/Spain/Madrid'
                },
                use_user_fiware_token: false
            });

            // Wait until it process the initial entities
            setTimeout(() => {
                expect(MashupPlatform.wiring.pushEvent).toHaveBeenCalledWith("entityOutput", entity_pages[0].results);
                done();
            }, 0);
        });

        it("should ignore wiring change events if already connected", () => {
            MashupPlatform.operator.outputs.entityOutput.connect(true);
            operator.init();

            var initial_connection = operator.connection;
            MashupPlatform.wiring.registerStatusCallback.calls.mostRecent().args[0]();

            expect(operator.connection).toBe(initial_connection);
        });

        it("connect on init (multiple entity pages)", (done) => {
            MashupPlatform.operator.outputs.entityOutput.connect(true);

            entity_pages = [
                {
                    // We are not going to provide 150 entities, but code is
                    // not checking the returned number of entities
                    count: 150,
                    results: [
                        {id: "1", attr1: 5},
                        {id: "2", attr2: false},
                        {id: "3", attr1: []},
                    ]
                },
                {
                    count: 150,
                    results: [
                        {id: "4", attr3: 5},
                        {id: "5", attr1: false},
                        {id: "6", attr2: []},
                    ]
                }
            ];
            operator.init();

            expect(operator.connection).not.toEqual(null);
            expect(NGSI.Connection).toHaveBeenCalledWith('https://orion.example.com', {
                ngsi_proxy_url: 'https://ngsiproxy.example.com',
                request_headers: {
                    'FIWARE-Service': 'Tenant',
                    'FIWARE-ServicePath': '/Spain/Madrid'
                },
                use_user_fiware_token: false
            });

            // Wait until it process the initial entities
            setTimeout(() => {
                expect(MashupPlatform.wiring.pushEvent).toHaveBeenCalledWith("entityOutput", entity_pages[0].results);
                expect(MashupPlatform.wiring.pushEvent).toHaveBeenCalledWith("entityOutput", entity_pages[1].results);
                done();
            }, 0);
        });

        it("connect (empty service)", () => {
            MashupPlatform.operator.outputs.entityOutput.connect(true);
            MashupPlatform.prefs.set('ngsi_tenant', '');

            operator.init();

            expect(operator.connection).not.toEqual(null);
            expect(NGSI.Connection).toHaveBeenCalledWith('https://orion.example.com', {
                ngsi_proxy_url: 'https://ngsiproxy.example.com',
                request_headers: {
                    'FIWARE-ServicePath': '/Spain/Madrid'
                },
                use_user_fiware_token: false
            });
        });

        it("connect (empty service path)", () => {
            MashupPlatform.operator.outputs.entityOutput.connect(true);
            MashupPlatform.prefs.set('ngsi_service_path', '');

            operator.init();

            expect(operator.connection).not.toEqual(null);
            expect(NGSI.Connection).toHaveBeenCalledWith('https://orion.example.com', {
                ngsi_proxy_url: 'https://ngsiproxy.example.com',
                request_headers: {
                    'FIWARE-Service': 'Tenant'
                },
                use_user_fiware_token: false
            });
        });

        it("connect (types + subscription)", (done) => {
            MashupPlatform.operator.outputs.entityOutput.connect(true);
            MashupPlatform.prefs.set('ngsi_entities', 'AirQualityObserved, WeatherForecast');
            MashupPlatform.prefs.set('ngsi_update_attributes', 'location');

            operator.init();

            // Wait until initial queries are processed
            setTimeout(() => {
                // List Entities Options
                var leo = operator.connection.v2.listEntities.calls.mostRecent().args[0];
                expect(leo.keyValues).toEqual(true);
                expect(leo.type).toEqual("AirQualityObserved,WeatherForecast");

                // Create Subscription Options
                var cso = operator.connection.v2.createSubscription.calls.mostRecent().args[0];

                expect(cso.subject.entities).toEqual([
                    {idPattern: '.*', type: 'AirQualityObserved'},
                    {idPattern: '.*', type: 'WeatherForecast'}
                ]);
                expect(cso.notification.attrsFormat).toEqual("keyValues");

                done();
            }, 0);
        });

        it("connect (idPattern + subscription)", (done) => {
            MashupPlatform.operator.outputs.entityOutput.connect(true);
            MashupPlatform.prefs.set('ngsi_id_filter', 'a.*b');
            MashupPlatform.prefs.set('ngsi_update_attributes', 'location');

            operator.init();

            // Wait until initial queries are processed
            setTimeout(() => {
                // List Entities Options
                var leo = operator.connection.v2.listEntities.calls.mostRecent().args[0];
                expect(leo.keyValues).toEqual(true);
                expect(leo.idPattern).toEqual("a.*b");

                // Create Subscription Options
                var cso = operator.connection.v2.createSubscription.calls.mostRecent().args[0];

                expect(cso.subject.entities).toEqual([
                    {idPattern: 'a.*b'}
                ]);
                expect(cso.notification.attrsFormat).toEqual("keyValues");

                done();
            }, 0);
        });

        it("connect (query + subscription)", (done) => {
            MashupPlatform.operator.outputs.entityOutput.connect(true);
            MashupPlatform.prefs.set('query', 'temperature<=20');
            MashupPlatform.prefs.set('ngsi_update_attributes', 'location');

            operator.init();

            // Wait until initial queries are processed
            setTimeout(() => {
                // List Entities Options
                var leo = operator.connection.v2.listEntities.calls.mostRecent().args[0];
                expect(leo.keyValues).toEqual(true);
                expect(leo.q).toEqual("temperature<=20");

                // Create Subscription Options
                var cso = operator.connection.v2.createSubscription.calls.mostRecent().args[0];

                expect(cso.subject.condition).toEqual({
                    attrs: ['location'],
                    expression: {q: "temperature<=20"}
                });
                expect(cso.notification.attrsFormat).toEqual("keyValues");

                done();
            }, 0);
        });

        it("connect (normalized data + subscription)", (done) => {
            MashupPlatform.operator.outputs.entityOutput.connect(true);
            MashupPlatform.prefs.set('attrs_format', 'normalized');
            MashupPlatform.prefs.set('ngsi_update_attributes', 'location');

            operator.init();

            // Wait until initial queries are processed
            setTimeout(() => {
                // List Entities Options
                var leo = operator.connection.v2.listEntities.calls.mostRecent().args[0];
                expect(leo.keyValues).toEqual(false);

                // Create Subscription Options
                var cso = operator.connection.v2.createSubscription.calls.mostRecent().args[0];

                expect(cso.notification.attrsFormat).toEqual("normalized");

                done();
            }, 0);
        });

        it("updates ngsi connection on prefs change", () => {
            MashupPlatform.operator.outputs.entityOutput.connect(true);

            operator.init();
            var initial_connection = operator.connection;
            expect(initial_connection).not.toEqual(null);

            MashupPlatform.prefs.simulate({
                'ngsi_server': 'https://orion2.example.com',
            });

            expect(initial_connection.v2.deleteSubscription).not.toHaveBeenCalled();
            expect(abort_mock).toHaveBeenCalled();
            expect(operator.connection).not.toEqual(initial_connection);
            expect(NGSI.Connection).toHaveBeenCalledWith('https://orion2.example.com', {
                ngsi_proxy_url: 'https://ngsiproxy.example.com',
                request_headers: {
                    'FIWARE-Service': 'Tenant',
                    'FIWARE-ServicePath': '/Spain/Madrid'
                },
                use_user_fiware_token: false
            });
        });

        it("remove current subscription on prefs changes", (done) => {
            MashupPlatform.operator.outputs.entityOutput.connect(true);
            MashupPlatform.prefs.set('ngsi_update_attributes', 'location');

            operator.init();
            var initial_connection = operator.connection;
            expect(initial_connection).not.toEqual(null);

            // Wait until the subscription is created
            setTimeout(() => {
                expect(operator.subscriptionId).toEqual('5a291bb652c2f6bef3e02fd9');

                MashupPlatform.prefs.simulate({
                    'ngsi_server': 'https://orion2.example.com',
                });

                // Wait until subscription is deleted
                setTimeout(() => {
                    expect(initial_connection.v2.deleteSubscription).toHaveBeenCalled();
                    expect(abort_mock).toHaveBeenCalled();
                    expect(operator.connection).not.toEqual(initial_connection);
                    expect(NGSI.Connection).toHaveBeenCalledWith('https://orion2.example.com', {
                        ngsi_proxy_url: 'https://ngsiproxy.example.com',
                        request_headers: {
                            'FIWARE-Service': 'Tenant',
                            'FIWARE-ServicePath': '/Spain/Madrid'
                        },
                        use_user_fiware_token: false
                    });

                    done();
                }, 0);
            }, 0);
        });

        it("cancel pending queries before unloading", () => {
            MashupPlatform.operator.outputs.entityOutput.connect(true);
            operator.init();
            var connection = operator.connection;

            // Call beforeunload listener
            window.addEventListener.calls.mostRecent().args[1]();
            expect(abort_mock).toHaveBeenCalled();
            expect(connection.v2.deleteSubscription).not.toHaveBeenCalled();
            expect(operator.query_task).toBe(null);
        });

        it("cancel subscriptions before unloading", (done) => {
            MashupPlatform.operator.outputs.entityOutput.connect(true);
            MashupPlatform.prefs.set('ngsi_update_attributes', 'location');
            operator.init();
            var connection = operator.connection;

            // Wait until subscription is created
            setTimeout(() => {
                expect(operator.subscriptionId).toBe("5a291bb652c2f6bef3e02fd9");

                // Call beforeunload listener
                window.addEventListener.calls.mostRecent().args[1]();
                expect(connection.v2.deleteSubscription).toHaveBeenCalled();
                expect(operator.query_task).toBe(null);

                done();
            });
        });

    });

})();
