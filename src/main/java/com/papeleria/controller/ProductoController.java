package com.papeleria.controller;

import com.papeleria.model.Producto;
import com.papeleria.repository.ProductoRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/productos")
public class ProductoController extends CrudController<Producto> {
    public ProductoController(ProductoRepository repo) { super(repo); }
}
