package com.pathfinder.dto.admin.manage_skillpath;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class BulkAdminManageSkillPathResultDTO {
    private int procesados;
    private int creados;
    private int errores;
    private List<String> detalleErrores;
}
