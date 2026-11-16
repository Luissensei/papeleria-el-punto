package com.papeleria.controller;

import com.papeleria.model.Usuario;
import com.papeleria.repository.UsuarioRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController extends CrudController<Usuario> {
    public UsuarioController(UsuarioRepository repo) { super(repo); }

    @Override @PostMapping
    public Usuario crear(@RequestBody Usuario u) {
        if (u.getPassword() == null || u.getPassword().isBlank()) throw new IllegalArgumentException("La contraseña es obligatoria");
        return super.crear(u);
    }

    /** Si el formulario deja la contraseña vacía al editar, se conserva la que ya tenía. */
    @Override @PutMapping("/{id}")
    public Usuario actualizar(@PathVariable Long id, @RequestBody Usuario u) {
        if (u.getPassword() == null || u.getPassword().isBlank())
            u.setPassword(obtenerPasswordActual(id));
        return super.actualizar(id, u);
    }

    private String obtenerPasswordActual(Long id) {
        return repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado")).getPassword();
    }
}
