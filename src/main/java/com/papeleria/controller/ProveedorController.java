package com.papeleria.controller;

import com.papeleria.model.Proveedor;
import com.papeleria.repository.ProveedorRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/proveedores")
public class ProveedorController extends CrudController<Proveedor> {
    public ProveedorController(ProveedorRepository repo) { super(repo); }
}
