package com.papeleria.repository;

import com.papeleria.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsuarioAndPasswordAndRolAndActivoTrue(String usuario, String password, Usuario.Rol rol);
    boolean existsByUsuario(String usuario);
}
