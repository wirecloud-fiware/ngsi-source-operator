3.0.1
=====

* Añadido soporte para usar los credenciales del usuario registrado actualmente
  en WireCloud.
* Actualizado el valor por defecto para el proxy NGSI con la URL de la nueva
  instancia de este en FIWARE Lab. Esta nueva instancia pretende arreglar los
  problemas surgidos por el uso del puerto 3000 (por ejemplo, los cortafuegos
  pueden bloquear el tráfico usando este puerto) así como los surgidos por la
  mezcla de los protocolos HTTP y HTTPS (los navegadores bloquean los contenidos
  HTTP si la página principal está en HTTPS).

3.0
===

* Añadido soporte para filtrar por identificador de entidad (usando expresiones regulares)

3.0a2
=====

* Versión inicial de la guia de usuario (en inglés).

3.0a1
=====

* Mejoras en los metadatos y documentación del operador.

2.99
====

Primera versión liberada del operador entity-service.

* Refactorizado el operador entity-service convirtiendolo en un operador genérico
* Añadidas nuevas preferencias para seleccionar las entidades y los atributos que serán gestionados por el operador.
