## DB Models

* Todos los esquemas tienen un id unico en su tabla, y fecha de creación y actualizacion

### User:
_Representa a un usuario de Circles Of Angels, este puede ser : Social entrepreneur, Funder, Oracle, Backoffice Administrator_
  #####  Atributos:
  - `userId`: id del usuario en el dominio del negocio
  - `name`: nombre con el cual se mostrará el usuario
  - `email`: email con el cual se registra el usuario
  - `pwd`: password con el cual se loguea el usuario
  - `roles`: rol/roles que tiene el usuario en la herramienta (este puede ser por ejemplo Funder y Oracle a la vez)  

----
### Project:
  _Representa un proyecto de Circles Of Angels_
  #####  Atributos:
  - `projectId`: id del proyecto en el dominio de negocio
  - `name`: nombre con el cual se mostrará el usuario
  - `owner`: el id del usuario quien creó el proyecto
  - `description`: descripcion del proyecto

----
### Fund Transfer:
  _Representa una transferencia **bancaria**, entre cuentas bancarias de **usuarios** de Circles of Angels_
  #####  Atributos:
  - `transferId`: id unico de la transferencia bancaria realizada
  - `senderId`: id del usuario que envia
  - `destinationAccount`: id del usuario que recibe
  - `projectId`: el id del proyecto al cual pertenece esta transferencia bancaria
  - `amount`: cantidad de dinero transferida
  - `currency`: moneda en la cual se realizó la transferencia

