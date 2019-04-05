## DB Models

* Todos los esquemas tienen un id unico en su tabla, y fecha de creación y actualizacion




### User:
_Representa a un usuario de Circles Of Angels, este puede ser : Social entrepreneur, Funder, Oracle, Backoffice Administrator_
  #####  Atributos:
  - `id`: id del usuario en el dominio del negocio
  - `name`: nombre con el cual se mostrará el usuario
  - `email`: email con el cual se registra el usuario
  - `pwd`: password con el cual se loguea el usuario
  - `roles`: rol/roles que tiene el usuario en la herramienta (este puede ser por ejemplo Funder y Oracle a la vez)  

----
### Project:
  _Representa un proyecto de Circles Of Angels_
  #####  Atributos:
  - `id`: id del proyecto en el dominio de negocio
  - `projectName`: nombre con el cual se mostrará el usuario
  - `ownerId`: id del usurio quien es el creador
  - `mission`: misión del proyecto
  - `problemAddressed`: problema que aborda el proyecto
  - `location`: lugar geografico donde va a desarrollarse el proyecto
  - `timeframe`: duracion de tiempo del proyecto
  - `coverPhoto`: imagen de portada del proyecto
  - `cardPhoto`: icono del proyecto
  - `status`: estado actual del proyecto
  - `goalAmount`: cantidad de dinero necesaria del proyecto
  - `faqLink`: vinculo a la pagina de preguntas frecuentes
  - `pitchProposal`: propuesta inicial del proyecto
  - `milestonesFile`: archivo de excel de milestones
  - `projectAgreement`: archivo de consenso del proyecto

----

### Project Status:
_Representa el estado de un proyecto en particular_
  #### Atributos:
  - `name`: nombre del estado
  - `status`: representacion numerica del estado

----


### User Project:
_Representa una relacion entre un usuario y un proyecto_
  #### Atributos:
  - `status`: estado en el que está el usuario con respecto a un proyecto
  - `userId`: id del usuario
  - `projectId`: id del proyecto


----

### Milestone:
  - `id`: id del milestone
  - `projectId`: id del proyecto al cual pertenece
  - `quarter`: quarter al cual pertenece
  - `tasks`: tareas a realizar en el milestone actual
  - `impact`:  
  - `impactCriterion`:
  - `signsOfSuccess`:
  - `signsOfSuccessCriterion`:
  - `category`:
  - `keyPersonnel`:
  - `budget`:

----

### Activity:
  - `id`:
  - `milestoneId`:
  - `tasks`:
  - `impact`:
  - `impactCriterion`:
  - `signsOfSuccess`:
  - `signsOfSuccessCriterion`:
  - `category`:
  - `keyPersonnel`:
  - `budget`:

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

----

### Transfer Status:
_Representa el estado actual de una transferencia bancaria_
  - `name`: nombre del estado 
  - `status`: representacion numerica del estado

----


### Configs:
_Representa una configuracion general de la API_
  - `key`: clave unica de una configuracion
  - `value`: el valor de dicha configuracion
