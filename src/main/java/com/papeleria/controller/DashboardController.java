package com.papeleria.controller;

import com.papeleria.model.*;
import com.papeleria.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final VentaRepository ventaRepo;
    private final ProductoRepository productoRepo;
    private final PagoEmpleadoRepository pagoRepo;
    private final GastoOperativoRepository gastoRepo;

    @GetMapping
    public Map<String, Object> resumen() {
        List<Venta> ventas = ventaRepo.findAll().stream().filter(v -> v.getEstado() != Venta.Estado.CANCELADA).toList();
        List<Producto> activos = productoRepo.findAll().stream().filter(p -> Boolean.TRUE.equals(p.getActivo())).toList();
        double ingresos = ventas.stream().mapToDouble(Venta::getTotal).sum();
        double ganancia = ventas.stream().mapToDouble(Venta::getGananciaTotal).sum();
        double pagos = pagoRepo.findAll().stream().mapToDouble(PagoEmpleado::getTotalPago).sum();
        double gastos = gastoRepo.findAll().stream().mapToDouble(GastoOperativo::getTotal).sum();

        Map<String, double[]> acum = new HashMap<>();
        for (Venta v : ventas)
            for (DetalleVenta d : v.getDetalles()) {
                double[] a = acum.computeIfAbsent(d.getProducto().getNombre(), k -> new double[2]);
                a[0] += d.getCantidad();
                a[1] += d.getSubtotal();
            }
        List<Map<String, Object>> top = acum.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue()[0], a.getValue()[0])).limit(5)
                .map(e -> Map.<String, Object>of("producto", e.getKey(), "unidades", (int) e.getValue()[0], "ingresos", e.getValue()[1]))
                .toList();

        Map<String, Object> r = new LinkedHashMap<>();
        r.put("ingresos", ingresos);
        r.put("gananciaBruta", ganancia);
        r.put("pagosEmpleados", pagos);
        r.put("gastosOperativos", gastos);
        r.put("utilidadNeta", ganancia - pagos - gastos);
        r.put("numeroVentas", ventas.size());
        r.put("productosActivos", activos.size());
        r.put("topProductos", top);
        r.put("stockBajo", activos.stream().filter(Producto::isStockBajo).toList());
        return r;
    }
}
