package com.papeleria.service;

import com.papeleria.dto.VentaRequest;
import com.papeleria.model.*;
import com.papeleria.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VentaService {
    private final VentaRepository ventas;
    private final ProductoRepository productos;
    private final UsuarioRepository usuarios;
    private final DomicilioService domicilio;

    /** Registra la venta completa en una sola transacción: si algo falla, no se descuenta nada del stock. */
    @Transactional
    public Venta crear(VentaRequest r) {
        if (r.items() == null || r.items().isEmpty()) throw new IllegalArgumentException("El carrito está vacío");
        Venta v = new Venta();
        if (r.vendedorId() != null)
            v.setVendedor(usuarios.findById(r.vendedorId()).orElseThrow(() -> new IllegalArgumentException("Vendedor no existe")));
        if (r.clienteId() != null)
            v.setCliente(usuarios.findById(r.clienteId()).orElseThrow(() -> new IllegalArgumentException("Cliente no existe")));

        for (VentaRequest.Item it : r.items()) {
            Producto p = productos.findById(it.productoId())
                    .filter(x -> Boolean.TRUE.equals(x.getActivo()))
                    .orElseThrow(() -> new IllegalArgumentException("Producto no disponible"));
            if (it.cantidad() == null || it.cantidad() <= 0) throw new IllegalArgumentException("Cantidad inválida");
            if (p.getStock() < it.cantidad()) throw new IllegalArgumentException("Stock insuficiente para: " + p.getNombre());
            p.setStock(p.getStock() - it.cantidad());
            DetalleVenta d = new DetalleVenta();
            d.setVenta(v);
            d.setProducto(p);
            d.setCantidad(it.cantidad());
            d.setPrecioUnitario(p.getPrecioVenta());
            d.setPrecioCosto(p.getPrecioCosto());
            v.getDetalles().add(d);
        }

        if ("DOMICILIO".equals(r.tipo())) {
            if (r.direccion() == null || r.direccion().isBlank() || r.telefono() == null || r.telefono().isBlank())
                throw new IllegalArgumentException("Completa dirección y teléfono para el domicilio");
            double km = r.distanciaKm() == null ? 0 : r.distanciaKm();
            if (km <= 0) throw new IllegalArgumentException("Indica la distancia del domicilio en km");
            v.setTipoVenta(Venta.Tipo.DOMICILIO);
            v.setEstado(Venta.Estado.EN_CAMINO);
            v.setDireccionDomicilio(r.direccion().trim());
            v.setTelefonoDomicilio(r.telefono().trim());
            v.setDistanciaKm(km);
            v.setCostoDomicilio(domicilio.costo(km));
        }

        String metodoPago = r.metodoPago() == null || r.metodoPago().isBlank()
                ? "EFECTIVO" : r.metodoPago().trim().toUpperCase();
        if (!java.util.Set.of("EFECTIVO", "TRANSFERENCIA", "TARJETA").contains(metodoPago))
            throw new IllegalArgumentException("Método de pago no válido");
        v.setMetodoPago(metodoPago);

        // Solo el vendedor/cajero registra el efectivo recibido y el cambio.
        // El cliente únicamente indica su método de pago preferido al generar el pedido.
        if (r.vendedorId() != null) {
            double efectivo = r.efectivo() == null ? 0 : r.efectivo();
            if (efectivo < v.getTotal())
                throw new IllegalArgumentException("Efectivo insuficiente. Faltan: $" + Math.round(v.getTotal() - efectivo));
            v.setEfectivoRecibido(efectivo);
        } else {
            v.setEfectivoRecibido(0.0);
        }

        v = ventas.save(v);
        v.setNumeroFactura(String.format("FE-%06d", v.getId()));
        return ventas.save(v);
    }

    /** Cancela una venta y devuelve las unidades al inventario. */
    @Transactional
    public Venta cancelar(Long id) {
        Venta v = ventas.findById(id).orElseThrow(() -> new IllegalArgumentException("Venta no encontrada"));
        if (v.getEstado() == Venta.Estado.CANCELADA) throw new IllegalArgumentException("La venta ya estaba cancelada");
        for (DetalleVenta d : v.getDetalles()) {
            Producto p = d.getProducto();
            p.setStock(p.getStock() + d.getCantidad());
        }
        v.setEstado(Venta.Estado.CANCELADA);
        return v;
    }
}
