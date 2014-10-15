NGSI Source Operator - User's Manual
====================================

Introduction
------------

This operator allows you to use any [Orion Context Broker][orion] server as
source of data. This is accomplished by creating a subscription to obtain real
time notifications about changes on the entities of interest.

**NOTE:** This operator creates subscriptions using the *flat* option of the
WireCloud's NGSI API making impossible to use this operator with entities that
doesn't meet the following assumptions:

* given an entity id there is only one value for the entity's type parameter
* entities doesn't have attributes called id or type
* entities have only an attribute with a given name
* attribute types don't matter or are already known
* attribute metadata don't matter or is already known

Wiring
------

Input Endpoints:

* This widget has no output endpoint

Output Endpoints:

* **Provide entity:** This operator sends an event thought this endpoint for
each entity update retrieved from the context broker. In addition to this, this
operator send an event for every entity available initially on the context
broker.

  In any case, event data follows the format used by the NGSI API of WireCloud
  for returning. E.g.

    :::json
    {
        "id": "van4",
        "type": "Van",
        "current_position": "43.47173, -3.7967205"
    }


References
----------

* [Orion Context Broker][orion]

[orion]: http://catalogue.fi-ware.org/enablers/publishsubscribe-context-broker-orion-context-broker "Orion Context Broker info"
