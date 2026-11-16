# Sistema de Gestión de Inventarios "El Punto"

Aplicación web para la Papelería El Punto (Cartagena): inventario, ventas con factura, domicilios, nómina, gastos y proveedores, con tres interfaces según el rol (Administrador, Vendedor, Cliente).

**Stack:** Java 17 · Spring Boot 3 (API REST) · MySQL · HTML + CSS + JavaScript.

## Cómo ejecutarlo

1. Instala **JDK 17**, **Maven** y **XAMPP** (o cualquier MySQL 8).
2. Inicia MySQL desde XAMPP.
3. Importa `database/papeleria.sql` (en phpMyAdmin → Importar, o `mysql -u root < database/papeleria.sql`).
4. Revisa usuario y contraseña de MySQL en `src/main/resources/application.properties`.
5. En la carpeta del proyecto ejecuta: `mvn spring-boot:run`
6. Abre http://localhost:8080

En Visual Studio Code instala "Extension Pack for Java" y "Spring Boot Extension Pack", abre la carpeta y ejecuta `PapeleriaApplication`.

## Cuentas de prueba

| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | admin | admin123 |
| Vendedor | vendedor1 | vend123 |
| Cliente | cliente1 | cli123 |

## Documentación

Toda la explicación (arquitectura, cada archivo, base de datos, API, cálculo del domicilio, limitaciones) está en [`docs/DOCUMENTACION.md`](docs/DOCUMENTACION.md).

## Subirlo a GitHub

```bash
git init
git add .
git commit -m "Proyecto El Punto: versión inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git push -u origin main
```

## Actualización: métodos de pago y miniaturas del carrito

- La interfaz del cliente permite seleccionar `EFECTIVO`, `TRANSFERENCIA` o `TARJETA`; no solicita efectivo recibido ni calcula cambio.
- El punto de venta del vendedor conserva el registro del efectivo recibido y el cálculo del cambio.
- Las ventas guardan el método de pago en la columna `venta.metodo_pago`.
- Las miniaturas del carrito muestran la imagen configurada en el producto; si no carga, se muestra un icono de categoría como respaldo.

### Si ya tienes creada la base de datos

Como este proyecto usa `spring.jpa.hibernate.ddl-auto=none`, ejecuta una sola vez el archivo `database/actualizar_metodo_pago.sql` en la base de datos `papeleria`. Si vas a crear una base nueva desde cero, el esquema actualizado `database/papeleria.sql` ya incluye la columna.

Nota: seleccionar transferencia o tarjeta registra la preferencia del cliente; no procesa automáticamente el pago ni confirma una transferencia.
