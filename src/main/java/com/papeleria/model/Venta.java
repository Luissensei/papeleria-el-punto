package com.papeleria.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "venta")
@Getter @Setter
public class Venta implements HasId {
    public enum Tipo { MOSTRADOR, DOMICILIO }
    public enum Estado { COMPLETADA, EN_CAMINO, CANCELADA }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String numeroFactura;
    private LocalDateTime fecha = LocalDateTime.now();
    @ManyToOne @JoinColumn(name = "vendedor_id")
    private Usuario vendedor;
    @ManyToOne @JoinColumn(name = "cliente_id")
    private Usuario cliente;
    @Enumerated(EnumType.STRING)
    private Tipo tipoVenta = Tipo.MOSTRADOR;
    @Enumerated(EnumType.STRING)
    private Estado estado = Estado.COMPLETADA;
    private Double efectivoRecibido = 0.0;
    @Column(name = "metodo_pago", nullable = false, length = 20)
    private String metodoPago = "EFECTIVO";
    private String direccionDomicilio;
    private String telefonoDomicilio;
    private Double distanciaKm = 0.0;
    private Double costoDomicilio = 0.0;
    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<DetalleVenta> detalles = new ArrayList<>();

    public double getSubtotal() { return detalles.stream().mapToDouble(DetalleVenta::getSubtotal).sum(); }
    public double getTotal() { return getSubtotal() + costoDomicilio; }
    public double getGananciaTotal() { return detalles.stream().mapToDouble(DetalleVenta::getGanancia).sum(); }
    public double getCambio() { return Math.max(0, efectivoRecibido - getTotal()); }
}
