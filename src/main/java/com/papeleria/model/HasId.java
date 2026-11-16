package com.papeleria.model;

/** Contrato común de las entidades: permite que CrudController asigne el id y desactive registros. */
public interface HasId {
    void setId(Long id);

    /** Las entidades con campo "activo" lo sobrescriben y devuelven true; las demás se borran de verdad. */
    default boolean desactivar() { return false; }
}
