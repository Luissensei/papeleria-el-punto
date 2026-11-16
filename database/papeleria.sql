DROP DATABASE IF EXISTS papeleria_el_punto;
CREATE DATABASE papeleria_el_punto CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE papeleria_el_punto;

-- Personas que usan el sistema: administradores, vendedores (empleados) y clientes. El campo rol define qué interfaz ven.
CREATE TABLE usuario (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  usuario VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(100) NOT NULL,
  rol VARCHAR(10) NOT NULL CHECK (rol IN ('ADMIN','VENDEDOR','CLIENTE')),
  salario DECIMAL(12,2) NOT NULL DEFAULT 0,
  direccion VARCHAR(150) NOT NULL DEFAULT '',
  telefono VARCHAR(20) NOT NULL DEFAULT '',
  activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- Empresas que surten mercancía a la papelería. Cada producto puede apuntar a su proveedor principal.
CREATE TABLE proveedor (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  nit VARCHAR(20) UNIQUE,
  telefono VARCHAR(20),
  email VARCHAR(100),
  direccion VARCHAR(150),
  activo BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- Catálogo e inventario: cada fila es un artículo con su precio de venta, su costo, su existencia y su imagen.
CREATE TABLE producto (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  categoria VARCHAR(50),
  precio_venta DECIMAL(12,2) NOT NULL CHECK (precio_venta >= 0),
  precio_costo DECIMAL(12,2) NOT NULL CHECK (precio_costo >= 0),
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  stock_minimo INT NOT NULL DEFAULT 5,
  imagen_url VARCHAR(255),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  proveedor_id BIGINT NULL,
  FOREIGN KEY (proveedor_id) REFERENCES proveedor(id)
) ENGINE=InnoDB;

-- Encabezado de cada factura: quién vendió, a quién, cuándo, el tipo (mostrador o domicilio) y los datos del envío.
CREATE TABLE venta (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  numero_factura VARCHAR(20) UNIQUE,
  fecha DATETIME NOT NULL,
  vendedor_id BIGINT NULL,
  cliente_id BIGINT NULL,
  tipo_venta VARCHAR(10) NOT NULL CHECK (tipo_venta IN ('MOSTRADOR','DOMICILIO')),
  estado VARCHAR(12) NOT NULL CHECK (estado IN ('COMPLETADA','EN_CAMINO','CANCELADA')),
  efectivo_recibido DECIMAL(12,2) NOT NULL DEFAULT 0,
  metodo_pago VARCHAR(20) NOT NULL DEFAULT 'EFECTIVO',
  direccion_domicilio VARCHAR(150),
  telefono_domicilio VARCHAR(20),
  distancia_km DECIMAL(8,2) NOT NULL DEFAULT 0,
  costo_domicilio DECIMAL(12,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (vendedor_id) REFERENCES usuario(id),
  FOREIGN KEY (cliente_id) REFERENCES usuario(id)
) ENGINE=InnoDB;

-- Líneas de cada factura: qué producto, cuántas unidades y a qué precio y costo se vendió en ese momento.
CREATE TABLE detalle_venta (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  venta_id BIGINT NOT NULL,
  producto_id BIGINT NOT NULL,
  cantidad INT NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(12,2) NOT NULL,
  precio_costo DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (venta_id) REFERENCES venta(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES producto(id)
) ENGINE=InnoDB;

-- Pagos de nómina hechos a los empleados vendedores, con salario base, bonificación y deducciones.
CREATE TABLE pago_empleado (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  empleado_id BIGINT NOT NULL,
  periodo VARCHAR(30) NOT NULL,
  fecha DATE NOT NULL,
  salario_base DECIMAL(12,2) NOT NULL,
  bonificacion DECIMAL(12,2) NOT NULL DEFAULT 0,
  deducciones DECIMAL(12,2) NOT NULL DEFAULT 0,
  concepto VARCHAR(100),
  FOREIGN KEY (empleado_id) REFERENCES usuario(id)
) ENGINE=InnoDB;

-- Encabezado de los gastos de funcionamiento del negocio (arriendo, servicios, aseo, etc.).
CREATE TABLE gasto_operativo (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  descripcion VARCHAR(150)
) ENGINE=InnoDB;

-- Líneas de cada gasto operativo: concepto, cantidad y valor unitario.
CREATE TABLE detalle_gasto (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  gasto_id BIGINT NOT NULL,
  concepto VARCHAR(100) NOT NULL,
  cantidad INT NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  valor_unitario DECIMAL(12,2) NOT NULL CHECK (valor_unitario >= 0),
  FOREIGN KEY (gasto_id) REFERENCES gasto_operativo(id) ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO usuario (nombre, usuario, password, rol, salario, direccion, telefono) VALUES
('Carlos Ramírez','admin','admin123','ADMIN',0,'Cartagena Centro','3001234567'),
('Ana González','vendedor1','vend123','VENDEDOR',1800000,'Calle 5 #10-20','3109876543'),
('Pedro Martínez','vendedor2','vend456','VENDEDOR',1800000,'Carrera 8 #3-15','3205551234'),
('Laura Torres','cliente1','cli123','CLIENTE',0,'Av. Blas de Lezo #22','3157654321'),
('Diego Herrera','cliente2','cli456','CLIENTE',0,'Calle 30 #5-40','3126543210');

INSERT INTO proveedor (nombre, nit, telefono, email, direccion) VALUES
('Distribuidora Escolar del Caribe','900111222-1','6055551111','ventas@descaribe.co','Zona Industrial Mamonal'),
('Papeles y Más S.A.S.','900333444-5','6055552222','pedidos@papelesymas.co','Barrio Manga');

INSERT INTO producto (codigo, nombre, categoria, precio_venta, precio_costo, stock, stock_minimo, proveedor_id) VALUES
('P001','Cuaderno Norma Grande','Cuadernos',3500,2200,45,5,1),
('P002','Lápiz Mongol 2B','Escritura',500,300,120,10,1),
('P003','Borrador Pelikan','Escritura',800,500,60,8,1),
('P004','Colores Faber 12und','Arte',8500,5500,30,5,1),
('P005','Resaltador Stabilo','Marcadores',2500,1500,4,5,2),
('P006','Carpeta Argollada','Archivos',12000,7500,25,5,2),
('P007','Tijeras Maped','Manualidades',4500,2800,20,5,2),
('P008','Pegante Colbón','Adhesivos',3200,1800,35,5,2),
('P009','Block Iris','Papel',6000,3800,3,5,2),
('P010','Resma Papel Carta','Papel',14000,9000,18,5,2);

INSERT INTO gasto_operativo (fecha, categoria, descripcion) VALUES ('2026-10-01','Servicios','Servicios públicos de octubre');
INSERT INTO detalle_gasto (gasto_id, concepto, cantidad, valor_unitario) VALUES
(1,'Energía eléctrica',1,185000),(1,'Agua',1,62000),(1,'Internet',1,90000);
