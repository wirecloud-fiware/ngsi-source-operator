3.0.3
=====

* Update FIWARE Lab URLs using the new schema (fiware.org instead of
  fi-ware.org)
* Improved error control and improve log generation.
* Added issue tracker metadata.

3.0.1
=====

* Added support for using the credentials of the user currently logged in
  WireCloud.
* Updated the default NGSI proxy preference value so it points to the new NGSI
  proxy instance at FIWARE Lab. This pretends to fix problems raised by the use
  of port 3000 (e.g. firewalls may drop traffic using this port) and the ones
  raised by mixing contents comming from HTTP and HTTPS (browsers disallows
  contents coming from HTTP if the main web page uses HTTPS).

3.0
===

* Initial support for filtering entities by id (using ngsi regular expressions).

3.0a2
=====

* Initial user's guide

3.0a1
=====

* Improved operator's metadata/documentation

2.99
====

Initial entity-service operator release.

* Refactor entity-service making it usable for generic purposes
* Added new preferences (NGSI Entities & NGSI Attributes) to allow users to
  indicate what entities and what attributes will be handled by this concrete
  instance.
