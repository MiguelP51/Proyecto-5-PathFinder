package com.pathfinder.dto.admin.user;

import com.pathfinder.model.enums.RolUsuario;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateUserRoleRequestDTO {

    @NotNull(message = "El rol es obligatorio")
    private RolUsuario rol;
}