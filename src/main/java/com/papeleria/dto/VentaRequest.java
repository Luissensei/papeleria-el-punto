package com.papeleria.dto;

import java.util.List;

/** Datos que envía el navegador para registrar una venta. */
public record VentaRequest(Long vendedorId, Long clienteId, String tipo, Double efectivo, String metodoPago,
                           String direccion, String telefono, Double distanciaKm, List<Item> items) {
    public record Item(Long productoId, Integer cantidad) {}
}
