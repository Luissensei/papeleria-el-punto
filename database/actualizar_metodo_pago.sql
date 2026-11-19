-- Migración segura para bases antiguas. Ejecutar seleccionando primero papeleria_el_punto.
-- Si la columna ya existe, no realiza cambios.
SET @existe_metodo_pago = (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'venta'
    AND COLUMN_NAME = 'metodo_pago'
);
SET @sql_migracion = IF(
  @existe_metodo_pago = 0,
  'ALTER TABLE venta ADD COLUMN metodo_pago VARCHAR(20) NOT NULL DEFAULT ''EFECTIVO'' AFTER efectivo_recibido',
  'SELECT ''La columna metodo_pago ya existe; no se requiere migracion'' AS resultado'
);
PREPARE stmt_migracion FROM @sql_migracion;
EXECUTE stmt_migracion;
DEALLOCATE PREPARE stmt_migracion;
