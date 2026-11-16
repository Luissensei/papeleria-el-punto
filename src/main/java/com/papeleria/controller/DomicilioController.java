package com.papeleria.controller;

import com.papeleria.service.DomicilioService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/domicilio")
@RequiredArgsConstructor
public class DomicilioController {
    private final DomicilioService servicio;

    /** Costo a partir de una distancia en km. */
    @GetMapping("/costo")
    public Map<String, Object> costo(@RequestParam double km) {
        return Map.of("distanciaKm", km, "tarifaBase", servicio.getTarifaBase(),
                "precioKm", servicio.getPrecioKm(), "costo", servicio.costo(km));
    }

    /** Costo desde la papelería (punto x) hasta unas coordenadas de destino (punto y). */
    @GetMapping("/costo-por-coordenadas")
    public Map<String, Object> costoPorCoordenadas(@RequestParam double lat, @RequestParam double lon) {
        double km = servicio.distanciaKm(servicio.getOrigenLat(), servicio.getOrigenLon(), lat, lon);
        return Map.of("distanciaKm", Math.round(km * 100) / 100.0, "costo", servicio.costo(km));
    }
}
