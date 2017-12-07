## v4.0.0 (2017-12-07)

- Updated to use NGSIv2 (NGSIv1 support dropped)
- Use case sensitive `FIWARE-Service` and `FIWARE-ServicePath` values to fix
  some problems
- Improved documentation
- Only create a subscription if the user configures attributes to monitor
- Connect to the context broker only after connecting the output endpoint
- Abort initial queries if the user changes operator preferences before
  retrieving initial values using previous configuration
- Initial test set using Karma and Travis CI


## v3.0.8 (2016-12-12)

- Use up to date credentials header names

## v3.0.7

- Fix bug in the initial queries

## v3.0.6

- Add support for the `Fiware-ServicePath` used by the tenant/service feature
  from the Orion Context Broker
- Request initial data using `query` operations instead of relying on the
  initial notification as this notification only provide 20 entities. Currently,
  this operator will request 10000 entities as maximum using those initial
  queries.
- Improved operator metadata


## v3.0.5

- Add support for the Orion Context Broker tenant/service feature


## v3.0.4

- New License: Apache 2
- Experimental support for using the credentials of the dashboard owner. This
  should provide a better experience for sharing workspaces in the future.


## v3.0.3

- Update FIWARE Lab URLs using the new schema (fiware.org instead of
  fi-ware.org)
- Improved error control and improve log generation.
- Added issue tracker metadata.


## v3.0.1

- Added support for using the credentials of the user currently logged in
  WireCloud.
- Updated the default NGSI proxy preference value so it points to the new NGSI
  proxy instance at FIWARE Lab. This pretends to fix problems raised by the use
  of port 3000 (e.g. firewalls may drop traffic using this port) and the ones
  raised by mixing contents comming from HTTP and HTTPS (browsers disallows
  contents coming from HTTP if the main web page uses HTTPS).


## v3.0

- Initial support for filtering entities by id (using ngsi regular expressions).


## v3.0a2

- Initial user's guide


## 3.0a1

* Improved operator's metadata/documentation


## 2.99

Initial entity-service operator release.

* Refactor entity-service making it usable for generic purposes
* Added new preferences (NGSI Entities & NGSI Attributes) to allow users to
  indicate what entities and what attributes will be handled by this concrete
  instance.
