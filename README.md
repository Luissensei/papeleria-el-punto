# Sistema de Gestión de Inventarios — Papelería El Punto

Aplicación web para administrar inventario, ventas, domicilios, pagos de empleados, gastos y proveedores. Incluye interfaces para administrador, vendedor y cliente.

**Tecnologías:** Java 17, Spring Boot 3.3.5, Spring Data JPA, MySQL 8, HTML, CSS y JavaScript.

## Requisitos

- JDK 17 o superior compatible con Spring Boot 3.
- Maven 3.6.3 o superior.
- MySQL 8 / XAMPP con MySQL iniciado.

## Instalación desde una base nueva

1. Inicia MySQL desde XAMPP.
2. Abre phpMyAdmin y selecciona **Importar**.
3. Importa `database/papeleria.sql`. El archivo crea la base `papeleria_el_punto` si no existe y crea las tablas y datos iniciales sin borrar la base completa.
4. Revisa `src/main/resources/application.properties`. Por defecto usa `localhost:3306`, base `papeleria_el_punto`, usuario `root` y contraseña vacía. Ajusta esos valores si tu MySQL tiene otra configuración.
5. En la carpeta del proyecto ejecuta `mvn spring-boot:run`.
6. Abre `http://localhost:8080`.

**Importante:** el script de creación no elimina bases ni tablas existentes. Está preparado para una base nueva o una estructura compatible. Antes de ejecutar scripts SQL sobre una base con información importante, realiza una copia de seguridad.

## Actualizar una base existente

Si tu base ya existe y todavía no tiene la columna `venta.metodo_pago`, selecciona primero la base `papeleria_el_punto` en phpMyAdmin y ejecuta `database/actualizar_metodo_pago.sql`. La migración comprueba si la columna existe y evita intentar agregarla dos veces. No ejecutes `database/papeleria.sql` para actualizar una base en producción; ese archivo es para inicializar la estructura.

## Cuentas de demostración

| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | `admin` | `admin123` |
| Vendedor | `vendedor1` | `vend123` |
| Cliente | `cliente1` | `cli123` |

Son credenciales de demostración incluidas en el SQL inicial. No deben reutilizarse en un sistema publicado en internet.

## Estructura principal

- `src/main/java`: aplicación Spring Boot, controladores, entidades, repositorios y servicios.
- `src/main/resources/static`: pantallas, estilos, scripts e imágenes.
- `database/papeleria.sql`: creación inicial de base de datos, tablas y datos de demostración.
- `database/actualizar_metodo_pago.sql`: migración compatible para bases anteriores.
- `docs/DOCUMENTACION.md`: documentación técnica y funcional.

## Repositorio

El proyecto se versiona con Git. Los archivos generados de Maven (`target/`) están excluidos mediante `.gitignore` y no deben subirse al repositorio.

## Alcance del pago

La aplicación registra el método elegido (efectivo, transferencia o tarjeta); no procesa pagos electrónicos ni verifica automáticamente transferencias.
