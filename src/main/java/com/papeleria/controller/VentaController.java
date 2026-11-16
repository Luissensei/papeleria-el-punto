package com.papeleria.controller;

import com.papeleria.dto.VentaRequest;
import com.papeleria.model.Venta;
import com.papeleria.repository.VentaRepository;
import com.papeleria.service.VentaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {
    private final VentaService service;
    private final VentaRepository repo;

    @GetMapping
    public List<Venta> listar() { return repo.findAllByOrderByFechaDesc(); }

    @PostMapping
    public Venta crear(@RequestBody VentaRequest r) { return service.crear(r); }

    @PutMapping("/{id}/cancelar")
    public Venta cancelar(@PathVariable Long id) { return service.cancelar(id); }
}
