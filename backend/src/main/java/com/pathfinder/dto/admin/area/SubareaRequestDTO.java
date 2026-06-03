package com.pathfinder.dto.admin.area;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubareaRequestDTO {

    private String nombreSubarea;
    private String descripcionGeneral;
    private String imagenUrl;
    private String iconoUrl;
}