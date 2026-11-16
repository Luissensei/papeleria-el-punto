package com.papeleria.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "detalle_venta")
@Getter @Setter
public class DetalleVenta {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @JsonIgnore
    @ManyToOne @JoinColumn(name = "venta_id")
    private Venta venta;
    @ManyToOne @JoinColumn(name = "producto_id")
    private Producto producto;
    private Integer cantidad;
    private Double precioUnitario;
    private Double precioCosto;

    public double getSubtotal() { return precioUnitario * cantidad; }
    public double getGanancia() { return (precioUnitario - precioCosto) * cantidad; }
}
