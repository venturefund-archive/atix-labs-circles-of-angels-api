
### Base de datos
--------

##### PostgreSQL


instalacion:
> `sudo -i -u postgres` (para entrar como usuario posgres)

> `createuser --interactive` (crearlo el nombre de usuario y darle permisos de creación de BD)

> asignarle un password, entrar en psql, `ALTER USER user_name  PASSWORD 'password';` (va con el ; tiene que tirar un ALTER ROLE)

> salir de psql `\q ` o  `ctrl + d`

>para crear una base, fuera de psql, `createdb db_name`

> poner el usuario como owner de la db, en psql, `ALTER DATABASE db_name OWNER TO new_owner;` (va con el ; tiene que tirar un ALTER DATABASE)

> crear shemas core y security, `CREATE SCHEMA schema_name AUTHORIZATION user_name;` 

> modificar el path de busqueda por defecto, `SET search_path TO db_name;`