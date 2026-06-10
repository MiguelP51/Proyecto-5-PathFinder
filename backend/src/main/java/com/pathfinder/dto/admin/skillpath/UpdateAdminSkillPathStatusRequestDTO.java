package com.pathfinder.dto.admin.skillpath;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateAdminSkillPathStatusRequestDTO {

    @NotNull(message = "Debe indicar si el SkillPath esta activo")
    private Boolean activo;
}