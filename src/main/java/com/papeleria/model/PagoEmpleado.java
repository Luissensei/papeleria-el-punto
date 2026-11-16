package com.papeleria.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "pago_empleado")
@Getter @Setter
public class PagoEmpleado implements HasId {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne @JoinColumn(name = "empleado_id")
    private Usuario empleado;
    private String periodo;
    private LocalDate fecha;
    private Double salarioBase = 0.0;
    private Double bonificacion = 0.0;
    private Double deducciones = 0.0;
    private String concepto;

    @PrePersist
    void antesDeGuardar() {
        if (fecha == null) fecha = LocalDate.now();
        if (empleado == null) throw new IllegalArgumentException("Selecciona un empleado");
    }

    public double getTotalPago() { return salarioBase + bonificacion - deducciones; }
}
