package com.papeleria.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "detalle_gasto")
@Getter @Setter
public class DetalleGasto {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @JsonIgnore
    @ManyToOne @JoinColumn(name = "gasto_id")
    private GastoOperativo gasto;
    private String concepto;
    private Integer cantidad = 1;
    private Double valorUnitario = 0.0;

    public double getSubtotal() { return cantidad * valorUnitario; }
}
