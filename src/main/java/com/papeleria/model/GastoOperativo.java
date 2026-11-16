package com.papeleria.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "gasto_operativo")
@Getter @Setter
public class GastoOperativo implements HasId {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate fecha;
    private String categoria;
    private String descripcion;
    @OneToMany(mappedBy = "gasto", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<DetalleGasto> detalles = new ArrayList<>();

    @PrePersist
    void antesDeGuardar() { if (fecha == null) fecha = LocalDate.now(); }

    public double getTotal() { return detalles.stream().mapToDouble(DetalleGasto::getSubtotal).sum(); }
}
