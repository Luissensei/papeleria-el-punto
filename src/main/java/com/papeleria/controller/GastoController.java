package com.papeleria.controller;

import com.papeleria.model.GastoOperativo;
import com.papeleria.repository.GastoOperativoRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gastos")
public class GastoController extends CrudController<GastoOperativo> {
    public GastoController(GastoOperativoRepository repo) { super(repo); }

    @Override @PostMapping
    public GastoOperativo crear(@RequestBody GastoOperativo g) {
        g.getDetalles().forEach(d -> d.setGasto(g));
        return super.crear(g);
    }

    @Override @PutMapping("/{id}")
    public GastoOperativo actualizar(@PathVariable Long id, @RequestBody GastoOperativo g) {
        g.getDetalles().forEach(d -> d.setGasto(g));
        return super.actualizar(id, g);
    }
}
