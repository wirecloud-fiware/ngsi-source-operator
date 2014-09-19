NGSI Source Operator - User's Manual
====================================

Introduction
------------

This operator allows you to use any [Orion Context Broker][orion] server as
source of data. This is accomplished by creating a subscription to obtain real
time notifications about changes on the entities of interest.

Wiring
------

Input Endpoints:

* This widget has not output endpoint

Output Endpoints:

    :::json
    {
        "datasets": {
            "0": {"label": "Dataset 1"},
            "1": {"label": "Dataset 2"}
        },
        "data": {
            "0": [[0, 6], [1, 10], [2, 3], [3, 9]],
            "1": [[0.5, 8], [1.5, 10], [2.5, 2], [3.5, 10]]
        }
    }


References
----------

* [Orion Context Broker][orion]

[orion]: http://catalogue.fi-ware.org/enablers/publishsubscribe-context-broker-orion-context-broker "Orion Context Broker info"
