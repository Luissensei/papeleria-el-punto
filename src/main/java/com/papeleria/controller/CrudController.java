package com.papeleria.controller;

import com.papeleria.model.HasId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Controlador base con las 5 operaciones CRUD. Cada controlador hijo solo define su ruta y su repositorio. */
public abstract class CrudController<T extends HasId> {
    protected final JpaRepository<T, Long> repo;

    protected CrudController(JpaRepository<T, Long> repo) { this.repo = repo; }

    @GetMapping
    public List<T> listar() { return repo.findAll(); }

    @GetMapping("/{id}")
    public T obtener(@PathVariable Long id) {
        return repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Registro no encontrado"));
    }

    @PostMapping
    public T crear(@RequestBody T t) { t.setId(null); return repo.save(t); }

    @PutMapping("/{id}")
    public T actualizar(@PathVariable Long id, @RequestBody T t) { t.setId(id); return repo.save(t); }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        T t = obtener(id);
        if (t.desactivar()) repo.save(t); else repo.deleteById(id);
    }
}
