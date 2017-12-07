/* globals MashupPlatform, MockMP, beforeAll, afterAll, beforeEach, NGSISource */

(function () {

    "use strict";

    describe("NGSI Source operator should", function () {

        var operator, abort_mock;

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
                    'use_user_fiware_token': false
                },
                outputs: ['entityOutput']
            });
        });

        beforeEach(function () {
            MashupPlatform.reset();
            MashupPlatform.resetData();
            operator = new NGSISource();
            abort_mock = jasmine.createSpy('abort');
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
                            var p = Promise.resolve();
                            p.then = () => {
                                return {abort: abort_mock};
                            };
                            return p;
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

        it("connect on init", () => {
            MashupPlatform.operator.outputs.entityOutput.connect(true);

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

    });

})();
