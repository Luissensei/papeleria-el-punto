package com.papeleria.config;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/** Convierte cualquier error en un JSON {"mensaje": "..."} que el frontend muestra al usuario. */
@RestControllerAdvice
public class ManejadorErrores {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> integridad(DataIntegrityViolationException e) {
        return ResponseEntity.badRequest()
                .body(Map.of("mensaje", "Ya existe un registro con ese valor único o falta un dato obligatorio"));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> general(RuntimeException e) {
        Throwable t = e;
        while (t.getCause() != null) t = t.getCause();
        int estado = (t instanceof IllegalArgumentException) ? 400 : 500;
        return ResponseEntity.status(estado).body(Map.of("mensaje", String.valueOf(t.getMessage())));
    }
}
