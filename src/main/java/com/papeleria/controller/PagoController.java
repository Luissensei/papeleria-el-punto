package com.papeleria.controller;

import com.papeleria.model.PagoEmpleado;
import com.papeleria.repository.PagoEmpleadoRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pagos")
public class PagoController extends CrudController<PagoEmpleado> {
    public PagoController(PagoEmpleadoRepository repo) { super(repo); }
}
