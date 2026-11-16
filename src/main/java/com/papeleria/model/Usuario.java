package com.papeleria.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "usuario")
@Getter @Setter
public class Usuario implements HasId {
    public enum Rol { ADMIN, VENDEDOR, CLIENTE }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    @Column(unique = true, nullable = false)
    private String usuario;
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
    @Enumerated(EnumType.STRING)
    private Rol rol = Rol.CLIENTE;
    private Double salario = 0.0;
    private String direccion = "";
    private String telefono = "";
    private Boolean activo = true;

    @Override public boolean desactivar() { activo = false; return true; }
}
