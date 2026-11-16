package com.papeleria.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "proveedor")
@Getter @Setter
public class Proveedor implements HasId {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String nit;
    private String telefono;
    private String email;
    private String direccion;
    private Boolean activo = true;

    @Override public boolean desactivar() { activo = false; return true; }
}
