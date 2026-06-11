package com.pathfinder.dto.admin.curso;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateProveedorRequestDTO {

    @NotBlank(message = "El nombre del proveedor es obligatorio")
    private String nombre;

    @NotNull(message = "Debe indicar si soporta API")
    private Boolean soportaApi;

    private String credenciales;
}
