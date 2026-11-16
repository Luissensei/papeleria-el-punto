package com.papeleria.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Cálculo del costo de domicilio.
 * Variable independiente: distancia d (km). Variable dependiente: costo C(d).
 * C(d) = tarifaBase + integral de 0 a d de p dx = tarifaBase + p * d   (p = precio por km, constante).
 */
@Service
public class DomicilioService {
    @Value("${domicilio.tarifa-base}") private double tarifaBase;
    @Value("${domicilio.precio-km}") private double precioKm;
    @Value("${domicilio.origen-lat}") private double origenLat;
    @Value("${domicilio.origen-lon}") private double origenLon;

    public double costo(double km) {
        if (km < 0) throw new IllegalArgumentException("La distancia no puede ser negativa");
        double c = tarifaBase + precioKm * km;
        return Math.ceil(c / 100.0) * 100.0; // se redondea hacia arriba a la centena
    }

    /** Distancia en línea recta entre dos puntos (fórmula de Haversine). */
    public double distanciaKm(double lat1, double lon1, double lat2, double lon2) {
        double r = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1), dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    public double getTarifaBase() { return tarifaBase; }
    public double getPrecioKm() { return precioKm; }
    public double getOrigenLat() { return origenLat; }
    public double getOrigenLon() { return origenLon; }
}
