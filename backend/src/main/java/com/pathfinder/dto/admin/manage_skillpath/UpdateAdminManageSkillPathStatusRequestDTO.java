package com.pathfinder.dto.admin.manage_skillpath;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateAdminManageSkillPathStatusRequestDTO {
    @NotNull(message = "El estado (activo) es obligatorio")
    private Boolean activo;
}
