## v4.0.0 (2017-12-07)

- Actualizado el operador para usar NGSIv2 (el soporte para NGSIv1 se ha
  eliminado)
- Ya no se convierten en minúsculas los valores de las cabeceras
  `FIWARE-Service` y `FIWARE-ServicePath`, dado que está dando problemas.
- Mejoras en la documentación
- A partir de ahora solo se creará una subscripción si el usuario configura
  algún atributo para monitorizar
- Las conexiones con el context broker solo se realizarán cuando el puerto de
  salida del operador esté conectado
- A partir de ahora las peticiones para obtener los valores inicial se
  cancelarán si el usuario cambia las preferencias del operador antes de que
  estas se completen.
- Conjunto inicial de tests usando Karma y Travis CI


## v3.0.8 (2016-12-12)

- Actualizadas los nombres de las cabeceras para las credenciales

## v3.0.7

- Arreglado fallo en las consultas iniciales

## v3.0.6

- Añadido soporte para la cabecera `Fiware-ServicePath` usada por el soporte
  para tenant/servicios del Orion Context Broker
- Cambiado el mecanismo para obtener los datos iniciales, a partir de esta
  versión se obtendran los datos usuando peticiones de consulta (`query`) en vez
  de depender de la notification inicial, dado que esta solo proporciona 20
  entidades como mucho. La implementación inicial solo pedirá 10000 entidades
  como mucho a base de consultas.
- Mejoras en los metadatos del operador


## v3.0.5

- Añadido soporte para la funcionalidad de tenants/servicios del Orion Context
  Broker


## v3.0.4

- Nueva licencia: Apache 2
- Añadido soporte experimental para usar los credenciales del dueño del panel
  con el fin de facilitar la compartición de paneles.


## v3.0.3

- Actualizadas las URLs de FIWARE Lab para que usen el nuevo dominio (fiware.org
  en vez de fi-ware.org)
- Mejorado el control de errores asi como el registro de estos.
- Añadido los metadatos sobre el gestor de incidencias del widget.


## v3.0.1

- Añadido soporte para usar los credenciales del usuario registrado actualmente
  en WireCloud.
- Actualizado el valor por defecto para el proxy NGSI con la URL de la nueva
  instancia de este en FIWARE Lab. Esta nueva instancia pretende arreglar los
  problemas surgidos por el uso del puerto 3000 (por ejemplo, los cortafuegos
  pueden bloquear el tráfico usando este puerto) así como los surgidos por la
  mezcla de los protocolos HTTP y HTTPS (los navegadores bloquean los contenidos
  HTTP si la página principal está en HTTPS).


## v3.0

- Añadido soporte para filtrar por identificador de entidad (usando expresiones regulares)


## v3.0a2

- Versión inicial de la guia de usuario (en inglés).


## v3.0a1

* Mejoras en los metadatos y documentación del operador.


## v2.99

Primera versión liberada del operador entity-service.

* Refactorizado el operador entity-service convirtiendolo en un operador genérico
* Añadidas nuevas preferencias para seleccionar las entidades y los atributos que serán gestionados por el operador.
