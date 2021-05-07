Introduction
------------

This operator allows you to use any [Orion Context Broker][orion] server as
source of data. This is accomplished by creating a subscription to obtain real
time notifications about changes on the entities of interest.

Settings
--------

- **NGSI server URL:** URL of the Orion Context Broker to use for retrieving
  entity information.
- **NGSI proxy URL:** URL of the Orion Context Broker proxy to use for receiving
  notifications about changes.
- **Use the FIWARE credentials of the user:** Use the FIWARE credentials of the
  user logged into WireCloud. Take into account this option cannot be enabled if
  you want to use this widget in a public workspace as anonoymous users doesn't
  have a valid FIWARE auth token. As an alternative, you can make use of the
  "Use the FIWARE credentials of the workspace owner" preference.
- **Use the FIWARE credentials of the dashboard owner**: Use the FIWARE
  credentials of the owner of the workspace. This preference takes preference
  over "Use the FIWARE credentials of the user".
- **Tenant**: Tenant/service to use when connecting to the context
  broker. Must be a string of alphanumeric characters (lowercase) and the `_`
  symbol. Maximum length is 50 characters. If empty, the default tenant will be
  used.
- **Service path**: Scope/path to use when connecting to the context broker. Must
  be a string of alphanumeric characters (lowercase) and the `_` symbol
  separated by `/` slashes. Maximum length is 50 characters. If empty, the
  default service path will be used: `/`
- **NGSI entity types:** A comma separated list of entity types to use for
  filtering entities from the Orion Context broker. Leave this field empty If
  you don't want to filter entities by type.
- **Id pattern:** Id pattern for filtering entities. This preference can be
  empty, in that case, entities won't be filtered by id.
- **Query:** Filter entities by providing a query using the Simple Query
  Language.
- **Monitored NGSI Attributes:** Attributes to monitor for updates. Those
  changes are tracked by creating a subscription inside the context broker. If
  this list is empty, that subscription won't be created. Use `*` to subscribe
  to changes on any attribute.
- **attributes format ('keyValues', 'normalized' or 'values'):** Specifies how
  the entities are represented in notifications. Accepted values are 'normalized'
  (default), 'keyValues' or 'values'.


Wiring
------

Input Endpoints:

* This widget has no input endpoint

Output Endpoints:

-   **Entities:** This endpoint is used for sending initial entities as well as
    any updates received as part of the created subscription. This endpoint
    provides such entities updates using chunks of entities using the
    `keyValues` format. E.g:

        :::json
        [
            {
                "id": "van4",
                "type": "Vehicle",
                "location": {
                    "type": "Point",
                    "coordinates": [-3.7967205, 43.47173]
                }
            },
            {
                "id": "van10",
                "type": "Vehicle",
                "location": {
                    "type": "Point",
                    "coordinates": []
                }
            }
        ]

-   **Normalized Entities**: This endpoint is used for sending initial entities
    as well as any updates received as part of the created subscription. This
    endpoint provides such entities updates using chunks of entities using the
    `normalized` format. E.g:

        :::json
        [
            {
                "id": "madrid-bici-2",
                "type": "BikeHireDockingStation",
                "address": {
                    "type": "Text",
                    "value": "Puerta del Sol n\u00ba 1",
                    "metadata": {}
                },
                "availableBikeNumber": {
                    "type": "Number",
                    "value": 22,
                    "metadata": {}
                },
                "freeSlotNumber": {
                    "type": "Number",
                    "value": 2,
                    "metadata": {}
                },
                "location": {
                    "type": "geo:json",
                    "value": {
                        "type": "Point",
                        "coordinates": [
                            -3.7024207,
                            40.4170009
                        ]
                    },
                    "metadata": {}
                }
            },
            {
                "id": "madrid-bici-1",
                "type": "BikeHireDockingStation",
                "address": {
                    "type": "Text",
                    "value": "Puerta del Sol n\u00ba 1",
                    "metadata": {}
                },
                "availableBikeNumber": {
                    "type": "Number",
                    "value": 17,
                    "metadata": {}
                },
                "freeSlotNumber": {
                    "type": "Number",
                    "value": 6,
                    "metadata": {}
                },
                "location": {
                    "type": "geo:json",
                    "value": {
                        "type": "Point",
                        "coordinates": [
                            -3.7024255,
                            40.4168961
                        ]
                    },
                    "metadata": {}
                }
            }
        ]


References
----------

* [Orion Context Broker][orion]

[orion]: https://fiware-orion.readthedocs.io/en/master/ "Orion Context Broker info"
