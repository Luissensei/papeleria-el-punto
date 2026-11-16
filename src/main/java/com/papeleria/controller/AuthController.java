package com.papeleria.controller;

import com.papeleria.model.Usuario;
import com.papeleria.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UsuarioRepository usuarios;

    public record LoginRequest(String usuario, String password, String rol) {}

    @PostMapping("/login")
    public Usuario login(@RequestBody LoginRequest r) {
        return usuarios.findByUsuarioAndPasswordAndRolAndActivoTrue(r.usuario(), r.password(), Usuario.Rol.valueOf(r.rol()))
                .orElseThrow(() -> new IllegalArgumentException("Usuario, contraseña o rol incorrectos"));
    }

    /** Un cliente crea su propio perfil: el rol siempre queda como CLIENTE. */
    @PostMapping("/registro")
    public Usuario registro(@RequestBody Usuario u) {
        if (u.getUsuario() == null || u.getUsuario().isBlank() || u.getPassword() == null || u.getPassword().isBlank())
            throw new IllegalArgumentException("Usuario y contraseña son obligatorios");
        if (usuarios.existsByUsuario(u.getUsuario())) throw new IllegalArgumentException("Ese nombre de usuario ya existe");
        u.setId(null);
        u.setRol(Usuario.Rol.CLIENTE);
        u.setSalario(0.0);
        u.setActivo(true);
        return usuarios.save(u);
    }
}
