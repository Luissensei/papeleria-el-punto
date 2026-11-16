package com.papeleria.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "producto")
@Getter @Setter
public class Producto implements HasId {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String codigo;
    private String nombre;
    private String categoria;
    private Double precioVenta = 0.0;
    private Double precioCosto = 0.0;
    private Integer stock = 0;
    private Integer stockMinimo = 5;
    private String imagenUrl;
    private Boolean activo = true;
    @ManyToOne
    @JoinColumn(name = "proveedor_id")
    private Proveedor proveedor;

    @PrePersist @PreUpdate
    void validar() {
        if (codigo == null || codigo.isBlank()) throw new IllegalArgumentException("El código es obligatorio");
        if (nombre == null || nombre.isBlank()) throw new IllegalArgumentException("El nombre es obligatorio");
        if (precioVenta < 0 || precioCosto < 0) throw new IllegalArgumentException("Los precios no pueden ser negativos");
        if (stock < 0) throw new IllegalArgumentException("El stock no puede ser negativo");
        codigo = codigo.trim().toUpperCase();
    }

    public Double getMargen() { return precioVenta - precioCosto; }
    public boolean isStockBajo() { return stock <= stockMinimo; }
    @Override public boolean desactivar() { activo = false; return true; }
}
